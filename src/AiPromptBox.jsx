import React from 'react';
import { Mic, Plus, Box } from 'lucide-react';
import './AiPromptBox.css';

const AiPromptBox = () => {
  return (
    <div className="glass-panel ai-prompt-box">
      <input 
        type="text" 
        placeholder="Pregúntale lo que quieras a Micro AI..." 
        className="ai-input"
      />
      <div className="ai-actions">
        <div className="ai-left-actions">
          <button className="icon-btn">
            <Plus size={16} />
          </button>
          <button className="tag-btn">
            <Box size={14} className="icon-blue" />
            <span>Habilidades</span>
          </button>
        </div>
        <button className="icon-btn">
          <Mic size={16} />
        </button>
      </div>
    </div>
  );
};

export default AiPromptBox;
