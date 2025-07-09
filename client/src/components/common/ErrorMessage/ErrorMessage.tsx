import React from 'react';
import type { ErrorMessageProps } from '../../../types';
import './ErrorMessage.css';

const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  details,
  onRetry
}) => {
  return (
    <div className="error-message">
      <div className="error-icon">❌</div>
      <div className="error-content">
        <h3 className="error-title">Something went wrong</h3>
        <p className="error-message-text">{message}</p>
        {details && (
          <p className="error-details">{details}</p>
        )}
        {onRetry && (
          <button className="error-retry-button" onClick={onRetry}>
            Try Again
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage; 