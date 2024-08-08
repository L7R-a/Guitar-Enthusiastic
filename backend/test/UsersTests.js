const request = require('supertest');
const chai = require('chai');
const app = require('../server.js');
const { expect } = chai;
const db = require('../db.js');


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
