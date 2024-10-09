// backend/routes/googleSheets.js

const express = require('express');
const {
  getLeadData,
  getLeadsByDateHierarchy,
  addComment,
  updateSchedule,
  updateLabel,
} = require('../controllers/sheetsController');
const router = express.Router();

// Route to fetch lead cards from Google Sheets
router.get('/lead-cards', getLeadData);

// Route to update the lead comment in the Google Sheets
router.post('/lead/:id/comment', addComment);

// Route to update the lead schedule in the Google Sheets
router.post('/lead/:id/schedule', updateSchedule);

// Route to update the lead label in the Google Sheets
router.post('/lead/:id/label', updateLabel);

// Route to fetch lead data organized by date hierarchy
router.get('/lead-hierarchy', getLeadsByDateHierarchy);


module.exports = router;
