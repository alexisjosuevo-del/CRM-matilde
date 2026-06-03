import React from 'react';
import './GreetingHeader.css';

const GreetingHeader = () => {
  return (
    <div className="greeting-header">
      <div className="weather-icon">
        <div className="sun"></div>
        <div className="cloud"></div>
      </div>
      <div className="greeting-text">
        <h1>Buenos días, Sarah.</h1>
        <p>Jueves, 20 de febrero · San Francisco, California · 58°F</p>
      </div>
    </div>
  );
};

export default GreetingHeader;
