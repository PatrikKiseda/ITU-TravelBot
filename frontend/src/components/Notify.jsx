import React from 'react';
import './Notify.css';

function Notify({ message, type }) {
  if (!message) return null;

  return (
    <div className={`notify ${type}`}>
      {message}
    </div>
  );
}

export default Notify;
