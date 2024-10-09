// LeadCard.js

import React, { useState } from 'react';
import axios from 'axios';
import { FaPhoneAlt, FaWhatsapp } from 'react-icons/fa';
import './LeadCard.css'; // Import the CSS file

const LeadCard = ({ lead, labels, onViewMore }) => {
  // Initialize state with lead label or an empty string
  const [selectedLabel, setSelectedLabel] = useState(lead?.label || '');

  // Safely access lead data and comments
  const leadData = lead?.data || [];
  const leadComments = lead?.comments || [];

  if (!lead || !lead.data) {
    console.error('Lead data is missing or invalid');
    return <div>Invalid lead data</div>;
  }

  // Handle label selection
  const handleLabelChange = (event) => {
    const selectedValue = event.target.value;
    setSelectedLabel(selectedValue);

    // Update the label in the backend
    axios
      .post(`http://localhost:3000/api/lead/${lead.id}/label`, {
        label: selectedValue,
      })
      .then(() => {
        console.log('Label updated successfully');
      })
      .catch((error) => {
        console.error('Error updating label:', error);
      });
  };

  // Handle Call button click
  const handleCallClick = () => {
    const phoneNumber = leadData[11];
    if (phoneNumber) {
      window.open(`tel:${phoneNumber}`);
    } else {
      alert('Phone number is not available');
    }
  };

  // Handle WhatsApp button click
  const handleWhatsAppClick = () => {
    const phoneNumber = leadData[11];
    if (phoneNumber) {
      const cleanedNumber = phoneNumber.replace(/\D/g, '');
      window.open(`https://wa.me/${cleanedNumber}`, '_blank');
    } else {
      alert('Phone number is not available');
    }
  };

  // Calculate the last installment paid amount and date
  const installmentStartIndex = 63; // 'BL' column zero-based index
  const installmentColumnsPerInstallment = 3;
  const totalInstallments = 20;

  let lastInstallmentAmount = null;
  let lastInstallmentDate = null;

  for (let i = totalInstallments; i >= 1; i--) {
    const installmentIndex =
      installmentStartIndex + (i - 1) * installmentColumnsPerInstallment;
    const date = leadData[installmentIndex];
    const amount = leadData[installmentIndex + 1];

    if (amount && amount.trim() !== '') {
      lastInstallmentAmount = amount;
      lastInstallmentDate = date;
      break;
    }
  }

  const lastComment =
    leadComments.length > 0 ? leadComments[leadComments.length - 1] : null;

  return (
    <div className="lead-card">
      <div className="lead-card-header">
        <div className="lead-card-name-section">
          <h2 className="lead-card-name">{leadData[4] || 'No Name'}</h2>
          <p className="lead-card-contact">{leadData[11] || 'No Contact'}</p>
        </div>
        <div className="lead-card-icons">
          <button
            className="lead-card-icon-button"
            onClick={handleCallClick}
            aria-label="Call"
            title="Call"
          >
            <FaPhoneAlt />
          </button>
          <button
            className="lead-card-icon-button"
            onClick={handleWhatsAppClick}
            aria-label="WhatsApp"
            title="WhatsApp"
          >
            <FaWhatsapp />
          </button>
        </div>
      </div>

      <div className="lead-card-details">
        <p>
          <strong>Batch:</strong> {leadData[28] || 'N/A'}
        </p>
        <p>
          <strong>Course:</strong> {leadData[31] || 'N/A'}
        </p>
        <p>
          <strong>Total Fees:</strong> {leadData[36] || 'N/A'} &nbsp;|&nbsp;
          <strong>Paid:</strong> {leadData[46] || 'N/A'} &nbsp;|&nbsp;
          <strong>Pending:</strong> {leadData[47] || 'N/A'}
        </p>
        <p>
          <strong>Schedule:</strong> {lead.schedule || 'No schedule set'}
        </p>
        <p>
          <strong>Last Comment:</strong> {lastComment || 'No comment'}
        </p>
        <p>
          <strong>Last Installment Paid:</strong>{' '}
          {lastInstallmentAmount
            ? `${lastInstallmentAmount} on ${lastInstallmentDate}`
            : 'No installment paid yet'}
        </p>
      </div>

      <div className="lead-card-buttons">
        {/* Render dropdown for labels */}
        <select
          className="lead-card-select-label"
          value={selectedLabel}
          onChange={handleLabelChange}
        >
          <option value="" disabled>
            Select Label
          </option>
          {Array.isArray(labels) && labels.length > 0 ? (
            labels.map((labelOption, index) => (
              <option key={index} value={labelOption}>
                {labelOption}
              </option>
            ))
          ) : (
            <option value="" disabled>
              No labels available
            </option>
          )}
        </select>
        <button className="lead-card-view-more" onClick={onViewMore}>
          View More
        </button>
      </div>
    </div>
  );
};

export default LeadCard;
