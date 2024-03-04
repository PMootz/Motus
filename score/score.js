const express = require('express');
const fs = require('fs');
var session = require('express-session')
const RedisStore = require("connect-redis").default
const { createClient } = require('redis');

const app = express();
const port = 3002;

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


/*app.get('/setScore', (req, res) => {
    let user ="undefined"
    if (req.session.user) {
        user = req.session.user
    }
    readScoreFromFile((err, scoreData) => {
        if (err) {
            return;
        }
        var { score, nbTry } = scoreData;
        let nbTr = parseInt(req.query.nb)
        score ++
        nbTry = nbTry + nbTr
        saveScoreToFile(score, nbTry);
    });
    res.setHeader("Access-Control-Allow-Origin","*")
    res.send('ok')
});*/

app.get('/setScore', (req, res) => {
    let user ="undefined"
    console.log(req.session.user)
    if (req.session.user) {
        user = req.session.user
        console.log(req.session.user)
    }
    let nbTr = parseInt(req.query.nb)
    saveScoreToFile(nbTr, user);
    res.setHeader("Access-Control-Allow-Origin","*")
    res.send('ok')
});

app.get('/getScore', (req, res) => { 
    let user ="undefined"
    if (req.session.user) {
        user = req.session.user
        console.log(req.session.user)
    }
    readScoreFromFile((user),(err, scoreData) => {
        if (err) {
            return;
        }
        var { score, nbTry } = scoreData;
        res.setHeader("Access-Control-Allow-Origin","*")
        res.send(score + ";" + (nbTry/score) + ";" +user);
    });
});

/*function saveScoreToFile(score, nbTry) {
    const data = JSON.stringify({ score, nbTry});
    fs.writeFile('score.json', data, (err) => {
        if (err) {
            console.error('Error saving score to file:', err);
        } else {
            console.log('Score saved to file successfully');
        }
    });
}*/

function saveScoreToFile(nbTry, userA) {
    fs.readFile('score.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading JSON file:', err);
            return;
        }
    
        let jsonData;
        try {
            // Parse the JSON data
            jsonData = JSON.parse(data);
        } catch (error) {
            console.error('Error parsing JSON data:', error);
            return;
        }
        const newUser = { pseudo: userA, score: 1, nbTry : nbTry };

        const { users } = jsonData;
        const existingUserIndex = users.findIndex(user => user.pseudo === newUser.pseudo);
        if (existingUserIndex !== -1) {
            // Update existing user
            users[existingUserIndex].score = parseInt(users[existingUserIndex].score)+1;
            users[existingUserIndex].nbTry = parseInt(users[existingUserIndex].nbTry)+ nbTry;
        } else {
            // Add new user
            jsonData.users.push(newUser);
        }
    
        // Convert the JavaScript object back to JSON
        const updatedData = JSON.stringify(jsonData, null, 2);
    
        // Write the updated JSON back to file
        fs.writeFile('score.json', updatedData, 'utf8', (err) => {
            if (err) {
                console.error('Error writing JSON file:', err);
                return;
            }
            console.log('User data updated successfully.');
        });
    });
    
}

/*function readScoreFromFile(callback) {
    fs.readFile('score.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading score from file:', err);
            callback(err, null);
            return;
        }

        try {
            const scoreData = JSON.parse(data);
            const { score, nbTry } = scoreData;
            callback(null, { score, nbTry });
        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
            callback(parseError, null);
        }
    });
}*/

function readScoreFromFile(userA, callback) {
    fs.readFile('score.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading score from file:', err);
            callback(err, null);
            return;
        }

        try {
            const scoreData = JSON.parse(data);
            const { users } = scoreData;
            const existingUserIndex = users.findIndex(user => user.pseudo === userA);
            let score =0
            let nbTry =5
            if (existingUserIndex !== -1) {
                // Update existing user
                score = parseInt(users[existingUserIndex].score);
                nbTry = parseInt(users[existingUserIndex].nbTry);
            }
            else{
                score = parseInt(users[0].score);
                nbTry = parseInt(users[0].nbTry);
            }
            callback(null, { score, nbTry });
        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
            callback(parseError, null);
        }
    });
}

app.listen(port,() =>{
 console.log(`Server is running on http://localhost:${port}`);
 })
