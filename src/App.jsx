import React, { useState } from 'react';
import Navbar from './components/Navbar.jsx';
import Events from './pages/Events.jsx';
import Users from './pages/Users.jsx';
import Submissions from './pages/Submissions.jsx';
import Judges from './pages/Judges.jsx';
import Community from './pages/Community.jsx';
import ApiContractsModal from './components/ApiContractsModal.jsx';
import api from './services/api.js';
import { HackathonProvider } from './context/HackathonContext.jsx';

function AppContent() {
  const [currentTab, setCurrentTab] = useState('events');
  const [isContractsOpen, setIsContractsOpen] = useState(false);
  const [apiConfig, setApiConfig] = useState({
    baseUrl: api.getBaseUrl(),
    useMock: api.isMockMode()
  });

  const handleUpdateConfig = ({ baseUrl, useMock }) => {
    if (baseUrl !== undefined) {
      api.setBaseUrl(baseUrl);
      setApiConfig((prev) => ({ ...prev, baseUrl }));
    }
    if (useMock !== undefined) {
      api.setMockMode(useMock);
      setApiConfig((prev) => ({ ...prev, useMock }));
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenApiContracts={() => setIsContractsOpen(true)}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        {currentTab === 'events' && <Events />}
        {currentTab === 'users' && <Users />}
        {currentTab === 'judges' && <Judges />}
        {currentTab === 'submissions' && <Submissions />}
        {(currentTab === 'voting' || currentTab === 'community') && <Community />}
      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '24px',
        textAlign: 'center',
        background: 'rgba(5, 7, 15, 0.95)',
        fontSize: '0.85rem',
        color: 'var(--text-dim)'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <span>DOGFOOD 2026 Developer Hackathons • Shared HackathonContext & Centralized State</span>
          </div>
          <div style={{ display: 'flex', gap: '16px' }}>
            <button
              onClick={() => setIsContractsOpen(true)}
              style={{ background: 'none', border: 'none', color: '#06b6d4', cursor: 'pointer', fontSize: '0.8rem' }}
            >
              Explore API Contracts
            </button>
            <span style={{ color: 'var(--border-subtle)' }}>|</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Base: {apiConfig.baseUrl}
            </span>
          </div>
        </div>
      </footer>

      {/* API Contracts Specification Modal */}
      <ApiContractsModal
        isOpen={isContractsOpen}
        onClose={() => setIsContractsOpen(false)}
        currentBaseUrl={apiConfig.baseUrl}
        isMockMode={apiConfig.useMock}
        onUpdateConfig={handleUpdateConfig}
      />
    </div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0c14', color: '#fff', padding: '24px' }}>
          <div className="glass-panel" style={{ padding: '36px', maxWidth: '520px', textAlign: 'center', borderColor: 'rgba(239, 68, 68, 0.4)' }}>
            <h2 style={{ color: '#f87171', marginBottom: '12px', fontSize: '1.4rem' }}>Application Error</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
              An unexpected error occurred while rendering the component.
            </p>
            <pre style={{ background: 'rgba(0,0,0,0.5)', padding: '12px', borderRadius: '8px', fontSize: '0.8rem', color: '#cbd5e1', overflowX: 'auto', marginBottom: '20px', textAlign: 'left' }}>
              {this.state.error?.message || String(this.state.error)}
            </pre>
            <button className="btn btn-primary" onClick={() => window.location.reload()}>
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <HackathonProvider>
        <AppContent />
      </HackathonProvider>
    </ErrorBoundary>
  );
}
