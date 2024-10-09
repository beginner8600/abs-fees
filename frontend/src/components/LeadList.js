// LeadList.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LeadCard from './LeadCard';
import { useNavigate } from 'react-router-dom';
import './LeadList.css'; // Import the CSS file

const LeadList = () => {
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [labels, setLabels] = useState([]);
  const [hierarchy, setHierarchy] = useState({});
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedLabelFilter, setSelectedLabelFilter] = useState('');
  const [uniqueLabels, setUniqueLabels] = useState([]);
  const [todayLeadCount, setTodayLeadCount] = useState(0);
  const [pendingFeeFilterAmount, setPendingFeeFilterAmount] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch leads from API
    axios
      .get('http://localhost:3000/api/lead-cards')
      .then((response) => {
        const { leads, labels } = response.data;
        setLeads(leads);
        setLabels(labels);
        setFilteredLeads(leads);

        // Extract unique labels from leads
        const labelsFromLeads = Array.from(
          new Set(
            leads
              .map((lead) => lead.label)
              .filter(
                (label) => label !== null && label !== undefined && label !== ''
              )
          )
        );

        setUniqueLabels(labelsFromLeads);

        buildHierarchy(leads);
        updateTodayLeadCount(leads);
      })
      .catch((error) => {
        console.error('Error fetching leads and labels:', error);
      });
  }, []);

  const buildHierarchy = (leads) => {
    const hierarchy = {};
    leads.forEach((lead) => {
      const dateStr = lead.schedule;
      if (!dateStr) return;

      const [year, month, day] = dateStr.split(' ')[0].split('-');
      if (!hierarchy[year]) hierarchy[year] = {};
      if (!hierarchy[year][month]) hierarchy[year][month] = {};
      if (!hierarchy[year][month][day]) hierarchy[year][month][day] = 0;

      hierarchy[year][month][day] += 1;
    });

    setHierarchy(hierarchy);
  };

  const filterLeads = (year, month, day, label, amount) => {
    const filtered = leads.filter((lead) => {
      const dateStr = lead.schedule;
      if (!dateStr) return false;

      const [leadYear, leadMonth, leadDay] = dateStr.split(' ')[0].split('-');

      const yearMatch = year ? year === leadYear : true;
      const monthMatch = month ? month === leadMonth : true;
      const dayMatch = day ? day === leadDay : true;
      const labelMatch = label ? lead.label === label : true;

      // Pending fees filter
      let pendingFeeMatch = true;
      if (amount) {
        let pendingFeeStr = lead.data[47];
        if (typeof pendingFeeStr === 'string') {
          // Remove commas from the string
          pendingFeeStr = pendingFeeStr.replace(/,/g, '');
        }

        const pendingFee = parseFloat(pendingFeeStr);
        if (isNaN(pendingFee)) {
          pendingFeeMatch = false;
        } else {
          pendingFeeMatch = pendingFee > parseFloat(amount);
        }
      }

      return yearMatch && monthMatch && dayMatch && labelMatch && pendingFeeMatch;
    });

    setFilteredLeads(filtered);
  };

  const updateTodayLeadCount = (leads) => {
    const today = new Date();
    const year = today.getFullYear().toString();
    const month = (`0${today.getMonth() + 1}`).slice(-2);
    const day = (`0${today.getDate()}`).slice(-2);

    const count = leads.filter((lead) => {
      const dateStr = lead.schedule;
      if (!dateStr) return false;

      const [leadYear, leadMonth, leadDay] = dateStr.split(' ')[0].split('-');
      return year === leadYear && month === leadMonth && day === leadDay;
    }).length;

    setTodayLeadCount(count);
  };

  // Use useEffect to filter leads whenever the selected filters change
  useEffect(() => {
    filterLeads(
      selectedYear,
      selectedMonth,
      selectedDay,
      selectedLabelFilter,
      pendingFeeFilterAmount
    );
  }, [
    selectedYear,
    selectedMonth,
    selectedDay,
    selectedLabelFilter,
    pendingFeeFilterAmount,
    leads,
  ]);

  const handleYearChange = (e) => {
    const year = e.target.value;
    setSelectedYear(year);
    setSelectedMonth('');
    setSelectedDay('');
  };

  const handleMonthChange = (e) => {
    const month = e.target.value;
    setSelectedMonth(month);
    setSelectedDay('');
  };

  const handleDayChange = (e) => {
    const day = e.target.value;
    setSelectedDay(day);
  };

  const handleTodaySchedule = () => {
    const today = new Date();
    const year = today.getFullYear().toString();
    const month = (`0${today.getMonth() + 1}`).slice(-2);
    const day = (`0${today.getDate()}`).slice(-2);

    setSelectedYear(year);
    setSelectedMonth(month);
    setSelectedDay(day);
  };

  const handleLabelFilterChange = (e) => {
    const selectedLabel = e.target.value;
    setSelectedLabelFilter(selectedLabel);
  };

  const handlePendingFeeFilterChange = (e) => {
    setPendingFeeFilterAmount(e.target.value);
  };

  const handleViewAllLeads = () => {
    setSelectedYear('');
    setSelectedMonth('');
    setSelectedDay('');
    setSelectedLabelFilter('');
    setPendingFeeFilterAmount('');
  };

  return (
    <div className="lead-list">
      <div className="filter-container">
        <div className="filter-group">
          <label className="filter-label">Label:</label>
          <select
            className="filter-select"
            value={selectedLabelFilter}
            onChange={handleLabelFilterChange}
          >
            <option value="">All Labels</option>
            {uniqueLabels.length > 0 ? (
              uniqueLabels.map((label, index) => (
                <option key={index} value={label}>
                  {label}
                </option>
              ))
            ) : (
              <option value="" disabled>
                No labels available
              </option>
            )}
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-label">Pending Fees &gt; </label>
          <input
            type="number"
            className="filter-input"
            value={pendingFeeFilterAmount}
            onChange={handlePendingFeeFilterChange}
            placeholder="Enter amount"
          />
        </div>

        <div className="filter-group">
          <label className="filter-label">Year:</label>
          <select
            className="filter-select"
            value={selectedYear}
            onChange={handleYearChange}
          >
            <option value="">Select Year</option>
            {Object.keys(hierarchy).map((year) => (
              <option key={year} value={year}>
                {year} (
                {Object.keys(hierarchy[year]).reduce(
                  (sum, month) => sum + Object.keys(hierarchy[year][month]).length,
                  0
                )}{' '}
                leads)
              </option>
            ))}
          </select>
        </div>

        {selectedYear && (
          <div className="filter-group">
            <label className="filter-label">Month:</label>
            <select
              className="filter-select"
              value={selectedMonth}
              onChange={handleMonthChange}
            >
              <option value="">Select Month</option>
              {Object.keys(hierarchy[selectedYear] || {}).map((month) => (
                <option key={month} value={month}>
                  {month} ({Object.keys(hierarchy[selectedYear][month]).length}{' '}
                  leads)
                </option>
              ))}
            </select>
          </div>
        )}

        {selectedMonth && (
          <div className="filter-group">
            <label className="filter-label">Day:</label>
            <select
              className="filter-select"
              value={selectedDay}
              onChange={handleDayChange}
            >
              <option value="">Select Day</option>
              {Object.keys(hierarchy[selectedYear][selectedMonth] || {}).map(
                (day) => (
                  <option key={day} value={day}>
                    {day} ({hierarchy[selectedYear][selectedMonth][day]} leads)
                  </option>
                )
              )}
            </select>
          </div>
        )}

        <div className="button-group">
          <button className="filter-button" onClick={handleTodaySchedule}>
            Today's Scheduled Leads ({todayLeadCount} leads)
          </button>
          <button className="filter-button" onClick={handleViewAllLeads}>
            View All Leads
          </button>
        </div>
      </div>

      <div className="leads-container">
        {filteredLeads.length > 0 ? (
          filteredLeads.map((lead) => (
            <LeadCard
              key={lead.id}
              lead={lead}
              labels={labels}
              onViewMore={() => navigate(`/lead/${lead.id}`)}
            />
          ))
        ) : (
          <p className="no-leads-message">No leads available</p>
        )}
      </div>
    </div>
  );
};

export default LeadList;
