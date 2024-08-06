const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'APIs For Replies',
    description: 'API Documentation Replies',
  },
  host: 'localhost:5000', 
  schemes: ['http'],
  basePath: '/api/replies',
};

const outputFile = './swagger-replies.json';
const endpointsFiles = ['./routes/replies.js']; 

swaggerAutogen(outputFile, endpointsFiles, doc);