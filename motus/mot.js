const express = require('express')
const fs = require('fs');
var session = require('express-session')
const RedisStore = require("connect-redis").default
const { createClient } = require('redis');
const seedrandom = require('seedrandom');

const app = express()
const port = 3000

let redisClient = createClient({
  host: '127.0.0.1',
  port: 6379,
})

redisClient.connect().catch(console.error)

const redisStore = new RedisStore({
  client: redisClient,
  ttl: 3600,
})

app.use(session({
  store: redisStore,
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
})) 
/*app.use( (req, res) => {
  if (req.session.user == undefined){
    const redirectUrl = 'http://localhost:3005/authorize';
    const openidParams = {
      client_id: 'motus',
      redirect_uri: 'http://localhost:3000/', 
      response_type: 'code',
      scope: 'openid' // Scopes requested from authentication server
    };
    const redirectQuery = new URLSearchParams(openidParams);
    const fullRedirectUrl = `${redirectUrl}?${redirectQuery}`;
    res.setHeader("Access-Control-Allow-Origin","*")
    res.redirect(fullRedirectUrl);
  }
});*/

/*app.get('/',(req, res) => {
  if (req.session.user == undefined){
    const redirectUrl = 'http://localhost:3005/authorize';
    const openidParams = {
      client_id: 'motus',
      redirect_uri: 'http://localhost:3000/word', 
      response_type: 'code',
      scope: 'openid' // Scopes requested from authentication server
    };
    const redirectQuery = new URLSearchParams(openidParams);
    const fullRedirectUrl = `${redirectUrl}?${redirectQuery}`;
    res.setHeader("Access-Control-Allow-Origin","*")
    res.redirect(fullRedirectUrl);
  }
});*/



// Read the contents of the file
const fileContent = fs.readFileSync('liste_francais_utf8.txt', 'utf-8');

// Split the content into an array of words based on newline characters
const wordsArray = fileContent.split('\n');

const cleanedArray = wordsArray.map(word => word.replace(/['\r]/g));
const getRandomIndex = () => {  const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
  const seed = currentDate; // Use the date as the seed
  const rng = seedrandom(seed);
  return Math.floor(rng() * wordsArray.length);
  };
const wordD=String(wordsArray[getRandomIndex()]); 


app.get('/word', (req, res) => {
  // Return the a random word
  res.setHeader("Access-Control-Allow-Origin","*")
  res.json({wordD});
});

app.get('/wordNb', (req, res) => {
  // Return the a random word
  res.setHeader("Access-Control-Allow-Origin","*")
  res.send(String(wordD.length));
});


app.get('/check', (req, res) => {
  // Add your logic to check the user input here
  let draw =[];
  const aws = String(req.query.word);
  console.log(aws + " " + wordD);
  console.log(aws.toLowerCase() == wordD.toLowerCase());
  let reponse = (aws.toLowerCase() == wordD.toLowerCase());
  if(!reponse){
    for (let i = 0; i < aws.length; i++) {
      if (aws[i] === wordD[i]) {
        draw[i]=2;
      }
      else if(wordD.includes(aws[i])){
        draw[i]=1;
      }
      else{
        draw[i] = 0;
      }
    }
  }
  console.log(draw);
  res.setHeader("Access-Control-Allow-Origin","*")
  res.send(draw);

  
  /*fetch('http://localhost:3000/word')
      .then(response => response.json())
      .then(data => {
        const correctAnswer = data.word127; // Assuming the server sends the correct answer

        // Check if userInput is correct
        const isCorrect = aws.toLowerCase() === correctAnswer.toLowerCase();

        // Display the result on the page
        let reponse = isCorrect
          ? 'Correct! You entered the right word.'
          : 'Wrong! Try again.';
      })
      .catch(error => {
        console.error('Error fetching word:', error);
      });*/

  // Respond to the client
});

app.listen(port,() =>{
 console.log(`Server is running on http://localhost:${port}`);
 })
