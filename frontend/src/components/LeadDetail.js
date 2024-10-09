// frontend/components/LeadDetail.js

import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const LeadDetail = ({ leads }) => {
  const { id } = useParams(); // Get the lead id from the URL
  const leadIndex = parseInt(id, 10); // Convert id to integer
  const lead = leads[leadIndex]; // Find the lead in the list using the id

  const [newComment, setNewComment] = useState(''); // State to handle the new comment input
  const [successMessage, setSuccessMessage] = useState(''); // Success message
  const [errorMessage, setErrorMessage] = useState(''); // Error message
  const [schedule, setSchedule] = useState(lead.schedule || ''); // State for the schedule input
  const [scheduleMessage, setScheduleMessage] = useState(''); // Message for schedule update

  // States to control the accordion for each section
  const [personalInfoOpen, setPersonalInfoOpen] = useState(false);
  const [familyInfoOpen, setFamilyInfoOpen] = useState(false);
  const [contactInfoOpen, setContactInfoOpen] = useState(false);
  const [educationInfoOpen, setEducationInfoOpen] = useState(false);
  const [referencesOpen, setReferencesOpen] = useState(false);
  const [financialInfoOpen, setFinancialInfoOpen] = useState(false);
  const [documentsOpen, setDocumentsOpen] = useState(false);
  const [expensesOpen, setExpensesOpen] = useState(false);
  // Added paymentScheduleOpen state
  const [paymentScheduleOpen, setPaymentScheduleOpen] = useState(false);

  if (!lead) {
    return <div>No lead found</div>; // Handle case where lead is not found
  }

  // Handle form submission for the comment
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:3000/api/lead/${leadIndex}/comment`, {
        comment: newComment,
      });
      setSuccessMessage('Comment updated successfully!');
      setErrorMessage('');
      setNewComment(''); // Clear the input field

      // Update the comments array locally
      const now = new Date();
      const formattedDateTime = now.toLocaleString();
      const commentWithDateTime = `${formattedDateTime}: ${newComment}`;
      lead.comments.push(commentWithDateTime);
    } catch (error) {
      setErrorMessage(error.response?.data?.error || 'Failed to update comment');
      setSuccessMessage('');
      console.error('Error updating comment:', error);
    }
  };

  // Handle form submission for the schedule
  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`http://localhost:3000/api/lead/${leadIndex}/schedule`, {
        schedule: schedule,
      });
      setScheduleMessage('Schedule updated successfully!');
    } catch (error) {
      setScheduleMessage('Failed to update schedule');
      console.error('Error updating schedule:', error);
    }
  };

  // Accordion component for sections
  const AccordionSection = ({ title, isOpen, onToggle, children }) => (
    <div>
      <h3
        onClick={onToggle}
        style={{
          cursor: 'pointer',
          backgroundColor: '#f1f1f1',
          padding: '10px',
          margin: '10px 0',
        }}
      >
        {title} {isOpen ? '▼' : '▶'}
      </h3>
      {isOpen && (
        <div style={{ padding: '10px', backgroundColor: '#f9f9f9' }}>
          {children}
        </div>
      )}
    </div>
  );

  return (
    <div>
      <h2>{lead.data[4]}</h2> {/* Name */}

      {/* Schedule display */}
      <div>
        <h3>Current Schedule:</h3>
        {schedule ? <p>{schedule}</p> : <p>No schedule set yet.</p>}
      </div>

      {/* Form to update the schedule */}
      <form onSubmit={handleScheduleSubmit}>
        <label>
          Set a Call Reminder:
          <input
            type="datetime-local"
            value={schedule}
            onChange={(e) => setSchedule(e.target.value)} // Update the schedule state
          />
        </label>
        <button type="submit">Set Schedule</button>
      </form>

      {/* Display schedule update message */}
      {scheduleMessage && <p>{scheduleMessage}</p>}

      {/* Personal Info Section */}
      <AccordionSection
        title="Personal Info"
        isOpen={personalInfoOpen}
        onToggle={() => setPersonalInfoOpen(!personalInfoOpen)}
      >
        <p>Admission Date: {lead.data[0]}</p>
        <p>Std Code: {lead.data[1]}</p>
        <p>ABS ID: {lead.data[2]}</p>
        <p>Month: {lead.data[3]}</p>
        <p>Name: {lead.data[4]}</p>
        <p>Gender: {lead.data[5]}</p>
        <p>Date of Birth: {lead.data[6]}</p>
      </AccordionSection>

      {/* Family Info Section */}
      <AccordionSection
        title="Family Info"
        isOpen={familyInfoOpen}
        onToggle={() => setFamilyInfoOpen(!familyInfoOpen)}
      >
        <p>Father's Name: {lead.data[7]}</p>
        <p>Father's Contact: {lead.data[8]}</p>
        <p>Mother's Name: {lead.data[9]}</p>
        <p>Mother's Contact: {lead.data[10]}</p>
      </AccordionSection>

      {/* Student Contact Section */}
      <AccordionSection
        title="Student Contact"
        isOpen={contactInfoOpen}
        onToggle={() => setContactInfoOpen(!contactInfoOpen)}
      >
        <p>Student Contact: {lead.data[11]}</p>
        <p>Email ID: {lead.data[12]}</p>
        <p>Aadhar Number: {lead.data[13]}</p>
        <p>Address: {lead.data[14]}</p>
        <p>Address Area: {lead.data[15]}</p>
        <p>Pincode: {lead.data[16]}</p>
      </AccordionSection>

      {/* Education Section */}
      <AccordionSection
        title="Education"
        isOpen={educationInfoOpen}
        onToggle={() => setEducationInfoOpen(!educationInfoOpen)}
      >
        <p>10th Board: {lead.data[17]}</p>
        <p>10th Reg No: {lead.data[18]}</p>
        <p>10th %: {lead.data[19]}</p>
        <p>10th Year: {lead.data[20]}</p>
        <p>12th College Name: {lead.data[21]}</p>
        <p>12th Reg No: {lead.data[22]}</p>
        <p>12th Year: {lead.data[23]}</p>
        <p>12th Board: {lead.data[24]}</p>
        <p>12th Subjects: {lead.data[25]}</p>
        <p>12th %: {lead.data[26]}</p>
      </AccordionSection>

      {/* References Section */}
      <AccordionSection
        title="References"
        isOpen={referencesOpen}
        onToggle={() => setReferencesOpen(!referencesOpen)}
      >
        <p>Reference: {lead.data[27]}</p>
        <p>Branch: {lead.data[28]}</p>
        <p>Lecture Branch: {lead.data[29]}</p>
        <p>Telecaller Name: {lead.data[30]}</p>
        <p>Course: {lead.data[31]}</p>
        <p>College: {lead.data[32]}</p>
        <p>Provisional Letter: {lead.data[33]}</p>
        <p>Confirmation Letter: {lead.data[34]}</p>
      </AccordionSection>

      {/* Financial Info Section */}
      <AccordionSection
        title="Financial Info"
        isOpen={financialInfoOpen}
        onToggle={() => setFinancialInfoOpen(!financialInfoOpen)}
      >
        <p>Total Fees: {lead.data[35]}</p>
        <p>Pay Mode: {lead.data[36]}</p>
        <p>1st Installment Amount: {lead.data[37]}</p>
        <p>1st Installment Due: {lead.data[38]}</p>
        <p>2nd Installment Amount: {lead.data[39]}</p>
        <p>2nd Installment Due: {lead.data[40]}</p>
        <p>3rd Installment Amount: {lead.data[41]}</p>
        <p>3rd Installment Due: {lead.data[42]}</p>
        <p>Total Fee Received: {lead.data[47]}</p>
        <p>Pending Fee: {lead.data[48]}</p>
      </AccordionSection>

      {/* Documents Section */}
      <AccordionSection
        title="Documents"
        isOpen={documentsOpen}
        onToggle={() => setDocumentsOpen(!documentsOpen)}
      >
        <p>10th: {lead.data[49]}</p>
        <p>12th: {lead.data[50]}</p>
        <p>LC/TC: {lead.data[51]}</p>
        <p>Aadhar: {lead.data[52]}</p>
        <p>Photo: {lead.data[53]}</p>
        <p>Migration: {lead.data[54]}</p>
      </AccordionSection>

      {/* Other Expenses Section */}
      <AccordionSection
        title="Other Expenses"
        isOpen={expensesOpen}
        onToggle={() => setExpensesOpen(!expensesOpen)}
      >
        <p>Form Fee: {lead.data[55]}</p>
        <p>Book & App: {lead.data[56]}</p>
        <p>Exam Fee: {lead.data[57]}</p>
        <p>Apron: {lead.data[58]}</p>
        <p>Practical Book: {lead.data[59]}</p>
        <p>Travel: {lead.data[60]}</p>
        <p>Chem. Charges: {lead.data[61]}</p>
        <p>Sessional: {lead.data[62]}</p>
        <p>Assignment: {lead.data[63]}</p>
      </AccordionSection>

      {/* Payment Schedule Section (if needed) */}
      {/* Uncomment and populate if you have data for payment schedule */}
      {/* <AccordionSection
        title="Payment Schedule"
        isOpen={paymentScheduleOpen}
        onToggle={() => setPaymentScheduleOpen(!paymentScheduleOpen)}
      >
        // Add payment schedule details here
      </AccordionSection> */}

      {/* Display Comments */}
      <h3>Comments:</h3>
      {lead.comments && lead.comments.length > 0 ? (
        <ul>
          {lead.comments.map((comment, idx) => (
            <li key={idx}>{comment}</li>
          ))}
        </ul>
      ) : (
        <p>No comments yet.</p>
      )}

      {/* Form to add a new comment */}
      <form onSubmit={handleCommentSubmit}>
        <label>
          Add a New Comment:
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)} // Update the comment state
            placeholder="Enter your comment"
          />
        </label>
        <button type="submit">Submit Comment</button>
      </form>

      {/* Display success or error messages */}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

      {/* Link to go back to the lead list */}
      <Link to="/">Back to Lead List</Link>
    </div>
  );
};

export default LeadDetail;
