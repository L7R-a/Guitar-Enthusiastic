// routes/requests.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all requests
router.get('/', (req, res) => {
  db.query('SELECT * FROM Requests', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

// Add a new request
router.post('/', (req, res) => {
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
