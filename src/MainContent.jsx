import React from 'react';
import GreetingHeader from './GreetingHeader';
import AiPromptBox from './AiPromptBox';
import AutomationsList from './AutomationsList';
import InboxWidget from './InboxWidget';
import './MainContent.css';

const MainContent = ({ activeView }) => {
  const renderContent = () => {
    switch (activeView) {
      case 'hogar':
        return (
          <>
            <GreetingHeader />
            <AiPromptBox />
            <AutomationsList />
            <InboxWidget />
          </>
        );
      case 'bandeja':
        return (
          <div className="placeholder-view">
            <h2>Bandeja de entrada</h2>
            <p>Aquí verás todos tus correos y mensajes.</p>
          </div>
        );
      case 'gente':
        return (
          <div className="placeholder-view">
            <h2>Gente</h2>
            <p>Directorio de contactos y clientes.</p>
          </div>
        );
      case 'empresas':
        return (
          <div className="placeholder-view">
            <h2>Empresas</h2>
            <p>Listado de compañías asociadas.</p>
          </div>
        );
      case 'tareas':
        return (
          <div className="placeholder-view">
            <h2>Tareas</h2>
            <p>Lista de cosas por hacer.</p>
          </div>
        );
      case 'documentos':
        return (
          <div className="placeholder-view">
            <h2>Documentos</h2>
            <p>Archivos y reportes compartidos.</p>
          </div>
        );
      case 'automatizaciones':
        return (
          <div className="placeholder-view">
            <h2>Automatizaciones</h2>
            <p>Configura tus flujos de trabajo aquí.</p>
          </div>
        );
      default:
        return (
          <div className="placeholder-view">
            <h2>{activeView}</h2>
            <p>Esta sección está en construcción.</p>
          </div>
        );
    }
  };

  return (
    <div className="main-content">
      <div className="content-wrapper">
        {renderContent()}
      </div>
    </div>
  );
};

export default MainContent;
