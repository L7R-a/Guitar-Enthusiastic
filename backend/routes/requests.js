// routes/requests.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all requests
router.get('/', (req, res) => {
  // #swagger.description = 'Endpoint used to get all requests.'
    // #swagger.summary = 'Get all requests.'
    /* #swagger.responses[500] = {
        description: 'Internal server error.',
        schema: { error: 'string' }
    } */
    /* #swagger.responses[200] = {
          description: 'Successfully retrieved all requests.',
          schema: [{
            id: 'string',
            user: 'string',
            song: 'string',
            artist: 'string',
            comment: 'string',
            date: 'string',
            number_of_replies: 'number',
            link: 'string',
            userId: 'string'
          }]
    } */

  db.query('SELECT * FROM Requests', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Add a new request
router.post('/', (req, res) => {
  // #swagger.description = 'Endpoint used to add a new request.'
    // #swagger.summary = 'Add a new request.'
    /* #swagger.parameters['body'] = {
            in: 'body',
            required: true,
            schema: {
                id: 'string',
                user: 'string',
                song: 'string',
                artist: 'string',
                comment: 'string',
                link: 'string',
                userId: 'string'
            },
            description: 'Request data.'
    } */
    /* #swagger.responses[500] = {
        description: 'Internal server error.',
        schema: { error: 'string' }
    } */
    /* #swagger.responses[200] = {
          description: 'Successfully added the request.',
          schema: {
            id: 'string',
            user: 'string',
            song: 'string',
            artist: 'string',
            comment: 'string',
            date: 'string',
            number_of_replies: 0,
            link: 'string',
            userId: 'string'
          }
    } */
  const { id, user, song, artist, comment, link, userId } = req.body;
  const sql = 'INSERT INTO Requests (id, user, song, artist, comment, link, userId) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(sql, [id, user, song, artist, comment, link, userId], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ id, user, song, artist, comment, date: new Date(), number_of_replies: 0, link, userId });
  });
});

// Search for requests by song, artist, comment, or user
router.get('/search/:text', (req, res) => {
  // #swagger.description = 'Endpoint used to search for requests by song, artist, or user.'
    // #swagger.summary = 'Search for requests.'
    /* #swagger.parameters['text'] = {
            in: 'path',
            type: 'string',
            required: true,
            description: 'The text to search for.'
    } */
    /* #swagger.responses[500] = {
        description: 'Internal server error.',
        schema: { error: 'string' }
    } */
    /* #swagger.responses[200] = {
          description: 'Successfully retrieved the search results.',
          schema: [{
            id: 'string',
            user: 'string',
            song: 'string',
            artist: 'string',
            comment: 'string',
            date: 'string',
            number_of_replies: 'number',
            link: 'string',
            userId: 'string'
          }]
    } */
  const { text } = req.params;
  
  const sql = 'SELECT * FROM Requests WHERE song LIKE ? OR artist LIKE ? OR user LIKE ?';
  const like = `%${text}%`;
  db.query(sql, [like, like, like], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Get a specific request by ID
router.get('/:id', (req, res) => {
  // #swagger.description = 'Endpoint used to get a request by ID.'
    // #swagger.summary = 'Get request by ID.'
    /* #swagger.parameters['id'] = {
            in: 'path',
            type: 'string',
            required: true,
            description: 'The ID of the request.'
    } */
    /* #swagger.responses[500] = {
        description: 'Internal server error.',
        schema: { error: 'string' }
    } */
    /* #swagger.responses[404] = {
        description: 'Request not found.',
        schema: { error: 'string' }
    } */
    /* #swagger.responses[200] = {
          description: 'Successfully retrieved the request.',
          schema: {
            id: 'string',
            user: 'string',
            song: 'string',
            artist: 'string',
            comment: 'string',
            date: 'string',
            number_of_replies: 'number',
            link: 'string',
            userId: 'string'
          }
    } */
  const { id } = req.params;
  db.query('SELECT * FROM Requests WHERE id = ?', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.length === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json(result[0]);
  });
});

// Get requests by userId
router.get('/user/:userId', (req, res) => {
   // #swagger.description = 'Endpoint used to get requests by user ID.'
    // #swagger.summary = 'Get requests by user ID.'
    /* #swagger.parameters['userId'] = {
            in: 'path',
            type: 'string',
            required: true,
            description: 'The ID of the user.'
    } */
    /* #swagger.responses[500] = {
        description: 'Internal server error.',
        schema: { error: 'string' }
    } */
    /* #swagger.responses[200] = {
          description: 'Successfully retrieved the requests.',
          schema: [{
            id: 'string',
            user: 'string',
            song: 'string',
            artist: 'string',
            comment: 'string',
            date: 'string',
            number_of_replies: 'number',
            link: 'string',
            userId: 'string'
          }]
    } */
  const { userId } = req.params;
  db.query('SELECT * FROM Requests WHERE userId = ?', [userId], (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

//Increment number_of_replies by 1 by getting the id
router.put('/:id', (req, res) => {
  // #swagger.description = 'Endpoint used to increment the number of replies for a request by ID.'
    // #swagger.summary = 'Increment number of replies by request ID.'
    /* #swagger.parameters['id'] = {
            in: 'path',
            type: 'string',
            required: true,
            description: 'The ID of the request.'
    } */
    /* #swagger.responses[500] = {
        description: 'Internal server error.',
        schema: { error: 'string' }
    } */
    /* #swagger.responses[404] = {
        description: 'Request not found.',
        schema: { error: 'string' }
    } */
    /* #swagger.responses[200] = {
          description: 'Successfully updated the request.',
          schema: { message: 'string' }
    } */
  const { id } = req.params;
  db.query('UPDATE Requests SET number_of_replies = number_of_replies + 1 WHERE id = ?', [id], (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Request not found' });
    }
    res.json({ message: 'Request updated successfully' });
  });
});

module.exports = router;
