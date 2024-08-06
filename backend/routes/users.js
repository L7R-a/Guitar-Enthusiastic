//IMPORTS
const express = require('express'); // IMPORT EXPRESS
const router = express.Router(); // GET ROUTER INSTANCE FROM EXPRESS
const db = require('../db'); // GET DATABASE CONNECTION (note: ../db because db is in a parent folder)

//API ENDPOINTS 
//GET: RETRIEVE USERS
//POST: ADD A NEW USER
//PUT: UPDATE A USER
//DELETE: REMOVE A USER

//(note: only one endpoint should have the same method and path in the same router file.
// Frontend will call these endpoints passing the specified method and path to avoid confusion)

// GET ALL USERS
// Specify the method and path for this endpoint. req is the input received, res is the output that will be sent.
router.get('/', (req, res) => {
  //Query the database for all users. 
  db.query('SELECT * FROM users', (err, results) => {         //(err, results) is a callback function that will be called when the query is done.
    if (err) {
      return res.status(500).json({ error: err.message });    // If there is an error, return a 500 status code with the error message.
    }
    res.json(results);                                        // If there is no error, return the db results as JSON.

  });
});

// ADD A NEW USER
router.post('/', (req, res) => {
  // Get the username and email from the request body.
  const { username, name, email, password} = req.body;

    // First, check if the username already exists
    db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (results.length > 0) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      // If username does not exist, insert the new user into the database
      db.query('INSERT INTO users (username, name, email, password) VALUES (?, ?, ?, ?)', [username, name, email, password], (err, result) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: result.insertId, username, email });
      });
    });
  })

  //TODO: Do swagger hub documentation for this endpoint
  //TODO: Do testing for mocca for this endpoint
  //TODO: Make Swagger file. Hide it with gitignore. 
  //TODO: Change Localhost to url in frontend & backend.
  //TODO: Wait how to figure out testing for react.
// Get a user by their username and password
router.get('/:username/:password', (req, res) => {
  const { username, password } = req.params;

  db.query('SELECT * FROM users WHERE BINARY username = ? AND BINARY password = ?', [username, password], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results[0]);
  });
});

// Get a user by their username and password
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  db.query('SELECT * FROM users WHERE BINARY username = ? AND BINARY password = ?', [username, password], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results[0]);
  });
});

//Update user requestNum by 1
router.put('/:id', (req, res) => {
  const { id } = req.params;

  db.query('UPDATE users SET requestsNum = requestsNum + 1 WHERE id = ?', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
});

//Update user repliesNum by 1
router.put('/replies/:id', (req, res) => {
  const { id } = req.params;

  db.query('UPDATE users SET repliesNum = repliesNum + 1 WHERE id = ?', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(result);
  });
});

module.exports = router;