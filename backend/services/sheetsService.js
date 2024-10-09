// backend/services/sheetsService.js

const { google } = require('googleapis');
const path = require('path');

// Advanced error logging function
function logError(message, error) {
  console.error(`[${new Date().toISOString()}] ${message}`);
  if (error.response && error.response.data) {
    console.error('Error details:', error.response.data);
  } else {
    console.error('Error message:', error.message);
  }
}

// Helper function to convert column index to letter
function columnToLetter(columnIndex) {
  let column = columnIndex + 1; // Convert zero-based index to 1-based column number
  let temp;
  let letter = '';
  while (column > 0) {
    temp = (column - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    column = Math.floor((column - temp - 1) / 26);
  }
  return letter;
}

// Function to fetch lead data from Google Sheets
async function fetchLeadData() {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(__dirname, '../config/credentials.json'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    const spreadsheetId = process.env.SPREADSHEET_ID;

    // Fetch leads data from Sheet1
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1',
    });

    const data = response.data.values || [];

    // Fetch labels from Sheet2
    const labelsResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet2!A:A', // Adjust the range if labels are in a different column
    });

    const labelsData = labelsResponse.data.values || [];

    // Assume labels are in the first column (column A) of Sheet2, skip header row
    const labels = labelsData.slice(1)
      .map(row => row[0])
      .filter(label => label && label.trim() !== '');

    // Assume the first row is the header
    const header = data[0] || [];
    const rows = data.slice(1);

    const leads = rows.map((row, index) => {
      // Extract lead data up to column 123 (index 122)
      const leadData = row.slice(0, 123);

      // Extract the label assigned to the lead from column 125 (index 124)
      const leadLabel = row[124] || ''; // Column 'DV'

      // Extract the schedule from column 126 (index 125)
      const schedule = row[125] || ''; // Column 'DW'

      // Extract comments from columns DV (index 125) to FO (index 170)
      const comments = row.slice(125, 170).filter((cell) => cell && cell.trim() !== '');

      return {
        id: index, // index in the leads array
        data: leadData,
        schedule: schedule,
        comments: comments,
        label: leadLabel, // Add label assigned to the lead
      };
    });

    return { leads, labels };
  } catch (error) {
    logError('Failed to fetch data from Google Sheets', error);
    throw new Error('Failed to fetch data from Google Sheets');
  }
}

// Function to update the comment in a specific row
async function updateLeadComment(rowNumber, comment) {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(__dirname, '../config/credentials.json'),
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive',
      ],
    });

    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    const spreadsheetId = process.env.SPREADSHEET_ID;
    const sheetName = 'Sheet1';

    // Adjust rowIndex to skip the header row
    const rowIndex = rowNumber + 2; // Rows are 1-based, and we skip the header

    // Comments start from index 125 (zero-based), which is column 126 ('DV')
    const commentsStartColumnIndex = 125;

    // Comments end at index 170 (zero-based), which is column 171 ('FO')
    const commentsEndColumnIndex = 170;

    // Get the current row data
    const rowRange = `${sheetName}!${rowIndex}:${rowIndex}`; // Entire row
    const rowResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: rowRange,
    });

    let rowData = rowResponse.data.values ? rowResponse.data.values[0] : [];

    // Ensure rowData has enough elements up to commentsEndColumnIndex
    if (rowData.length <= commentsEndColumnIndex) {
      rowData = rowData.concat(
        Array(commentsEndColumnIndex - rowData.length + 1).fill('')
      );
    }

    // Find the next empty cell within the comments range
    let nextColumnIndex = commentsStartColumnIndex;
    while (
      nextColumnIndex <= commentsEndColumnIndex &&
      rowData[nextColumnIndex] &&
      rowData[nextColumnIndex].trim() !== ''
    ) {
      nextColumnIndex++;
    }

    if (nextColumnIndex > commentsEndColumnIndex) {
      throw new Error('No empty comment cells available.');
    }

    const columnLetter = columnToLetter(nextColumnIndex);
    const cellRange = `${sheetName}!${columnLetter}${rowIndex}`;

    console.log(`Writing comment to cell: ${cellRange}`);

    // Get current date and time
    const now = new Date();
    const formattedDateTime = now.toLocaleString();

    // Prefix the comment with date and time
    const commentWithDateTime = `${formattedDateTime}: ${comment}`;

    // Write the comment to the cell
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: cellRange,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[commentWithDateTime]],
      },
    });

    console.log('Comment updated successfully.');
  } catch (error) {
    logError('Failed to update the comment', error);
    throw new Error('Failed to update the comment');
  }
}

