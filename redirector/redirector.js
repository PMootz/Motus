const express = require('express');
const session = require('express-session');

const app = express();
const port = 3004;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true
}));

//Verify the parameter in order to validate the authentification call
app.get('/authorize', (req, res) => {
    const { client_id, scope, redirect_uri } = req.query;
    // Perform the client id check
    if (client_id !== 'motus') {
        return res.status(400).send('Invalid client ID');
    }
    if (scope !== 'openid') {
        return res.status(400).send('Invalid scope');
    }
    if (redirect_uri !== 'http://localhost:3000/') {
        return res.status(400).send('Invalid redirect URI');
    }
    res.setHeader("Access-Control-Allow-Origin","*")
    res.redirect(`http://localhost:3003/save?redirect_uri=${redirect_uri}`)
    //res.send()
});

//function test to redirect to the page, It didn't work when calling from another API so try to make the inverse call to avoid it but failed
app.get('/redirect', (req, res) => {
    const { code, redirect_uri } = req.query; 
    res.setHeader("Access-Control-Allow-Origin","*")
    res.redirect(`${redirect_uri}/score?code=${code}`)
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
