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
    maxAge: 3600000}
}));

// Initialize session storage.
app.use(express.static('page'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/',(req,res) => {
  const user = req.session.user;
});
var uri =''
var mess = ""
var mess2 = ""
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
  if(req.session.user){
    req.session.user =null
        res.redirect('/');
  }
  res.redirect("/")
});

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
  mess2 = "";
  checkIdToFile(req.query.user, req.query.pass, (err, result) => {
      if (err) {
          console.error('Error checking id:', err);
          return res.redirect('/error.html'); // Redirect to error page
      }

      if (result) {
          req.session.user = req.query.user;
          const code = Math.random().toString(36).substr(2, 12).toUpperCase();
          let user = req.session.user;

          // Store code along with client login information
          codeStore.push({ user, code });
          res.setHeader('Access-Control-Allow-Origin', '*');
          return res.redirect(`${uri}?code=${code}`);
      } else {
          mess2 = "The id is already taken";
          return res.redirect('/register.html');
      }
  });
});

/*app.get('/create', function (req, res) {
  mess2 = "";
  let username = req.query.user;
  let password = req.query.pass;
  axios.get(`http://localhost:4000/setPassword/${username}/${password}`)
  .then(response => {
    if(response.data ==="User already taken") {
      mess2 = "The id is already taken";
      return res.redirect('/register.html');
  }
  else{
    req.session.user = req.query.user
    const code = Math.random().toString(36).substr(2, 12).toUpperCase();
    let user = req.session.user
    // Store code along with client login information
    codeStore.push({ user, code});
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.redirect(`${uri}?code=${code}`)
  }
  })
  .catch(error => {
    console.error('Error:', error); // Log any errors that occur
  });
});*/

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
    mess =""
    req.session.regenerate(function (err) {
      if (err) next(err)
      if(req.session.user) {
        req.session.user=null
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
          const code = Math.random().toString(36).substr(2, 12).toUpperCase();
          let user = req.session.user
          // Store code along with client login information
          codeStore.push({ user, code});
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.redirect(`${uri}?code=${code}`)
          }
          else {
            mess = "Wrong user or password"
            res.redirect('/'); // Redirect to the authentication page with a message
          }
        }
      })
    })
  })

  /*app.get('/login', express.urlencoded({ extended: false }), function (req, res) {
    // login logic to validate req.body.user and req.body.pass
    // would be implemented here. for this example any combo works
  
    // regenerate the session, which is good practice to help
    // guard against forms of session fixation
    mess =""
      if(req.session.user) {
        req.session.user=null
      }
      const options = {
        hostname: 'localhost',
        port: 4000,
        path: `/getPassword/${req.query.user}`,
        method: 'GET'
      };
      const request = http.request(options, res => {
        let data = '';
        res.on('data', chunk => {
          data += chunk;
        });
      
        res.on('end', () => {
          if(data == "User not found"){
          const storedPassword = data.trim(); // Trim any whitespace
          if (verifyPassword(req.query.pass,storedPassword)) {
            req.session.user = req.query.user
          const code = Math.random().toString(36).substr(2, 12).toUpperCase();
          let user = req.session.user
          // Store code along with client login information
          codeStore.push({ user, code});
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.redirect(`${uri}?code=${code}`)
          }
          else {
            mess = "Wrong password"
            res.redirect('/'); // Redirect to the authentication page with a message
          }
        }
        else{
          mess = "This user doesn't exist"
          res.redirect('/'); // Redirect to the authentication page with a message
        }
      }).on('error', (err) => {
        console.error('Error:', err);
    });
      });
    })*/
      


/**
 * destroy the session user
 */
  app.get('/logout', function (req, res) {  
    req.session.user =null
        res.redirect('/');
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

  app.get('/mess',function (req, res) {
    if (!(mess === "")){
        res.send(escapeHtml(mess))
    }
    else{
      res.send('')
    }
})

app.get('/mess2',function (req, res) {
  if (!(mess2 === "")){
      res.send(escapeHtml(mess2))
  }
  else{
    res.send('')
  }
})

  //add the new user in the json
  /**
   * 
   * @param {user} id The user name
   * @param {pass} pass The user password
   */

  function checkIdToFile(id, pass, callback) {
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
                    callback(err, null);
                }
                console.log(`Added id ${id} with password ${pass} to auth.json`);
                callback(null, ture);
              })
          } 
          else {
              console.error('Error reading auth.json:', err);
              callback(err);
              callback(err, null);
          }
        }
        else {
          try {
          let jsonData = JSON.parse(data);
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
                    callback(err, null);
                }
                console.log(`Added id ${id} with password ${pass} to auth.json`);
                callback(null, true)
            });
          }
          else{
            callback(err, null);
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
