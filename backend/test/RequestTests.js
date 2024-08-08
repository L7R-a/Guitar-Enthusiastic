const request = require('supertest');
const chai = require('chai');
const app = require('../server.js');
const { expect } = chai;
const db = require('../db');

describe('POST /api/requests', () => {

    // TEST CASE 1: SUCCESS CASE
    it('should add a new request successfully', (done) => {
      // Mock the query to simulate a successful insert
      const originalQuery = db.query;
      db.query = (query, params, callback) => {
        if (query.includes('INSERT')) {
          return callback(null, { insertId: 1 }); // Mock successful insert
        }
      };
  
      const newRequest = {
        id: '1',
        user: 'user1',
        song: 'song1',
        artist: 'artist1',
        comment: 'comment1',
        link: 'http://example.com',
        userId: 'userId1'
      };
  
      request(app)
        .post('/api/requests')
        .send(newRequest)
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
  
          expect(res.body).to.have.property('id', '1');
          expect(res.body).to.have.property('user', 'user1');
          expect(res.body).to.have.property('song', 'song1');
          expect(res.body).to.have.property('artist', 'artist1');
          expect(res.body).to.have.property('comment', 'comment1');
          expect(res.body).to.have.property('date');
          expect(res.body).to.have.property('number_of_replies', 0);
          expect(res.body).to.have.property('link', 'http://example.com');
          expect(res.body).to.have.property('userId', 'userId1');
  
          db.query = originalQuery; // Restore the original query function
          done();
        });
    });
  
    // TEST CASE 2: SERVER ERROR
    it('should return status 500 if there is a server error', (done) => {
      // Mock the query to simulate a server error
      const originalQuery = db.query;
      db.query = (query, params, callback) => {
        if (query.includes('INSERT')) {
          return callback(new Error('Database error'), null); // Simulate a database error
        }
      };
  
      const newRequest = {
        id: '1',
        user: 'user1',
        song: 'song1',
        artist: 'artist1',
        comment: 'comment1',
        link: 'http://example.com',
        userId: 'userId1'
      };
  
      request(app)
        .post('/api/requests')
        .send(newRequest)
        .expect('Content-Type', /json/)
        .expect(500)
        .end((err, res) => {
          if (err) return done(err);
  
          expect(res.body).to.have.property('error', 'Database error'); // Check for the error message
  
          db.query = originalQuery; // Restore the original query function
          done();
        });
    });
  });
  
  describe('GET /api/requests/search/:text', () => {
    // TEST CASE 1: SUCCESSFUL SEARCH
    it('should return search results for valid text', (done) => {
      // Mock the query to return some search results
      const originalQuery = db.query;
      db.query = (query, params, callback) => {
        if (query.includes('SELECT')) {
          return callback(null, [
            { id: '1', user: 'testuser', song: 'testsong', artist: 'testartist', comment: 'testcomment', date: '2024-08-01', number_of_replies: 2, link: 'testlink', userId: '1' }
          ]); // Mock search results
        }
      };
  
      request(app)
        .get('/api/requests/search/test')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
  
          expect(res.body).to.be.an('array');
          expect(res.body.length).to.be.greaterThan(0);
          expect(res.body[0]).to.have.property('id', '1');
          expect(res.body[0]).to.have.property('user', 'testuser');
          expect(res.body[0]).to.have.property('song', 'testsong');
          expect(res.body[0]).to.have.property('artist', 'testartist');
          expect(res.body[0]).to.have.property('comment', 'testcomment');
          expect(res.body[0]).to.have.property('date', '2024-08-01');
          expect(res.body[0]).to.have.property('number_of_replies', 2);
          expect(res.body[0]).to.have.property('link', 'testlink');
          expect(res.body[0]).to.have.property('userId', '1');
  
          db.query = originalQuery; // Restore the original query function
          done();
        });
    });
  
    // TEST CASE 2: NO RESULTS FOUND
    it('should return an empty array if no results are found', (done) => {
      // Mock the query to return no results
      const originalQuery = db.query;
      db.query = (query, params, callback) => {
        if (query.includes('SELECT')) {
          return callback(null, []); // No results found
        }
      };
  
      request(app)
        .get('/api/requests/search/nothing')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
  
          expect(res.body).to.be.an('array').that.is.empty;
  
          db.query = originalQuery; // Restore the original query function
          done();
        });
    });
  
    // TEST CASE 3: DATABASE ERROR
    it('should return status 500 if there is a database error', (done) => {
      // Mock the query to simulate a database error
      const originalQuery = db.query;
      db.query = (query, params, callback) => {
        if (query.includes('SELECT')) {
          return callback(new Error('Database error'), null); // Simulate a database error
        }
      };
  
      request(app)
        .get('/api/requests/search/test')
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
  
  describe('GET /api/requests/:id', () => {
    // TEST CASE 1: SUCCESSFUL RETRIEVAL
    it('should return the request for a valid ID', (done) => {
      // Mock the query to return a request for the provided ID
      const originalQuery = db.query;
      db.query = (query, params, callback) => {
        if (query.includes('SELECT')) {
          return callback(null, [
            { id: '1', user: 'testuser', song: 'testsong', artist: 'testartist', comment: 'testcomment', date: '2024-08-01', number_of_replies: 2, link: 'testlink', userId: '1' }
          ]); // Mock request data
        }
      };
  
      request(app)
        .get('/api/requests/1')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
  
          expect(res.body).to.have.property('id', '1');
          expect(res.body).to.have.property('user', 'testuser');
          expect(res.body).to.have.property('song', 'testsong');
          expect(res.body).to.have.property('artist', 'testartist');
          expect(res.body).to.have.property('comment', 'testcomment');
          expect(res.body).to.have.property('date', '2024-08-01');
          expect(res.body).to.have.property('number_of_replies', 2);
          expect(res.body).to.have.property('link', 'testlink');
          expect(res.body).to.have.property('userId', '1');
  
          db.query = originalQuery; // Restore the original query function
          done();
        });
    });
  
    // TEST CASE 2: REQUEST NOT FOUND
    it('should return status 404 if the request is not found', (done) => {
      // Mock the query to return no results for the provided ID
      const originalQuery = db.query;
      db.query = (query, params, callback) => {
        if (query.includes('SELECT')) {
          return callback(null, []); // No request found with the given ID
        }
      };
  
      request(app)
        .get('/api/requests/9999')
        .expect('Content-Type', /json/)
        .expect(404)
        .end((err, res) => {
          if (err) return done(err);
  
          expect(res.body).to.have.property('error', 'Request not found');
  
          db.query = originalQuery; // Restore the original query function
          done();
        });
    });
  
    // TEST CASE 3: DATABASE ERROR
    it('should return status 500 if there is a database error', (done) => {
      // Mock the query to simulate a database error
      const originalQuery = db.query;
      db.query = (query, params, callback) => {
        if (query.includes('SELECT')) {
          return callback(new Error('Database error'), null); // Simulate a database error
        }
      };
  
      request(app)
        .get('/api/requests/1')
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
describe('GET /api/requests/user/:userId', () => {
    // TEST CASE 1: SUCCESSFUL RETRIEVAL
    it('should return requests for a valid user ID', (done) => {
      // Mock the query to return requests for the provided user ID
      const originalQuery = db.query;
      db.query = (query, params, callback) => {
        if (query.includes('SELECT')) {
          return callback(null, [
            { id: '1', user: 'testuser1', song: 'testsong1', artist: 'testartist1', comment: 'testcomment1', date: '2024-08-01', number_of_replies: 2, link: 'testlink1', userId: 'user1' },
            { id: '2', user: 'testuser2', song: 'testsong2', artist: 'testartist2', comment: 'testcomment2', date: '2024-08-02', number_of_replies: 3, link: 'testlink2', userId: 'user1' }
          ]); // Mock request data for the user ID
        }
      };
  
      request(app)
        .get('/api/requests/user/user1')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
  
          expect(res.body).to.be.an('array').that.has.lengthOf(2);
  
          // Check the first request
          expect(res.body[0]).to.have.property('id', '1');
          expect(res.body[0]).to.have.property('user', 'testuser1');
          expect(res.body[0]).to.have.property('song', 'testsong1');
          expect(res.body[0]).to.have.property('artist', 'testartist1');
          expect(res.body[0]).to.have.property('comment', 'testcomment1');
          expect(res.body[0]).to.have.property('date', '2024-08-01');
          expect(res.body[0]).to.have.property('number_of_replies', 2);
          expect(res.body[0]).to.have.property('link', 'testlink1');
          expect(res.body[0]).to.have.property('userId', 'user1');
  
          // Check the second request
          expect(res.body[1]).to.have.property('id', '2');
          expect(res.body[1]).to.have.property('user', 'testuser2');
          expect(res.body[1]).to.have.property('song', 'testsong2');
          expect(res.body[1]).to.have.property('artist', 'testartist2');
          expect(res.body[1]).to.have.property('comment', 'testcomment2');
          expect(res.body[1]).to.have.property('date', '2024-08-02');
          expect(res.body[1]).to.have.property('number_of_replies', 3);
          expect(res.body[1]).to.have.property('link', 'testlink2');
          expect(res.body[1]).to.have.property('userId', 'user1');
  
          db.query = originalQuery; // Restore the original query function
          done();
        });
    });
  
    // TEST CASE 2: NO REQUESTS FOUND
    it('should return an empty array if no requests are found for the user ID', (done) => {
      // Mock the query to return no requests for the provided user ID
      const originalQuery = db.query;
      db.query = (query, params, callback) => {
        if (query.includes('SELECT')) {
          return callback(null, []); // No requests found for the user ID
        }
      };
  
      request(app)
        .get('/api/requests/user/unknownuser')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
  
          expect(res.body).to.be.an('array').that.is.empty;
  
          db.query = originalQuery; // Restore the original query function
          done();
        });
    });
  
    // TEST CASE 3: DATABASE ERROR
    it('should return status 500 if there is a database error', (done) => {
      // Mock the query to simulate a database error
      const originalQuery = db.query;
      db.query = (query, params, callback) => {
        if (query.includes('SELECT')) {
          return callback(new Error('Database error'), null); // Simulate a database error
        }
      };
  
      request(app)
        .get('/api/requests/user/user1')
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
describe('PUT /api/requests/:id', () => {
    // TEST CASE 1: SUCCESSFUL UPDATE
    it('should increment the number of replies for a valid request ID', (done) => {
      // Mock the query to simulate a successful update
      const originalQuery = db.query;
      db.query = (query, params, callback) => {
        if (query.includes('UPDATE')) {
          return callback(null, { affectedRows: 1 }); // Simulate successful update
        }
      };
  
      request(app)
        .put('/api/requests/validRequestId')
        .expect('Content-Type', /json/)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
  
          expect(res.body).to.have.property('message', 'Request updated successfully');
  
          db.query = originalQuery; // Restore the original query function
          done();
        });
    });
  
    // TEST CASE 2: REQUEST NOT FOUND
    it('should return status 404 if the request ID is not found', (done) => {
      // Mock the query to simulate the request not being found
      const originalQuery = db.query;
      db.query = (query, params, callback) => {
        if (query.includes('UPDATE')) {
          return callback(null, { affectedRows: 0 }); // Simulate request not found
        }
      };
  
      request(app)
        .put('/api/requests/invalidRequestId')
        .expect('Content-Type', /json/)
        .expect(404)
        .end((err, res) => {
          if (err) return done(err);
  
          expect(res.body).to.have.property('error', 'Request not found');
  
          db.query = originalQuery; // Restore the original query function
          done();
        });
    });
  
    // TEST CASE 3: DATABASE ERROR
    it('should return status 500 if there is a database error', (done) => {
      // Mock the query to simulate a database error
      const originalQuery = db.query;
      db.query = (query, params, callback) => {
        if (query.includes('UPDATE')) {
          return callback(new Error('Database error'), null); // Simulate database error
        }
      };
  
      request(app)
        .put('/api/requests/validRequestId')
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
  