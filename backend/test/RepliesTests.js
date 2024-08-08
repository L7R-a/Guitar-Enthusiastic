const request = require('supertest');
const chai = require('chai');
const app = require('../server.js');
const { expect } = chai;
const db = require('../db');


describe('POST /api/replies', () => {
    // TEST CASE 1: SUCCESSFUL UPLOAD
    it('should successfully upload a PDF and insert data into the database', (done) => {
      // Mock the database query function
      const originalQuery = db.query;
      db.query = (sql, params, callback) => {
        if (sql.includes('INSERT INTO Replies')) {
          return callback(null, { insertId: 1 }); // Simulate a successful insert
        }
      };
  
      const formData = {
        request_id: 'req123',
        username: 'testuser',
        comment: 'This is a test comment',
        userId: 'user123',
        song: 'Test Song',
        artist: 'Test Artist'
      };
  
      request(app)
        .post('/api/replies')
        .attach('pdf', Buffer.from('fake pdf content', 'utf-8'), 'test.pdf') // Simulate file upload
        .field('request_id', formData.request_id)
        .field('username', formData.username)
        .field('comment', formData.comment)
        .field('userId', formData.userId)
        .field('song', formData.song)
        .field('artist', formData.artist)
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
  
          expect(res.body).to.have.property('id');
          expect(res.body).to.have.property('request_id', formData.request_id);
          expect(res.body).to.have.property('username', formData.username);
          expect(res.body).to.have.property('comment', formData.comment);
          expect(res.body).to.have.property('date');
          expect(res.body).to.have.property('userId', formData.userId);
          expect(res.body).to.have.property('song', formData.song);
          expect(res.body).to.have.property('artist', formData.artist);
  
          db.query = originalQuery; // Restore the original query function
          done();
        });
    });
  
    // TEST CASE 2: SERVER ERROR
    it('should return status 500 if there is a server error', (done) => {
      // Mock the database query function to simulate an error
      const originalQuery = db.query;
      db.query = (sql, params, callback) => {
        if (sql.includes('INSERT INTO Replies')) {
          return callback(new Error('Database error'), null); // Simulate a database error
        }
      };
  
      const formData = {
        request_id: 'req123',
        username: 'testuser',
        comment: 'This is a test comment',
        userId: 'user123',
        song: 'Test Song',
        artist: 'Test Artist'
      };
  
      request(app)
        .post('/api/replies')
        .attach('pdf', Buffer.from('fake pdf content', 'utf-8'), 'test.pdf') // Simulate file upload
        .field('request_id', formData.request_id)
        .field('username', formData.username)
        .field('comment', formData.comment)
        .field('userId', formData.userId)
        .field('song', formData.song)
        .field('artist', formData.artist)
        .expect('Content-Type', /json/)
        .expect(500)
        .end((err, res) => {
          if (err) return done(err);
  
          expect(res.body).to.have.property('error', 'Database error');
  
          db.query = originalQuery; // Restore the original query function
          done();
        });
    });
  });
  
  describe('GET /api/replies/:request_id', () => {
    // TEST CASE 1: SUCCESSFUL RETRIEVAL
    it('should retrieve replies for the given request_id', (done) => {
      // Mock the database query function
      const originalQuery = db.query;
      db.query = (sql, params, callback) => {
        if (sql.includes('SELECT * FROM Replies WHERE request_id = ?')) {
          // Mock reply data
          return callback(null, [
            {
              id: '1',
              request_id: params[0],
              username: 'testuser1',
              comment: 'Test comment 1',
              pdf: Buffer.from('fake pdf content', 'utf-8'),
              userId: 'user1',
              song: 'Song 1',
              artist: 'Artist 1'
            },
            {
              id: '2',
              request_id: params[0],
              username: 'testuser2',
              comment: 'Test comment 2',
              pdf: null,
              userId: 'user2',
              song: 'Song 2',
              artist: 'Artist 2'
            }
          ]);
        }
      };
  
      request(app)
        .get('/api/replies/req123')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
  
          expect(res.body).to.be.an('array').that.is.not.empty;
  
          res.body.forEach(reply => {
            expect(reply).to.have.property('id');
            expect(reply).to.have.property('request_id', 'req123');
            expect(reply).to.have.property('username');
            expect(reply).to.have.property('comment');
            expect(reply).to.have.property('pdf');
            expect(reply).to.have.property('userId');
            expect(reply).to.have.property('song');
            expect(reply).to.have.property('artist');
          });
  
          db.query = originalQuery; // Restore the original query function
          done();
        });
    });
    it('should return an empty array if no replies are found for the given request_id', (done) => {
      // Mock the database query function
      const originalQuery = db.query;
      db.query = (sql, params, callback) => {
        if (sql.includes('SELECT * FROM Replies WHERE request_id = ?')) {
          return callback(null, []); // No replies found
        }
      };
    
      request(app)
        .get('/api/replies/req123')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
    
          expect(res.body).to.be.an('array').that.is.empty;
    
          db.query = originalQuery; // Restore the original query function
          done();
        });
    });
    // TEST CASE 3: SERVER ERROR
  it('should return status 500 if there is a server error', (done) => {
    // Mock the database query function to simulate a server error
    const originalQuery = db.query;
    db.query = (sql, params, callback) => {
      if (sql.includes('SELECT * FROM Replies WHERE request_id = ?')) {
        return callback(new Error('Database error'), null); // Simulate a database error
      }
    };
  
    request(app)
      .get('/api/replies/req123')
      .expect('Content-Type', /json/)
      .expect(500)
      .end((err, res) => {
        if (err) return done(err);
  
        expect(res.body).to.have.property('error', 'Database error');
  
        db.query = originalQuery; // Restore the original query function
        done();
      });
  });
  
  });
  
  describe('GET /api/replies/user/:userId', () => {
    // TEST CASE 1: SUCCESSFUL RETRIEVAL
    it('should retrieve replies for the given userId', (done) => {
      // Mock the database query function
      const originalQuery = db.query;
      db.query = (sql, params, callback) => {
        if (sql.includes('SELECT * FROM Replies WHERE userId = ?')) {
          // Mock reply data
          return callback(null, [
            {
              id: '1',
              request_id: 'req123',
              username: 'testuser1',
              comment: 'Test comment 1',
              pdf: Buffer.from('fake pdf content', 'utf-8'),
              userId: params[0],
              song: 'Song 1',
              artist: 'Artist 1'
            },
            {
              id: '2',
              request_id: 'req124',
              username: 'testuser2',
              comment: 'Test comment 2',
              pdf: null,
              userId: params[0],
              song: 'Song 2',
              artist: 'Artist 2'
            }
          ]);
        }
      };
  
      request(app)
        .get('/api/replies/user/user1')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
  
          expect(res.body).to.be.an('array').that.is.not.empty;
  
          res.body.forEach(reply => {
            expect(reply).to.have.property('id');
            expect(reply).to.have.property('request_id');
            expect(reply).to.have.property('username');
            expect(reply).to.have.property('comment');
            expect(reply).to.have.property('pdf');
            expect(reply).to.have.property('userId', 'user1');
            expect(reply).to.have.property('song');
            expect(reply).to.have.property('artist');
          });
  
          db.query = originalQuery; // Restore the original query function
          done();
        });
    });
    // TEST CASE 2: NO REPLIES FOUND
  it('should return an empty array if no replies are found for the given userId', (done) => {
    // Mock the database query function
    const originalQuery = db.query;
    db.query = (sql, params, callback) => {
      if (sql.includes('SELECT * FROM Replies WHERE userId = ?')) {
        return callback(null, []); // No replies found
      }
    };
  
    request(app)
      .get('/api/replies/user/user1')
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
  
        expect(res.body).to.be.an('array').that.is.empty;
  
        db.query = originalQuery; // Restore the original query function
        done();
      });
  });
  // TEST CASE 3: SERVER ERROR
  it('should return status 500 if there is a server error', (done) => {
    // Mock the database query function to simulate a server error
    const originalQuery = db.query;
    db.query = (sql, params, callback) => {
      if (sql.includes('SELECT * FROM Replies WHERE userId = ?')) {
        return callback(new Error('Database error'), null); // Simulate a database error
      }
    };
  
    request(app)
      .get('/api/replies/user/user1')
      .expect('Content-Type', /json/)
      .expect(500)
      .end((err, res) => {
        if (err) return done(err);
  
        expect(res.body).to.have.property('error', 'Database error');
  
        db.query = originalQuery; // Restore the original query function
        done();
      });
  });
  
  });