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

//Use the Redis session storage
app.use(session({
  store: redisStore,
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
})) 

//The following commented code is the redirection if the user is not connected, but because of the session problem we have it is still commented
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

//create a random number each day
const getRandomIndex = () => {  const currentDate = new Date().toISOString().split('T')[0]; // Get current date in YYYY-MM-DD format
  const seed = currentDate; // Use the date as the seed
  const rng = seedrandom(seed);
  return Math.floor(rng() * wordsArray.length);
  };

  //take a random word
const wordD=String(wordsArray[getRandomIndex()]); 


app.get('/word', (req, res) => {
  // Return the random word
  res.setHeader("Access-Control-Allow-Origin","*")
  res.json({wordD});
});

app.get('/wordNb', (req, res) => {
  // Return the word size
  res.setHeader("Access-Control-Allow-Origin","*")
  res.send(String(wordD.length));
});

//Check if the given word is correct or not
app.get('/check', (req, res) => {
  // Add your logic to check the user input here
  let draw =[];
  const aws = String(req.query.word);
  console.log(aws + " " + wordD);
  console.log(aws.toLowerCase() == wordD.toLowerCase());
  //compare the to word, it doesn't work
  let reponse = (aws.toLowerCase() == wordD.toLowerCase());
  //if the word are not equals, return a table with the information of each caracter
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
});

app.listen(port,() =>{
 console.log(`Server is running on http://localhost:${port}`);
 })
