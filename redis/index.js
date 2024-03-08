const express = require('express');
const app = express();
const redis = require('redis');

// Configuration des URL et du port 
const redis_uri = process.env.REDIS_URI || 'redis://localhost:6379';
const port = process.env.PORT || 4000;

// Connections Redis pour les scores, les nombres de tentatives et les mots de passes 
const clientScores = redis.createClient({ url: redis_uri });
const clientUserPass = redis.createClient({ url: redis_uri });
const clientAttempts = redis.createClient({ url: redis_uri });

//Gestion des événements de connexions et d'erreur pour chaque client Redis
clientScores.on('connect', () => {
  console.log('Connected to Redis for scores');
});

clientUserPass.on('connect', () => {
  console.log('Connected to Redis for usernames/passwords');
});

clientAttempts.on('connect', () => {
    console.log('Connected to Redis for usernames/attempts');
  });

clientScores.on('error', (err) => {
  console.error('Redis Error (Scores):', err);
});

clientUserPass.on('error', (err) => {
  console.error('Redis Error (Usernames/Passwords):', err);
});

clientAttempts.on('error', (err) => {
    console.error('Redis Error (Usernames/Attempts):', err);
  });

// Utilisation d'express pour servir des fichiers statiques dans le répertoire 'www'
app.use(express.static('www'));

// Route simple pour la page d'accueil
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Middleware pour afficher les paramètres de requête pour la route '/params'
app.use('/params', (req, res) => {
  console.log(req.query);
});

// Route de vérification de l'état de fonctionnement
app.get('/health', (req, res) => {
  res.send('ok');
});

// Fonction pour pousser un mot dans une liste Redis
// Input: listName (String), value (String)
// Output: Aucun (effets secondaires : ajout d'une valeur dans une liste Redis)
function pushWordToList(listName, value) {
  clientUserPass.rPush(listName, value, (err, reply) => {
    if (err) {
      console.error(`Error pushing ${value} to list ${listName}:`, err);
    } else {
      console.log(`${value} pushed to list ${listName}`);
    }
  });
}

// Définir le score d'un utilisateur
// Input: username (String), score (String)
// Output: Réponse HTTP avec le résultat de l'opération
app.get('/setScore/:username/:score', (req, res) => {
  const username = req.params.username;
  const score = req.params.score;

  // Définir le score d'un utilisateur
  clientScores.zadd('scoreboard', score, username, (err, reply) => {
    if (err) {
      console.error('Error setting score:', err);
      res.status(500).send('Internal Server Error');
    } else {
      console.log('Score set for user:', username);
      res.send('Score set for user: ' + username);
    }
  });
});

// Obtenir le score d'un utilisateur
// Input: username (String)
// Output: Réponse HTTP avec le score de l'utilisateur ou un message d'erreur
app.get('/getScore/:username', (req, res) => {
  const username = req.params.username;

  // Obtenir le score d'un utilisateur à partir de son nom 
  clientScores.zscore('scoreboard', username, (err, reply) => {
    if (err) {
      console.error('Error getting score:', err);
      res.status(500).send('Internal Server Error');
    } else {
      res.send(reply ? reply.toString() : 'User not found');
    }
  });
});

// Obtenir le classement des scores
// Input: Aucun
// Output: Réponse HTTP avec le classement des utilisateurs et leurs scores
app.get('/getRanking', (req, res) => {
  // Obtenir le classement des scores avec ou sans les scores d'afficher
  clientScores.zrevrange('scoreboard', 0, -1, 'WITHSCORES', (err, reply) => {
    if (err) {
      console.error('Error getting ranking:', err);
      res.status(500).send('Internal Server Error');
    } else {
      const ranking = [];
      for (let i = 0; i < reply.length; i += 2) {
        ranking.push({ username: reply[i], score: reply[i + 1] });
      }
      res.send(ranking);
    }
  });
});



