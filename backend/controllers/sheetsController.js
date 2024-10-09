// backend/controllers/sheetsController.js

const {
  fetchLeadData,
  fetchLeadsByDateHierarchy,
  updateLeadComment,
  updateLeadSchedule,
  updateLeadLabel,
} = require('../services/sheetsService');

// Controller to handle fetching lead data
exports.getLeadData = async (req, res, next) => {
  try {
    const { leads, labels } = await fetchLeadData(); // Fetch data from Google Sheets
    res.status(200).json({ leads, labels });
  } catch (error) {
    console.error('Error fetching lead data:', error); // Log the exact error
    next(error); // Pass error to the error-handling middleware
  }
};

// Controller to handle adding a comment
exports.addComment = async (req, res, next) => {
  const { id } = req.params; // Lead row ID (index)
  const { comment } = req.body; // The new comment to be added

  console.log(`Updating comment for lead with ID: ${id}`);
  console.log(`New comment: ${comment}`);

  try {
    await updateLeadComment(parseInt(id, 10), comment);
    res.status(200).json({ message: 'Comment updated successfully' });
  } catch (error) {
    console.error('Error updating comment:', error);
    next(error); // Pass error to the error-handling middleware
  }
};

// Controller to handle updating the schedule
exports.updateSchedule = async (req, res, next) => {
  const { id } = req.params; // Lead row ID (index)
  const { schedule } = req.body; // The new schedule to be added

  console.log(`Updating schedule for lead with ID: ${id}`);
  console.log(`New schedule: ${schedule}`);

  try {
    await updateLeadSchedule(parseInt(id, 10), schedule);
    res.status(200).json({ message: 'Schedule updated successfully' });
  } catch (error) {
    console.error('Error updating schedule:', error);
    next(error); // Pass error to the error-handling middleware
  }
};

// Controller to handle updating the label
exports.updateLabel = async (req, res, next) => {
  const { id } = req.params; // Lead row ID (index)
  const { label } = req.body; // The new label to be added

  console.log(`Updating label for lead with ID: ${id}`);
  console.log(`New label: ${label}`);

  try {
    await updateLeadLabel(parseInt(id, 10), label);
    res.status(200).json({ message: 'Label updated successfully' });
  } catch (error) {
    console.error('Error updating label:', error);
    next(error); // Pass error to the error-handling middleware
  }
};

// Controller to handle fetching lead data by date hierarchy
exports.getLeadsByDateHierarchy = async (req, res, next) => {
  try {
    console.log('Fetching leads by date hierarchy');
    const dateHierarchy = await fetchLeadsByDateHierarchy();
    res.status(200).json({ dateHierarchy });
  } catch (error) {
    console.error('Error fetching lead data by date hierarchy:', error);
    next(error); // Pass error to the error-handling middleware
  }
};
