const request = require('supertest');
const chai = require('chai');
const app = require('../server.js');
const { expect } = chai;
const db = require('../db');


// GET ALL USERS API ENDPOINT
describe('GET /api/users', () => {

  //TEST CASE 1: SUCCESS CASE
  it('should retrieve all users', (done) => {
    request(app) // ACCESS THE APP
      .get('/api/users') // MAKE A GET REQUEST TO THIS ENDPOINT
      .expect('Content-Type', /json/) // EXPECT THE RESPONSE TO BE IN JSON FORMAT
      .expect(200) // EXPECT A 200 STATUS CODE FROM THE SERVER RESPONSE
      .end((err, res) => {
        if (err) return done(err); // IF THERE IS AN ERROR, RETURN THE FAIL

        expect(res.body).to.be.an('array'); // THE RESPONSE IS A JSON WITH A 200 STATUS CODE WITH A RESPONSE BODY
                                            // THAT IS AN ARRAY

        if (res.body.length > 0) { // IF THE ARRAY HAS MORE THAN 0 ELEMENTS
           res.body.forEach(user => {
            // console.log(user); // LOG EACH USER OBJECT FOR DEBUGGING
           expect(user).to.have.all.keys( // EXPECT EACH ELEMENT TO HAVE ALL THESE KEYS
           'id', 'username', 'name', 'email', 'password', 'created_at', 'requestsNum', 'repliesNum'
       );
       });
      }
        done(); // IF ALL TESTS PASS, RETURN SUCCESS
      });
  });

  //TEST CASE 2 : ERROR CASE
  it('should return status 500 if there is a server error', (done) => {
    const originalQuery = db.query; // SAVE THE ORIGINAL QUERY FUNCTION. (The one from the API endpoint)
    db.query = (query, callback) => { // MAKE DB.QUERY RETURN AN ERROR
      callback(new Error('Database error'), null); // RETURN AN ERROR
    };

    request(app) // ACCESS THE APP
      .get('/api/users') // MAKE A GET REQUEST TO THIS ENDPOINT
      .expect('Content-Type', /json/) // EXPECT THE RESPONSE TO BE IN JSON FORMAT
      .expect(500) // EXPECT A 500 STATUS CODE FROM THE SERVER RESPONSE
      .end((err, res) => { 
        if (err) return done(err); // IF THERE IS AN ERROR (WITH THE ENDPOINT REQUEST CALL, NOT THE BODY) , RETURN THE FAIL

        // SHOULD BE AN ERROR BECAUSE WE FIRST CHANGE THE DB QUERY AND THEN MAKE THE API REQUEST
        // MAKING RES.BODY AN ERROR
        expect(res.body).to.have.property('error'); // EXPECT THE RESPONSE BODY TO HAVE AN ERROR PROPERTY
        expect(res.body.error).to.equal('Database error'); // EXPECT THE ERROR PROPERTY TO BE 'Database error'

        db.query = originalQuery; // RESTORE THE ORIGINAL QUERY FUNCTION

        done(); // IF ALL TESTS PASS, RETURN SUCCESS
      });
  });
});

