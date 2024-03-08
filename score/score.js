const express = require('express');
const fs = require('fs');

const app = express();
const port = 3008;



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

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Add other methods if necessary
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});


//Set score of the user in the json file
app.get('/setScore', (req, res) => {
    let nbTr = parseInt(req.query.nb)
    let user = req.query.user
    //Save the parameter in the json
    saveScoreToFile(nbTr, user);
    res.setHeader("Access-Control-Allow-Origin","*")
    res.send('ok')
});

//Get the score from the connected user
app.get('/getScore', (req, res) => { 
    let user =req.query.user
    //search the user in the json
    readScoreFromFile((user),(err, scoreData) => {
        if (err) {
            return;
        }
        var { score, nbTry } = scoreData;
        res.setHeader("Access-Control-Allow-Origin","*")
        res.send(score + ";" + (nbTry/score) + ";" +user);
    });
});

// Save the score in the json file
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
        //Create the parameter for the json
        const newUser = { pseudo: userA, score: 1, nbTry : nbTry };
        //adapt it in the json format
        const { users } = jsonData;
        //search if the user already exist in the file, in order to either create it or add it in the existing one
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

//Search the user in the json file. Because readfile is special we need to use the callback
function readScoreFromFile(userA, callback) {
    fs.readFile('score.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading score from file:', err);
            callback(err, null);
            return;
        }

        try {
            //save the json in another format
            const scoreData = JSON.parse(data);
            //extract the users
            const { users } = scoreData;
            //search in the user if the connected is in the file
            const existingUserIndex = users.findIndex(user => user.pseudo === userA);
            let score =0
            let nbTry =5
            if (existingUserIndex !== -1) {
                // Update existing user
                score = parseInt(users[existingUserIndex].score);
                nbTry = parseInt(users[existingUserIndex].nbTry);
            }
            else{
                //add he score in the undefined user
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
