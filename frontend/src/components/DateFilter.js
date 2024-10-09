import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DateFilter = ({ onFilterSelect }) => {
  const [hierarchy, setHierarchy] = useState({});
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [labels, setLabels] = useState([]);
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedDay, setSelectedDay] = useState('');

  useEffect(() => {
    // Fetch the date hierarchy and leads data from the backend
    axios.get('http://localhost:3000/api/lead-hierarchy')
      .then(response => {
        setHierarchy(response.data.dateHierarchy);
      })
      .catch(error => {
        console.error('Error fetching date hierarchy:', error);
      });

    axios.get('http://localhost:3000/api/lead-cards')
      .then(response => {
        setLeads(response.data.leads);
        setLabels(response.data.labels);
        setFilteredLeads(response.data.leads); // Set initial filtered leads
        onFilterSelect(response.data.leads, response.data.labels); // Pass the initial data to parent
      })
      .catch(error => {
        console.error('Error fetching leads:', error);
      });
  }, []);

  const filterLeads = (year, month, day) => {
    const filtered = leads.filter((lead) => {
      const dateStr = lead.schedule;
      if (!dateStr) return false;

      const [yearPart, monthPart, dayPart] = dateStr.split(' ')[0].split('-');

      const yearMatch = year ? parseInt(yearPart) === parseInt(year) : true;
      const monthMatch = month ? monthPart === month : true;
      const dayMatch = day ? parseInt(dayPart) === parseInt(day) : true;

      return yearMatch && monthMatch && dayMatch;
    });

    setFilteredLeads(filtered);
    onFilterSelect(filtered, labels); // Pass filtered data to the parent component
  };

  const handleYearChange = (e) => {
    const year = e.target.value;
    setSelectedYear(year);
    setSelectedMonth('');
    setSelectedDay('');
    filterLeads(year, '', ''); // Trigger filtering after selecting year
  };

  const handleMonthChange = (e) => {
    const month = e.target.value;
    setSelectedMonth(month);
    setSelectedDay('');
    filterLeads(selectedYear, month, ''); // Trigger filtering after selecting month
  };

  const handleDayChange = (e) => {
    const day = e.target.value;
    setSelectedDay(day);
    filterLeads(selectedYear, selectedMonth, day); // Trigger filtering after selecting day
  };

  return (
    <div>
      <label>Year: </label>
      <select value={selectedYear} onChange={handleYearChange}>
        <option value="">Select Year</option>
        {Object.keys(hierarchy).map((year) => (
          <option key={year} value={year}>
            {year} ({Object.keys(hierarchy[year]).reduce((sum, month) => sum + Object.keys(hierarchy[year][month]).length, 0)} leads)
          </option>
        ))}
      </select>

      {selectedYear && (
        <>
          <label>Month: </label>
          <select value={selectedMonth} onChange={handleMonthChange}>
            <option value="">Select Month</option>
            {Object.keys(hierarchy[selectedYear]).map((month, index) => (
              <option key={index} value={month}>
                {month} ({Object.keys(hierarchy[selectedYear][month]).reduce((sum, day) => sum + hierarchy[selectedYear][month][day], 0)} leads)
              </option>
            ))}
          </select>
        </>
      )}

      {selectedMonth && (
        <>
          <label>Day: </label>
          <select value={selectedDay} onChange={handleDayChange}>
            <option value="">Select Day</option>
            {Object.keys(hierarchy[selectedYear][selectedMonth]).map((day, index) => (
              <option key={index} value={day}>
                {day} ({hierarchy[selectedYear][selectedMonth][day]} leads)
              </option>
            ))}
          </select>
        </>
      )}
    </div>
  );
};

export default DateFilter;
