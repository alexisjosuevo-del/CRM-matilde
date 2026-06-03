import React from 'react';
import { Play, SkipBack, SkipForward } from 'lucide-react';
import './MediaPlayer.css';

const MediaPlayer = () => {
  return (
    <div className="glass-panel media-player">
      <div className="media-cover">
        <div className="cover-text">Mika & los Romanos</div>
      </div>
      <div className="media-info">
        <div className="media-title">Computadora nueva</div>
        <div className="media-artist">Mika y los romanos</div>
        <div className="media-controls-container">
          <div className="media-controls">
            <SkipBack size={14} className="control-btn" />
            <Play size={14} className="control-btn" />
            <SkipForward size={14} className="control-btn" />
          </div>
          <div className="media-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: '0%' }}></div>
            </div>
            <span className="time-text">0:00 / 2:57</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaPlayer;