// ADD USER API ENDPOINT
describe('POST /api/users', () => {

  // TEST CASE 1: SUCCESS CASE
  it('should add a new user successfully', (done) => {
    // Mock the query to return no existing user
    const originalQuery = db.query;

    //MAKE DB.QUERY TO ALWAYS SUCCESS WITH ANY INPUT
    db.query = (query, params, callback) => {
      if (query.includes('SELECT')) {     // This is for the first query inside the this API endpoint
        return callback(null, []);        // Set the req to be an empty array and no error.
                                          // Empty because there is no user with this name
      }
      if (query.includes('INSERT')) {     // This is for the second query inside the this API endpoint
        return callback(null, { insertId: 1 }); // Success with an insertId of 1 (the first user)
      }
    };

    const newUser = { username: 'testuser', name: 'Test User', email: 'test@example.com', password: 'password' };

    request(app)
      .post('/api/users')
      .send(newUser)
      .expect('Content-Type', /json/)
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);
        // console.log(res.body);

        //This id is the insertId of the second query. 
        //The way it got here is similar to how we get the data in the main APi endpoint
        expect(res.body).to.have.property('id', 1); 
        expect(res.body).to.have.property('username', newUser.username);
        expect(res.body).to.have.property('name', newUser.name);
        expect(res.body).to.have.property('email', newUser.email);

        db.query = originalQuery; // Restore the original query function
        done();
      });
  });

  // TEST CASE 2: USERNAME ALREADY EXISTS
  it('should return status 400 if the username already exists', (done) => {
    // Mock the query to return an existing user
    const originalQuery = db.query;
    db.query = (query, params, callback) => {
      if (query.includes('SELECT')) {
        return callback(null, [{ id: 1, username: 'testuser' }]); // We found a user with the same username in the database
      }
    };

    const newUser = { username: 'testuser', name: 'Test User', email: 'test@example.com', password: 'password' };

    request(app)
      .post('/api/users')
      .send(newUser)
      .expect('Content-Type', /json/)
      .expect(400)
      .end((err, res) => {
        if (err) return done(err);

        expect(res.body).to.have.property('error', 'Username already exists');

        db.query = originalQuery; // Restore the original query function
        done();
      });
  });

  // TEST CASE 3: INTERNAL SERVER ERROR
  it('should return status 500 if there is a server error', (done) => {
    // Mock the query to return an error
    const originalQuery = db.query;
    db.query = (query, params, callback) => {
      return callback(new Error('Database error'), null); // Simulate a database error
    };

    const newUser = { username: 'testuser', name: 'Test User', email: 'test@example.com', password: 'password' };

    request(app)
      .post('/api/users')
      .send(newUser)
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


//LOGIN API ENDPOINT
describe('POST /api/users/login', () => {

  // TEST CASE 1: SUCCESS CASE
  it('should log in a user with valid credentials', (done) => {
    // Mock the query to return a user with the provided username and password
    const originalQuery = db.query;
    db.query = (query, params, callback) => {
      if (query.includes('SELECT')) {
        return callback(null, [{ id: 1, username: 'testuser', name: 'Test User', email: 'test@example.com', password: 'password', requestsNum: 5, repliesNum: 10 }]); // Mock user data
      }
    };

    const loginData = { username: 'testuser', password: 'password' };

    request(app)
      .post('/api/users/login') // Ensure the endpoint is correct
      .send(loginData)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        expect(res.body).to.have.property('id', 1);
        expect(res.body).to.have.property('username', 'testuser');
        expect(res.body).to.have.property('name', 'Test User');
        expect(res.body).to.have.property('email', 'test@example.com');
        expect(res.body).to.have.property('password', 'password');
        expect(res.body).to.have.property('requestsNum', 5);
        expect(res.body).to.have.property('repliesNum', 10);

        db.query = originalQuery; // Restore the original query function
        done();
      });
  });

  // TEST CASE 2: INVALID CREDENTIALS
  it('should return status 401 for invalid credentials', (done) => {
    // Mock the query to return no results for the provided credentials
    const originalQuery = db.query;
    db.query = (query, params, callback) => {
      if (query.includes('SELECT')) {
        return callback(null, []); // No user found with the given username and password
      }
    };

    const loginData = { username: 'wronguser', password: 'wrongpassword' };

    request(app)
      .post('/api/users/login') // Ensure the endpoint is correct
      .send(loginData)
      .expect('Content-Type', /json/)
      .expect(401) // Change to 401 for unauthorized access
      .end((err, res) => {
        if (err) return done(err);

        expect(res.body).to.have.property('error', 'Invalid credentials'); // Check for the appropriate error message

        db.query = originalQuery; // Restore the original query function
        done();
      });
  });

  // TEST CASE 3: SERVER ERROR
  it('should return status 500 if there is a server error', (done) => {
    // Mock the query to simulate a server error
    const originalQuery = db.query;
    db.query = (query, params, callback) => {
      if (query.includes('SELECT')) {
        return callback(new Error('Database error'), null); // Simulate a database error
      }
    };

    const loginData = { username: 'testuser', password: 'password' };

    request(app)
      .post('/api/users/login') // Ensure the endpoint is correct
      .send(loginData)
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

// UPDATE USER REQUESTNUM API ENDPOINT
describe('PUT /api/users/:id', () => {

  // TEST CASE 1: SUCCESS CASE
  it('should increment requestsNum successfully', (done) => {
    // Mock the query to simulate a successful update
    const originalQuery = db.query;
    db.query = (query, params, callback) => {
      if (query.includes('UPDATE')) {
        return callback(null, { affectedRows: 1 }); // Mock a successful update
      }
    };

    const userId = 1;

    request(app)
      .put(`/api/users/${userId}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        expect(res.body).to.have.property('affectedRows', 1); // Verify the response if needed

        db.query = originalQuery; // Restore the original query function
        done();
      });
  });

  // TEST CASE 2: INVALID USER ID
  it('should return status 404 if the user ID does not exist', (done) => {
    // Mock the query to simulate a situation where no rows are affected (user does not exist)
    const originalQuery = db.query;
    db.query = (query, params, callback) => {
      if (query.includes('UPDATE')) {
        return callback(null, { affectedRows: 0 }); // No rows affected
      }
    };

    const userId = 999; // Assuming this ID does not exist

    request(app)
      .put(`/api/users/${userId}`)
      .expect('Content-Type', /json/)
      .expect(404)
      .end((err, res) => {
        if (err) return done(err);

        expect(res.body).to.have.property('error', 'User ID not found'); // Check for appropriate error message

        db.query = originalQuery; // Restore the original query function
        done();
      });
  });

  // TEST CASE 3: SERVER ERROR
  it('should return status 500 if there is a server error', (done) => {
    // Mock the query to simulate a server error
    const originalQuery = db.query;
    db.query = (query, params, callback) => {
      if (query.includes('UPDATE')) {
        return callback(new Error('Database error'), null); // Simulate a database error
      }
    };

    const userId = 1;

    request(app)
      .put(`/api/users/${userId}`)
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

// UPDATE USER REPLIESNUM API ENDPOINT
describe('PUT /api/users/replies/:id', () => {

  // TEST CASE 1: SUCCESS CASE
  it('should increment requestsNum successfully', (done) => {
    // Mock the query to simulate a successful update
    const originalQuery = db.query;
    db.query = (query, params, callback) => {
      if (query.includes('UPDATE')) {
        return callback(null, { affectedRows: 1 }); // Mock a successful update
      }
    };

    const userId = 1;

    request(app)
      .put(`/api/users/replies/${userId}`)
      .expect('Content-Type', /json/)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);

        expect(res.body).to.have.property('affectedRows', 1); // Verify the response if needed

        db.query = originalQuery; // Restore the original query function
        done();
      });
  });

  // TEST CASE 2: INVALID USER ID
  it('should return status 404 if the user ID does not exist', (done) => {
    // Mock the query to simulate a situation where no rows are affected (user does not exist)
    const originalQuery = db.query;
    db.query = (query, params, callback) => {
      if (query.includes('UPDATE')) {
        return callback(null, { affectedRows: 0 }); // No rows affected
      }
    };

    const userId = 999; // Assuming this ID does not exist

    request(app)
      .put(`/api/users/replies/${userId}`)
      .expect('Content-Type', /json/)
      .expect(404)
      .end((err, res) => {
        if (err) return done(err);

        expect(res.body).to.have.property('error', 'User ID not found'); // Check for appropriate error message

        db.query = originalQuery; // Restore the original query function
        done();
      });
  });

  // TEST CASE 3: SERVER ERROR
  it('should return status 500 if there is a server error', (done) => {
    // Mock the query to simulate a server error
    const originalQuery = db.query;
    db.query = (query, params, callback) => {
      if (query.includes('UPDATE')) {
        return callback(new Error('Database error'), null); // Simulate a database error
      }
    };

    const userId = 1;

    request(app)
      .put(`/api/users/replies/${userId}`)
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
