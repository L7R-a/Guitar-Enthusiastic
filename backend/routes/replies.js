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

  // #swagger.description = 'Endpoint used to add a new reply with a PDF file.'
  // #swagger.summary = 'Add a new reply with a PDF file.'
  /* #swagger.consumes = ['multipart/form-data'] */
  /* #swagger.parameters['pdf'] = {
          in: 'formData',
          type: 'file',
          required: true,
          description: 'The PDF file to upload.'
  } */
  /* #swagger.parameters['request_id'] = {
          in: 'formData',
          type: 'string',
          required: true,
          description: 'The ID of the request.'
  } */
  /* #swagger.parameters['username'] = {
          in: 'formData',
          type: 'string',
          required: true,
          description: 'The username of the person replying.'
  } */
  /* #swagger.parameters['comment'] = {
          in: 'formData',
          type: 'string',
          required: true,
          description: 'The comment for the reply.'
  } */
  /* #swagger.parameters['userId'] = {
          in: 'formData',
          type: 'string',
          required: true,
          description: 'The ID of the user.'
  } */
  /* #swagger.parameters['song'] = {
          in: 'formData',
          type: 'string',
          required: true,
          description: 'The song related to the reply.'
  } */
  /* #swagger.parameters['artist'] = {
          in: 'formData',
          type: 'string',
          required: true,
          description: 'The artist related to the reply.'
  } */
  /* #swagger.responses[500] = {
      description: 'Internal server error.',
      schema: { error: 'string' }
  } */
  /* #swagger.responses[200] = {
        description: 'Successfully added the reply.',
        schema: {
          id: 'string',
          request_id: 'string',
          username: 'string',
          comment: 'string',
          date: 'string',
          userId: 'string',
          song: 'string',
          artist: 'string'
        }
  } */
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

        // #swagger.description = 'Endpoint used to obtain replies by request ID.'
    // #swagger.summary = 'Get replies by request ID.'
    /* #swagger.parameters['request_id'] = {
            in: 'path',
            type: 'string',
            required: true,
            description: 'The ID of the request.'
    } */
    /* #swagger.responses[500] = {
        description: 'Internal server error.',
        schema: { error: 'string' }
    } */
    /* #swagger.responses[200] = {
          description: 'Successfully retrieved the replies.',
          schema: [{
            id: 'string',
            request_id: 'string',
            username: 'string',
            comment: 'string',
            date: 'string',
            userId: 'string',
            song: 'string',
            artist: 'string',
            pdf: 'string'
          }]
    } */ 
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

      // #swagger.description = 'Endpoint used to obtain replies by user ID.'
    // #swagger.summary = 'Get replies by user ID.'
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
          description: 'Successfully retrieved the replies.',
          schema: [{
            id: 'string',
            request_id: 'string',
            username: 'string',
            comment: 'string',
            date: 'string',
            userId: 'string',
            song: 'string',
            artist: 'string',
            pdf: 'string'
          }]
    } */
});

module.exports = router;
