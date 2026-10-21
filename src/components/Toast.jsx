import React from 'react';

export default function Toast({ message, visible }) {
  if (!visible && !message) return null;

  return (
    <div className={`toast-notice ${visible ? 'show' : ''}`}>
      {message}
    </div>
  );
}
