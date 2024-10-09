// frontend/components/AddComment.js
import React, { useState } from 'react';
import axios from 'axios';

const AddComment = () => {
  const [row, setRow] = useState('');
  const [column, setColumn] = useState('');
  const [comment, setComment] = useState('');

  const handleAddComment = () => {
    axios.post('http://localhost:3000/api/lead-cards/comment', {
      row,
      column,
      comment,
    })
    .then(response => {
      alert('Comment added successfully!');
    })
    .catch(error => {
      console.error('Error adding comment:', error);
    });
  };

  return (
    <div>
      <h2>Add Comment</h2>
      <input 
        type="text" 
        placeholder="Row Number" 
        value={row} 
        onChange={e => setRow(e.target.value)} 
      />
      <input 
        type="text" 
        placeholder="Column (e.g., E)" 
        value={column} 
        onChange={e => setColumn(e.target.value)} 
      />
      <input 
        type="text" 
        placeholder="Comment" 
        value={comment} 
        onChange={e => setComment(e.target.value)} 
      />
      <button onClick={handleAddComment}>Submit</button>
    </div>
  );
};

export default AddComment;
