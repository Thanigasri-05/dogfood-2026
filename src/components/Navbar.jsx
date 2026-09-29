import React, { useState, useEffect } from 'react';
import { Terminal, Database, ShieldCheck, Flame, Bug, Wifi, WifiOff, FileText, CheckCircle2 } from 'lucide-react';
import api from '../services/api.js';

export default function Navbar({ onOpenApiContracts, currentTab, onSelectTab }) {
  const [apiConfig, setApiConfig] = useState({
    baseUrl: api.getBaseUrl(),
    useMock: api.isMockMode(),
    simulatedError: api.simulatedError,
    lastFallbackOccurred: api.lastFallbackOccurred
  });

  useEffect(() => {
    const unsubscribe = api.onConfigChange((cfg) => {
      setApiConfig({ ...cfg });
    });
    return unsubscribe;
  }, []);

  const handleToggleMock = () => {
    api.setMockMode(!apiConfig.useMock);
  };

  const handleToggleSimulateError = () => {
    api.setSimulateError(!apiConfig.simulatedError);
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      backgroundColor: 'rgba(10, 12, 20, 0.85)',
      borderBottom: '1px solid var(--border-subtle)',
      padding: '12px 24px'
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        {/* Brand / Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(124, 58, 237, 0.4)'
          }}>
            <Flame size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.2rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                background: 'linear-gradient(90deg, #ffffff, #cbd5e1)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                DOGFOOD
              </span>
              <span style={{
                background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                color: '#fff',
                fontSize: '0.65rem',
                fontWeight: 800,
                padding: '2px 6px',
                borderRadius: '4px'
              }}>
                2026
              </span>
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', letterSpacing: '0.04em' }}>
              DEVELOPER HACKATHONS
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {[
            { id: 'events', label: 'Events' },
            { id: 'users', label: 'Users' },
            { id: 'judges', label: 'Judges' },
            { id: 'submissions', label: 'Submissions' },
            { id: 'voting', label: 'Community Voting' }
          ].map((tab) => {
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                style={{
                  background: isActive ? 'rgba(124, 58, 237, 0.15)' : 'transparent',
                  color: isActive ? '#c084fc' : 'var(--text-muted)',
                  border: isActive ? '1px solid rgba(124, 58, 237, 0.3)' : '1px solid transparent',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)'
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* API Status & Developer Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Contracts Button */}
          <button
            onClick={onOpenApiContracts}
            className="btn btn-secondary btn-sm"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Inspect REST API Contracts for all modules"
          >
            <FileText size={14} color="#06b6d4" />
            <span>API Contracts</span>
          </button>

          {/* Test Error Toggle Button */}
          <button
            onClick={handleToggleSimulateError}
            className={`btn btn-sm ${apiConfig.simulatedError ? 'btn-danger' : 'btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            title="Simulate backend 503 error to test frontend error handling & retry"
          >
            <Bug size={14} />
            <span>{apiConfig.simulatedError ? 'Simulate 503: ON' : 'Test Error State'}</span>
          </button>

          {/* Connection Mode Pill */}
          <div
            onClick={handleToggleMock}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 12px',
              borderRadius: 'var(--radius-pill)',
              background: apiConfig.lastFallbackOccurred
                ? 'rgba(245, 158, 11, 0.15)'
                : apiConfig.useMock
                ? 'rgba(16, 185, 129, 0.15)'
                : 'rgba(6, 182, 212, 0.15)',
              border: `1px solid ${
                apiConfig.lastFallbackOccurred
                  ? 'rgba(245, 158, 11, 0.4)'
                  : apiConfig.useMock
                  ? 'rgba(16, 185, 129, 0.4)'
                  : 'rgba(6, 182, 212, 0.4)'
              }`,
              cursor: 'pointer',
              fontSize: '0.75rem',
              fontWeight: 600,
              userSelect: 'none',
              transition: 'all 0.2s ease'
            }}
            title="Click to toggle between Mock Fallback and Live Backend"
          >
            {apiConfig.lastFallbackOccurred ? (
              <>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }} />
                <span style={{ color: '#fbbf24' }}>Auto-Fallback Triggered</span>
              </>
            ) : apiConfig.useMock ? (
              <>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }} />
                <span style={{ color: '#34d399' }}>Mock Mode (Active)</span>
              </>
            ) : (
              <>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#06b6d4' }} />
                <span style={{ color: '#38bdf8' }}>Live Backend API</span>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
