import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';
import './AutomationsList.css';

const AutomationsList = () => {
  const automations = [
    {
      id: 1,
      title: 'Enriquecer nuevo líder — Alex Rivera',
      time: '9:12 AM',
      status: 'pending' // orange
    },
    {
      id: 2,
      title: 'Enviar secuencia de incorporación',
      time: '8:45 AM',
      status: 'success' // green
    },
    {
      id: 3,
      title: 'Sincroniza tu CRM con Slack.',
      time: '8:30 AM',
      status: 'success'
    }
  ];

  return (
    <div className="glass-panel automations-list">
      <div className="section-title">Automatizaciones</div>
      <div className="automations-items">
        {automations.map(auto => (
          <div key={auto.id} className="automation-item">
            {auto.status === 'pending' ? (
              <Clock size={16} className="icon-orange" />
            ) : (
              <CheckCircle2 size={16} className="icon-green" />
            )}
            <span className="auto-title">{auto.title}</span>
            <span className="auto-time">{auto.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AutomationsList;
