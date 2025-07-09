import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="loading-container">
      <div className="loading-spinner">
        <div className="spinner"></div>
      </div>
      <div className="loading-text">
        <p>🔍 Analyzing your problem...</p>
        <p>🛒 Finding the best products...</p>
        <p>Please wait a moment...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner; 