// Middleware pour vérifier l'unicité d'un nom d'utilisateur avant de le créer
app.use('/setPassword/:username/:password', (req, res, next) => {
  const username = req.params.username;

  // Vérifier si le nom d'utilisateur existe déjà
  clientUserPass.exists(username, (err, reply) => {
    if (err) {
      console.error('Error checking username existence:', err);
      //res.status(500).send('Internal Server Error');
    } else if (reply === 1) {
      // Si le nom d'utilisateur existe déjà, renvoyer une réponse appropriée
      res.status(400).send('Username already exists');
    } else {
      // Si le nom d'utilisateur est unique, passer au middleware suivant
      next();
    }
  });
});

// Définir le mot de passe d'un utilisateur
// Input: username (String), password (String)
// Output: Réponse HTTP avec le résultat de l'opération
app.get('/setPassword/:username/:password', (req, res) => {
  const username = req.params.username;
  const password = req.params.password;

  // Sauvegarder le mot de passe
  clientUserPass.set(username, password, (err, reply) => {
    if (err) {
      console.error('Error setting password:', err);
      //res.status(500).send('Internal Server Error');
    } else {
      console.log('Password set for user:', username);
      res.send('Password set for user: ' + username);
    }
  });
});

// Obtenir le mot de passe d'un utilisateur
// Input: username (String)
// Output: Réponse HTTP avec le mot de passe de l'utilisateur ou un message d'erreur
app.get('/getPassword/:username', (req, res) => {
  const username = req.params.username;

  // Obtenir le mot de passe d'un utilisateur à partir de son nom 
  clientUserPass.get(username, (err, reply) => {
    if (err) {
      console.error('Error getting password:', err);
      res.status(500).send('Internal Server Error');
    } else {
      res.send(reply ? reply.toString() : 'User not found');
    }
  });
});

// Définir le nombre de tentatives pour réussir d'un utilisateur
// Input: username (String), attempts (String)
// Output: Réponse HTTP avec le résultat de l'opération
app.get('/setAttempts/:username/:attempts', (req, res) => {
    const username = req.params.username;
    const attempts = req.params.attempts;
  
    // Sauvegarder le nombre de tentatives 
    clientAttempts.zadd('attemptboard', attempts, username, (err, reply) => {
      if (err) {
        console.error('Error setting attempts:', err);
        res.status(500).send('Internal Server Error');
      } else {
        console.log('Attempts set for user:', username);
        res.send('Attempts set for user: ' + username);
      }
    });
  });

// Obtenir le nombre de tentatives d'un utilisateur
// Input: username (String)
// Output: Réponse HTTP avec le nombre de tentatives de l'utilisateur ou un message d'erreur
app.get('/getAttempts/:username', (req, res) => {
    const username = req.params.username;
  
    // Obtenir le nombre de tentatives pour un utilisateur
    clientAttempts.zscore('attemptboard', username, (err, reply) => {
      if (err) {
        console.error('Error getting attempts:', err);
        res.status(500).send('Internal Server Error');
      } else {
        res.send(reply ? reply.toString() : 'User not found');
      }
    });
  });

// Obtenir les statistiques d'un utilisateur
// Input: username (String)
// Output: Réponse HTTP avec le score et le nombre de tentatives de l'utilisateur
app.get('/getUserStats/:username', (req, res) => {
    const username = req.params.username;
    
    //Commence par chercher le score de l'utilisateur puis son nombres de tentatives
    clientScores.zscore('scoreboard', username, (scoreErr, scoreReply) => {
      if (scoreErr) {
        console.error('Error getting score:', scoreErr);
        res.status(500).send('Internal Server Error');
      } else {
        clientAttempts.zscore('attemptboard', username, (attemptErr, attemptReply) => {
          if (attemptErr) {
            console.error('Error getting attempts:', attemptErr);
            res.status(500).send('Internal Server Error');
          } else {
            const score = scoreReply ? scoreReply.toString() : 'User not found';
            const attempts = attemptReply ? attemptReply.toString() : 'User not found';
            res.send({ username, score, attempts });
          }
        });
      }
    });
});

//Gestion de la connection des Clients
(async () => {
  await clientScores.connect();
  await clientUserPass.connect();
  await clientAttempts.connect();
})();

console.log('Starting Server ...');

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});