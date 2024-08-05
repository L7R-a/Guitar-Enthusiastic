const express = require('express');
const router = express.Router();
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const db = require('../db');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Add a new reply with a PDF file
router.post('/', upload.single('pdf'), (req, res) => {
    const { request_id, username, comment, userId, song, artist } = req.body;
    const id = uuidv4();
    const pdf = req.file.buffer;
  
    const sql = 'INSERT INTO Replies (id, request_id, username, comment, pdf, userId, song, artist) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [id, request_id, username, comment, pdf, userId, song, artist], (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ id, request_id, username, comment, date: new Date(), userId, song, artist });
    });
});

//show replies by request_id
router.get('/:request_id', (req, res) => {
    const sql = 'SELECT * FROM Replies WHERE request_id = ?';
    db.query(sql, [req.params.request_id], (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        const replies = results.map(reply => ({
          ...reply,
          pdf: reply.pdf ? reply.pdf.toString('base64') : null
        }));
        res.json(replies);
    });
});

//show replies by user_id
router.get('/user/:userId', (req, res) => {
  const sql = 'SELECT * FROM Replies WHERE userId = ?';
  db.query(sql, [req.params.userId], (err, results) => {
      if (err) {
          return res.status(500).json({ error: err.message });
      }
      const replies = results.map(reply => ({
        ...reply,
        pdf: reply.pdf ? reply.pdf.toString('base64') : null
      }));
      res.json(replies);
  });
});

module.exports = router;
