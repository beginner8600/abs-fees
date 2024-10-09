// frontend/App.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Routes, Route } from 'react-router-dom';
import LeadList from './components/LeadList';
import LeadDetail from './components/LeadDetail';

function App() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get('http://localhost:3000/api/lead-cards')
      .then((response) => {
        if (response.data && response.data.leads && response.data.leads.length > 0) {
          setLeads(response.data.leads);
          setLoading(false);
        } else {
          throw new Error('No lead data found');
        }
      })
      .catch((error) => {
        console.error('Error fetching lead data:', error);
        setError('Error fetching lead data');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<LeadList leads={leads} />} />
        <Route path="/lead/:id" element={<LeadDetail leads={leads} />} />
      </Routes>
    </div>
  );
}

export default App;
