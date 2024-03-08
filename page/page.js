const express = require('express')
var session = require('express-session')
const jwt = require('jsonwebtoken');

const app = express()


const port = 3010
const secretKey = 'Crounch';

app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000}
}));


app.get('/uri',function (req, res) {
  if (req.query.code){
      res.setHeader("Access-Control-Allow-Origin","*")
      res.redirect(`http://localhost:3003/token?code=${req.query.code}`)
  }
})

app.get('/newUser', function(req,res){
  const token = req.query.token;
  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      console.error('Error verifying token:', err);
      return res.status(401).json({ error: 'Unauthorized' });
    }
    

    // Token is valid, extract user ID
    const userId = decoded.userId;

    // You can now use the userId for further processing
    req.session.user =userId
    console.log(userId)
    res.redirect('/')
  });

})

app.use((req, res,next) => {
  if (req.session.user) {
    const user = req.session.user;
    console.log(`Session data: ${JSON.stringify(req.session.user)}`);
    next();
  } 
  else {
    console.log('No session data found : ' + req.session.user);
        const redirectUrl = 'http://localhost:3003/authorize';
        const openidParams = {
          client_id: 'motus',
          redirect_uri: 'http://localhost:3010/uri', 
          response_type: 'code',
          scope: 'openid' // Scopes requested from authentication server
        };
        const redirectQuery = new URLSearchParams(openidParams);
        const fullRedirectUrl = `${redirectUrl}?${redirectQuery}`;
        res.setHeader("Access-Control-Allow-Origin","*")
        res.redirect(fullRedirectUrl);
  }
});

app.use(express.static('page'));

app.get('/user', function (req, res) {
  if (!(req.session.user === "undefined")){
      res.send(req.session.user)
  }
})

app.get('/setScore', function (req,res){
    req.session.lastPlayedDate = new Date().toDateString();
    res.setHeader("Access-Control-Allow-Origin","*")
    res.redirect('http://localhost:3008/setScore?nb='+req.query.nb+'&user='+req.session.user+'&score='+req.query.sc)
})

app.get('/getScore', function (req,res){
  res.setHeader("Access-Control-Allow-Origin","*")
  res.redirect('http://localhost:3008/getScore?user='+req.session.user)

})

app.get('/logout', function (req,res){
  if(req.session.user){
    req.session.user = undefined
    res.redirect('/index.html');
  }
})

app.get('/checkAccess', function(req, res) {
  const currentDate = new Date().toDateString();
  const lastPlayedDate = req.session.lastPlayedDate;

  if (lastPlayedDate && lastPlayedDate === currentDate) {
      // User has already played the game today, refuse access
      res.json({ message: "Accès refusé, vous avez déjà joué au jeux aujourd'hui", status: "denied" });
    } else {
        // User is allowed to play the game
        res.json({ message: "Access allowed.", status: "ok" });
    }
})

app.listen(port,() =>{
  console.log(`Server is running on http://localhost:${port}`);
})