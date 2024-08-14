//IMPORTS
const mysql = require('mysql2'); // IMPORT MYSQL LIBRARY TO CONNECT TO DATABASE
const dotenv = require('dotenv'); // IMPORT CREDENTIALS OF DATABASE
const fs = require('fs');

//INITIALIZER
dotenv.config(); // GET CREDS FROM .ENV FILE

//GET A VARIABLE THAT CAN CONNECT TO THE DATABASE
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl:{ca:fs.readFileSync(process.env.DB_SSL)}
});

//TRY TO ACTUALLY CONNECT TO THE DATABASE
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err.message);
    return;
  }
  console.log('Connected to MySQL');
});

//EXPORT THE CONNECTION
module.exports = db;
