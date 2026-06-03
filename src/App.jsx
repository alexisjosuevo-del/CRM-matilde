import React, { useState } from 'react';
import Sidebar from './Sidebar';
import MainContent from './MainContent';
import SplashScreen from './SplashScreen';
import './App.css';

function App() {
  const [activeView, setActiveView] = useState('hogar');
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      
      {!showSplash && (
        <div className="app-container" style={{ animation: 'fadeIn 0.5s ease' }}>
          <Sidebar activeView={activeView} setActiveView={setActiveView} />
          <MainContent activeView={activeView} />
        </div>
      )}
    </>
  );
}

export default App;