// Function to update the schedule in a specific row
async function updateLeadSchedule(rowNumber, schedule) {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(__dirname, '../config/credentials.json'),
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive',
      ],
    });

    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    const spreadsheetId = process.env.SPREADSHEET_ID;
    const sheetName = 'Sheet1';

    // Adjust rowIndex to skip the header row
    const rowIndex = rowNumber + 2; // Rows are 1-based, and we skip the header

    // Schedule is now in index 125 (zero-based), which is column 126 ('DW')
    const scheduleColumnIndex = 125;

    const columnLetter = columnToLetter(scheduleColumnIndex);
    const cellRange = `${sheetName}!${columnLetter}${rowIndex}`;

    console.log(`Writing schedule to cell: ${cellRange}`);

    // Write the schedule to the cell
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: cellRange,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[schedule]],
      },
    });

    console.log('Schedule updated successfully.');
  } catch (error) {
    logError('Failed to update the schedule', error);
    throw new Error('Failed to update the schedule');
  }
}

// Function to update the label in a specific row
async function updateLeadLabel(rowNumber, label) {
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(__dirname, '../config/credentials.json'),
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive',
      ],
    });

    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    const spreadsheetId = process.env.SPREADSHEET_ID;
    const sheetName = 'Sheet1';

    // Adjust rowIndex to skip the header row
    const rowIndex = rowNumber + 2; // Rows are 1-based, and we skip the header

    // Label is now in index 124 (zero-based), which is column 125 ('DV')
    const labelColumnIndex = 124;

    const columnLetter = columnToLetter(labelColumnIndex);
    const cellRange = `${sheetName}!${columnLetter}${rowIndex}`;

    console.log(`Writing label to cell: ${cellRange}`);

    // Write the label to the cell
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: cellRange,
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [[label]],
      },
    });

    console.log('Label updated successfully.');
  } catch (error) {
    logError('Failed to update the label', error);
    throw new Error('Failed to update the label');
  }
}

// Function to fetch leads and organize them by Year, Month, and Day
async function fetchLeadsByDateHierarchy() {
  console.log('Starting to fetch leads by date hierarchy');
  try {
    const auth = new google.auth.GoogleAuth({
      keyFile: path.join(__dirname, '../config/credentials.json'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const client = await auth.getClient();
    const sheets = google.sheets({ version: 'v4', auth: client });

    const spreadsheetId = process.env.SPREADSHEET_ID;
    console.log(`Fetching data from spreadsheet ID: ${spreadsheetId}`);

    // Fetch leads data from Sheet1
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1',
    });

    console.log('Data fetched successfully from Google Sheets');

    const data = response.data.values || [];
    const rows = data.slice(1); // Skip header row

    const dateHierarchy = {};

    rows.forEach((row, index) => {
      console.log(`Processing row ${index + 1} for date hierarchy`);
      const dateStr = row[125]; // Timestamp data in column 125 ('DW')
      if (dateStr) {
        const date = new Date(dateStr);
        const year = date.getFullYear();
        const month = date.toLocaleString('default', { month: 'long' });
        const day = date.getDate();

        if (!dateHierarchy[year]) {
          dateHierarchy[year] = {};
        }
        if (!dateHierarchy[year][month]) {
          dateHierarchy[year][month] = {};
        }
        if (!dateHierarchy[year][month][day]) {
          dateHierarchy[year][month][day] = 0;
        }

        dateHierarchy[year][month][day]++;
      }
    });

    console.log('Date hierarchy processing complete');
    return dateHierarchy;
  } catch (error) {
    logError('Failed to fetch leads by date hierarchy', error);
    throw new Error('Failed to fetch leads by date hierarchy');
  }
}


module.exports = {
  fetchLeadData,
  fetchLeadsByDateHierarchy,
  updateLeadComment,
  updateLeadSchedule,
  updateLeadLabel,
};
