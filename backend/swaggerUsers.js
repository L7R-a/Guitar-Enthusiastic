const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'APIs For Users',
    description: 'API Documentation Users',
  },
  host: 'localhost:5000', 
  schemes: ['http'],
  basePath: '/api/users',
};

const outputFile = './swagger-users.json';
const endpointsFiles = ['./routes/users.js']; 

swaggerAutogen(outputFile, endpointsFiles, doc);