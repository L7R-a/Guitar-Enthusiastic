//IMPORTS
const express = require('express'); // IMPORT EXPRESS
const db = require('./db'); // IMPORT DATABASE CONNECTION
const cors = require('cors'); // IMPORT CORS MIDDLEWARE FOR SECURITY MEASURES
const dotenv = require('dotenv'); // IMPORT CREDENTIALS TO DATABASE
const swaggerUi = require('swagger-ui-express');
// const swaggerFile = require('./swagger-output.json');
const swaggerUsers = require('./swagger-users.json');
const swaggerRequests = require('./swagger-requests.json');
const swaggerReplies = require('./swagger-replies.json');

const userRoutes = require('./routes/users'); // IMPORT ENDPOINTS FOR USERS
const requestRoutes = require('./routes/requests'); // IMPORT ENDPOINTS FOR REQUESTS
const replyRoutes = require('./routes/replies'); // IMPORT ENDPOINTS FOR REPLIES

//INITIALIZERS
const app = express(); // INITIALIZE EXPRESS
dotenv.config(); // GET CREDS FROM .ENV FILE
const port = process.env.PORT || 5000; // SET PORT USING THOSE CREDENTIALS OR 5000
app.use(cors()); // APPLY SECURITY MEASURES
app.use(express.json()); // ALLOW JSON INPUT FOR APIs


// GET & INITIALIZE ROUTES
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.use('/api/users', userRoutes); // USE USERS ROUTES IF THE URL IS /api/users
app.use('/api/requests', requestRoutes); // USE REQUESTS ROUTES IF THE URL IS /api/requests
app.use('/api/replies', replyRoutes);  // USE REPLIES ROUTES IF THE URL IS /api/replies


var options = {}
app.use('/api-docs-users',swaggerUi.serveFiles(swaggerUsers, options), swaggerUi.setup(swaggerUsers));
app.use('/api-docs-requests',swaggerUi.serveFiles(swaggerRequests, options), swaggerUi.setup(swaggerRequests));
app.use('/api-docs-replies',swaggerUi.serveFiles(swaggerReplies, options), swaggerUi.setup(swaggerReplies));


// START SERVER
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

