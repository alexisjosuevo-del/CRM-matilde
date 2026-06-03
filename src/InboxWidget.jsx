import React from 'react';
import './InboxWidget.css';

const InboxWidget = () => {
  const tabs = ['Importante', 'Noticias', 'VIPs', 'Todos los DM', 'Otro'];
  
  const messages = [
    {
      id: 1,
      initials: 'AR',
      bg: '#3b82f6',
      name: 'Alex Rivera',
      badge: '3',
      title: 'Análisis de la baraja Serie A',
      preview: 'Alex actualizó los estados financi...',
      time: '2 metros' // assuming "2 mins" got translated to "2 metros"
    },
    {
      id: 2,
      initials: 'MC',
      bg: '#10b981',
      name: 'Morgan Chen',
      title: 'Introducción: Sarah Kim / Lightspeed',
      preview: 'Morgan quiere prese...',
      time: '18 metros'
    },
    {
      id: 3,
      initials: 'PD',
      bg: '#8b5cf6',
      name: 'Priya Sharma, tú',
      badge: '4',
      title: 'Flujo de incorporación del cliente',
      preview: 'Priya compartió los resultados de l...',
      time: '1h'
    },
    {
      id: 4,
      initials: 'JK',
      bg: '#f59e0b',
      name: 'James Ko',
      badge: '2',
      title: 'Orden del día de la reunión de la junta',
      preview: 'James añadió el plan de ...',
      time: '2 horas'
    },
    {
      id: 5,
      initials: 'EC',
      bg: '#06b6d4',
      name: 'Elena Costa',
      title: 'Propuesta de asociación',
      preview: 'Elena propone una integración con S...',
      time: '3 h'
    },
    {
      id: 6,
      initials: 'DP',
      bg: '#ec4899',
      name: 'David Park, tú',
      badge: '5',
      title: 'Sincronización semanal de productos',
      preview: 'David confirmó que la nueva ...',
      time: '1 d'
    }
  ];

  return (
    <div className="glass-panel inbox-widget">
      <div className="section-title">Bandeja de entrada</div>
      
      <div className="inbox-tabs">
        {tabs.map((tab, idx) => (
          <div key={idx} className={`inbox-tab ${idx === 0 ? 'active' : ''}`}>
            {tab}
          </div>
        ))}
      </div>

      <div className="inbox-list">
        {messages.map(msg => (
          <div key={msg.id} className="inbox-item">
            <div className="avatar" style={{ backgroundColor: msg.bg }}>
              {msg.initials}
            </div>
            <div className="inbox-sender">
              <span className="sender-name">{msg.name}</span>
              {msg.badge && <span className="sender-badge">{msg.badge}</span>}
            </div>
            <div className="inbox-content">
              <span className="msg-title">{msg.title}</span>
              <span className="msg-preview">{msg.preview}</span>
            </div>
            <div className="inbox-time">{msg.time}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InboxWidget;
