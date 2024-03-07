const session = require('express-session')
const express = require('express')
var escapeHtml = require('escape-html')
const fs = require('fs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');


const app = express()

app.listen(3003);

app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    maxAge: 3600000,
    secure: true }
}));

// Initialize session storage.
app.use(express.static('page'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/',(req,res) => {
  const user = req.session.user;
});
var uri =''
const codeStore = [];
const secretKey = 'Crounch';

app.get('/authorize', (req, res) => {
  const { client_id, scope, redirect_uri } = req.query;
  // Perform the client id check
  if (client_id !== 'motus') {
      return res.status(400).send('Invalid client ID');
  }
  if (scope !== 'openid') {
      return res.status(400).send('Invalid scope');
  }
  if (redirect_uri !== 'http://localhost:3010/uri') {
      return res.status(400).send('Invalid redirect URI');
  }
  uri = redirect_uri
  res.redirect("/")
});

/*app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Allow requests from all origins
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // Specify allowed HTTP methods
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Specify allowed headers
    next();
  });*/

 app.get('/save', function (req, res) {
     // this is only called when there is an authentication user due to isAuthenticated
     redirectUri = req.query.redirect_uri
     res.redirect('/')
   })

app.get('/user', function (req, res) {
    if (!(req.session.user === "undefined")){
        res.send(escapeHtml(req.session.user))
    }
})

app.get("/session",(req,res)=>{
    res.json(req.session)
})


//create the new user if doesn't exist
//Input : the user ud and the user password
//Output : A message telling if the user has been saved or not
app.get('/create', function (req, res) {
  console.log(req.query)
    if(checkIdToFile(req.query.user,req.query.pass)){
      res.type('html')
      res.send('hello, you have been register !' +' <a href="/logout">Logout</a>')
    }
    else {
      res.type('html')
      res.send('This id is already taken')
    }
  })

  //manage the login par of the app
  /**
   * Input : user id and password
   * Output :  If the login succed or fail
   */
app.get('/login', express.urlencoded({ extended: false }), function (req, res) {
    // login logic to validate req.body.user and req.body.pass
    // would be implemented here. for this example any combo works
  
    // regenerate the session, which is good practice to help
    // guard against forms of session fixation
    req.session.regenerate(function (err) {
      if (err) next(err)
      if(req.session.user) {
        req.session.destroy((err) => {
          if (err) {
            console.log(err);
          } 
        })
      }
      const { user, pass } = req.query;
      checkIdFromFile(user,pass, (err, exists) => {
        if(err){
          console.log("error")
        }
        else{
          if(exists){
      // store user information in session, typically a user id
        req.session.user = req.query.user
        const session = req.session
        session.username = req.query.user
        session.password = req.query.pass
        // Generate random code
        const code = Math.random().toString(36).substr(2, 12).toUpperCase();
            
        // Store code along with client login information
        codeStore.push({ user, code});
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.redirect(`${uri}?code=${code}`)
        //const redirectUrl = `${uri}?code=${code}`; //a revenir comme avant
        //res.json({ redirectUrl }); 
      }
      else{
        res.type('html')
        res.send("Wrong password, try again!")
      }
    }
    })
    })
  })


/**
 * destroy the session user
 */
  app.get('/logout', function (req, res) {  
    req.session.destroy((err) => {
      if (err) {
        console.log(err);
      } else {
        res.redirect('/');
      }
    })
  })

  app.get('/token',function (req, res) {  
    var code = req.query.code;
    const entry = codeStore.find(entry => entry.code === code);
    if(!entry){
      return res.status(400).send('The code doesn\'t exist');
    }
    else{
      userId = entry.user
      jwt.sign({ userId }, secretKey, { expiresIn: '1h' }, (err, token) => {
        if (err) {
          console.error('Error generating token:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }
    
        // Return the token in the response
        //res.json({ id_token: token });
      res.setHeader("Access-Control-Allow-Origin","*")
      res.redirect(`http://localhost:3010/newUser?token=${token}`);
    })
  }
  })

  //add the new user in the json
  /**
   * 
   * @param {user} id The user name
   * @param {pass} pass The user password
   */

  function checkIdToFile(id, pass) {
    fs.readFile('auth.json', 'utf8', (err, data) => {
      let jsonData = {};

      if (err) {
          // If the file doesn't exist, create a new JSON object with an empty users array
          if (err.code === 'ENOENT') {
              jsonData = { users: [] };
              const newUser = { id: id, pass: pass };
              jsonData.users.push(newUser);
              
              // Convert the JavaScript object back to JSON
              let updatedData = JSON.stringify(jsonData, null, 2);
              fs.writeFile('auth.json', updatedData, 'utf8', (err) => {
                if (err) {
                    console.error('Error writing JSON file:', err);
                    return;
                }
                console.log(`Added id ${id} with password ${pass} to auth.json`);
                return true
              })
          } 
          else {
              console.error('Error reading auth.json:', err);
              callback(err);
              return false;
          }
        }
        else {
          try {
          let jsonData = JSON.parse(data);
            //console.log(jsonData)
          // Check if the id already exists
          if (!(jsonData.users.some(user => user.id === id))) {
              pass = hashPassword(pass)
              const newUser = { id: id, pass: pass };
              jsonData.users.push(newUser);
              
              // Convert the JavaScript object back to JSON
              let updatedData = JSON.stringify(jsonData, null, 2);
              fs.writeFile('auth.json', updatedData, 'utf8', (err) => {
                if (err) {
                    console.error('Error writing JSON file:', err);
                    return false;
                }
                console.log(`Added id ${id} with password ${pass} to auth.json`);
                return true
            });
          }
          else{
            return false;
          }
        }
        catch (parseError) {
          console.error('Error parsing JSON:', parseError);
          callback(parseError, null);
        }
      }
    });
}

//check if the user is in the file
/**
 * 
 * @param {user} id the user name
 * @param {pass} pass the password
 * @param {*} callback  the return
 */
function checkIdFromFile(id, pass, callback) {
    fs.readFile('auth.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading score from file:', err);
            callback(err, null);
            return;
        }
        try {
            const idData = JSON.parse(data);
            //console.log(idData.users.some(user => user.id === id && user.pass === pass))
            const user = idData.users.find(user => user.id === id);
            if (!user) {
                callback(null, false); // User not found
                return;
            }
            // Verify the provided password against the stored hash
            const passwordMatch = verifyPassword(pass, user.pass);
            callback(null, passwordMatch);
            
        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
            callback(parseError,false)
        }
    });
}

// Function to hash a password using SHA-256
function hashPassword(password) {
  const hash = crypto.createHash('sha256');
  hash.update(password);
  return hash.digest('hex');
}

// Function to check if the provided password matches the stored hash
function verifyPassword(inputPassword, storedHash) {
  const inputHash = hashPassword(inputPassword);
  return inputHash === storedHash;
}

app.listen(() =>{
    console.log(`Server is running on http://localhost:3003`);
})
