// api/index.js - Vercel serverless wrapper for the Express app
const serverless = require('serverless-http');
const app = require('../app');

module.exports = serverless(app);
