const express = require('express')
var session = require('express-session')
const RedisStore = require("connect-redis").default
const { createClient } = require('redis');

const app = express()

//Initialize and connectthe redisClient
let redisClient = createClient({
  host: '127.0.0.1',
  port: 6379,
})
redisClient.connect().catch(console.error)

// Initialize store.
let redisStore = new RedisStore({
  client: redisClient,
  ttl: 3600,
})

const port = 3010

//Use Redis to connect to the commun sRedis session store
app.use(session({
  store: redisStore,      
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: false
  }))

app.use( (req, res,next) => {
  if (req.session.user) {
    console.log(`Session data: ${JSON.stringify(req.session.user)}`);
  } 
  else {
    console.log('No session data found : ' + req.session.user);
  }
  next();
});

app.use(express.static('page'));

app.get('/user', function (req, res) {
  if (!(req.session.user === "undefined")){
      res.send(req.session.user)
  }
})


app.listen(port,() =>{
  console.log(`Server is running on http://localhost:${port}`);
})