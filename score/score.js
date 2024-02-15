const express = require('express');
const fs = require('fs');
const http = require('http');
//const redis = require('redis');

//const client = redis.createClient({host: "127.0.0.1",port: 6379});

const app = express();
const port = 3002;

//let score =0;
//let nbTry =0;



/*client.on('connect', () => {
    console.log('Connected to Redis');

    // Perform Redis commands inside the connection event handler
    client.set('key', 'value', (err, reply) => {
        if (err) {
            console.error('Error setting key:', err);
        } else {
            console.log('Key set:', reply);
        }
    });

    client.get('key', (err, value) => {
        if (err) {
            console.error('Error getting key:', err);
        } else {
            console.log('Value:', value);
        }
    });
});*/


app.get('/setScore', (req, res) => {
    readScoreFromFile((err, scoreData) => {
        if (err) {
            // Handle error
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
});

app.get('/getScore', (req, res) => { 
    readScoreFromFile((err, scoreData) => {
        if (err) {
            // Handle error
            return;
        }
        var { score, nbTry } = scoreData;
        res.setHeader("Access-Control-Allow-Origin","*")
        res.send(score + " " + (nbTry/score));
    });
});

function saveScoreToFile(score, nbTry) {
    const data = JSON.stringify({ score, nbTry});
    fs.writeFile('score.json', data, (err) => {
        if (err) {
            console.error('Error saving score to file:', err);
        } else {
            console.log('Score saved to file successfully');
        }
    });
}

function readScoreFromFile(callback) {
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
}


app.listen(port,() =>{
 console.log(`Server is running on http://localhost:${port}`);
 })

