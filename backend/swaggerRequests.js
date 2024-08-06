const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'APIs For Requests',
    description: 'API Documentation Requests',
  },
  host: 'localhost:5000', 
  schemes: ['http'],
  basePath: '/api/requests',
};

const outputFile = './swagger-requests.json';
const endpointsFiles = ['./routes/requests.js']; 

swaggerAutogen(outputFile, endpointsFiles, doc);