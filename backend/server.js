// backend/server.js

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const googleSheetsRoutes = require('./routes/googleSheets');

const app = express();

// Enable CORS for frontend (localhost:3001)
app.use(
  cors({
    origin: 'http://localhost:3001',
  })
);

app.use(bodyParser.json());

// Use the Google Sheets API routes
app.use('/api', googleSheetsRoutes);

// Default route for health check
app.get('/', (req, res) => {
  res.send('Welcome to the Lead Management API');
});

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the detailed error stack on the server
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message, // Include the error message
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
