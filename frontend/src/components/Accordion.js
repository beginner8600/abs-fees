// src/components/Accordion.js
import React, { useState } from 'react';

const Accordion = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleAccordion = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div style={styles.accordionContainer}>
      <div onClick={toggleAccordion} style={styles.accordionHeader}>
        <h3>{title}</h3>
        <span>{isOpen ? '-' : '+'}</span>
      </div>
      {isOpen && <div style={styles.accordionContent}>{children}</div>}
    </div>
  );
};

const styles = {
  accordionContainer: {
    margin: '10px 0',
    border: '1px solid #ddd',
    borderRadius: '5px',
    width: '100%',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
  },
  accordionHeader: {
    backgroundColor: '#f7f7f7',
    padding: '10px',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  accordionContent: {
    padding: '20px',
    borderTop: '1px solid #ddd',
    backgroundColor: '#fff',
  },
};

export default Accordion;
