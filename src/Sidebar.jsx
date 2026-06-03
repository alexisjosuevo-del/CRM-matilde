import React from 'react';
import { 
  Search, 
  Edit, 
  Home, 
  Inbox, 
  Users, 
  Building2, 
  CheckSquare, 
  FileText, 
  Zap, 
  ChevronDown, 
  Plus,
  MessageSquare,
  BarChart2,
  Mail,
  ChevronRight
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ activeView, setActiveView }) => {
  const mainNav = [
    { id: 'hogar', icon: Home, label: 'Hogar' },
    { id: 'bandeja', icon: Inbox, label: 'Bandeja de entrada' },
    { id: 'gente', icon: Users, label: 'Gente' },
    { id: 'empresas', icon: Building2, label: 'Empresas' },
    { id: 'tareas', icon: CheckSquare, label: 'Tareas' },
    { id: 'documentos', icon: FileText, label: 'Documentos' },
    { id: 'automatizaciones', icon: Zap, label: 'Automatizaciones' }
  ];

  return (
    <div className="sidebar">
      {/* Profile / Company Header */}
      <div className="sidebar-header">
        <div className="company-info">
          <img src="/logo.jpeg" alt="Logo Matilde" className="company-logo-img" />
          <span className="company-name">Matilde</span>
          <ChevronDown size={14} className="icon-muted" />
        </div>
      </div>

      {/* Search and New */}
      <div className="sidebar-actions">
        <div className="search-bar">
          <Search size={16} className="icon-muted" />
          <span>Buscar</span>
        </div>
        <button className="new-btn">
          <Edit size={16} className="icon-muted" />
        </button>
      </div>

      {/* Main Navigation */}
      <div className="nav-group">
        {mainNav.map((item) => (
          <div 
            key={item.id} 
            className={`nav-item ${activeView === item.id ? 'active' : ''}`}
            onClick={() => setActiveView(item.id)}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Lists Section */}
      <div className="nav-section">
        <div className="section-header">
          <span>Liza</span>
          <div className="section-actions">
            <Plus size={14} className="icon-muted" />
            <ChevronDown size={14} className="icon-muted" />
          </div>
        </div>
        <div 
          className={`nav-item ${activeView === 'ventas' ? 'active' : ''}`}
          onClick={() => setActiveView('ventas')}
        >
          <BarChart2 size={18} className="icon-blue" />
          <span>Ventas</span>
        </div>
        <div 
          className={`nav-item ${activeView === 'boletos' ? 'active' : ''}`}
          onClick={() => setActiveView('boletos')}
        >
          <FileText size={18} className="icon-yellow" />
          <span>Boletos de inglés</span>
        </div>
        <div 
          className={`nav-item ${activeView === 'proceso' ? 'active' : ''}`}
          onClick={() => setActiveView('proceso')}
        >
          <Users size={18} className="icon-purple" />
          <span>Proceso de contratación</span>
        </div>
      </div>

      {/* Chats Section */}
      <div className="nav-section">
        <div className="section-header">
          <span>Chats</span>
          <div className="section-actions">
            <Plus size={14} className="icon-muted" />
            <ChevronDown size={14} className="icon-muted" />
          </div>
        </div>
        <div 
          className={`nav-item ${activeView === 'chat_ia' ? 'active' : ''}`}
          onClick={() => setActiveView('chat_ia')}
        >
          <MessageSquare size={18} className="icon-muted" />
          <span>Chat con IA</span>
          <div className="unread-dot"></div>
        </div>
        <div 
          className={`nav-item ${activeView === 'resumir' ? 'active' : ''}`}
          onClick={() => setActiveView('resumir')}
        >
          <MessageSquare size={18} className="icon-muted" />
          <span>Resumir la presentación</span>
        </div>
        <div 
          className={`nav-item ${activeView === 'borrador' ? 'active' : ''}`}
          onClick={() => setActiveView('borrador')}
        >
          <Mail size={18} className="icon-muted" />
          <span>Borrador de correo electr...</span>
        </div>
      </div>
      
      {/* Help icon at bottom */}
      <div className="sidebar-footer">
        <div className="help-icon">?</div>
      </div>
    </div>
  );
};

export default Sidebar;
