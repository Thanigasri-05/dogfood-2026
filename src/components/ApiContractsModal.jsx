import React, { useState } from 'react';
import { X, Code2, Copy, Check, Server, Shield, Send, Terminal, BookOpen } from 'lucide-react';
import { API_CONTRACTS } from '../services/apiContracts.js';

export default function ApiContractsModal({ isOpen, onClose, currentBaseUrl, isMockMode, onUpdateConfig }) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState('events');
  const [copiedPath, setCopiedPath] = useState(null);
  const [testUrl, setTestUrl] = useState(currentBaseUrl);

  const modules = Object.keys(API_CONTRACTS.modules);
  const activeModule = API_CONTRACTS.modules[activeTab];

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedPath(id);
    setTimeout(() => setCopiedPath(null), 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      backgroundColor: 'rgba(5, 7, 15, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '1000px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0c1020',
        border: '1px solid rgba(124, 58, 237, 0.3)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px rgba(124, 58, 237, 0.15)',
        overflow: 'hidden'
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <Terminal size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                Backend API Contracts Specification
                <span className="badge" style={{ background: 'rgba(124, 58, 237, 0.2)', color: '#c084fc', border: '1px solid rgba(124, 58, 237, 0.3)' }}>
                  {API_CONTRACTS.version}
                </span>
              </h2>
              <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: 0 }}>
                Standardized REST schemas connecting frontend views to backend services
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary btn-sm"
            style={{ padding: '6px', borderRadius: '50%' }}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Base URL Configuration Bar */}
        <div style={{
          padding: '12px 24px',
          background: 'rgba(0, 0, 0, 0.3)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <Server size={16} color="#06b6d4" />
            <span>Target Backend URL:</span>
          </div>
          <input
            type="text"
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            placeholder="http://localhost:5000/api/v1"
            style={{
              flex: 1,
              minWidth: '220px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '6px 12px',
              color: '#fff',
              fontSize: '0.85rem',
              fontFamily: 'var(--font-mono)'
            }}
          />
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onUpdateConfig({ baseUrl: testUrl })}
          >
            Apply Base URL
          </button>
          <button
            className={`btn btn-sm ${isMockMode ? 'btn-success' : 'btn-secondary'}`}
            onClick={() => onUpdateConfig({ useMock: !isMockMode })}
            title="Toggle between real backend fetch and mock data fallback"
          >
            {isMockMode ? '✓ Mock Fallback: ACTIVE' : '⚡ Live Backend: ACTIVE'}
          </button>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'rgba(255, 255, 255, 0.01)',
          padding: '0 24px',
          overflowX: 'auto'
        }}>
          {modules.map((modKey) => {
            const mod = API_CONTRACTS.modules[modKey];
            const isActive = activeTab === modKey;
            return (
              <button
                key={modKey}
                onClick={() => setActiveTab(modKey)}
                style={{
                  padding: '14px 18px',
                  background: 'none',
                  border: 'none',
                  borderBottom: isActive ? '2px solid #7c3aed' : '2px solid transparent',
                  color: isActive ? '#fff' : 'var(--text-muted)',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>{mod.title.split(' ')[0]}</span>
                <span style={{
                  fontSize: '0.7rem',
                  background: isActive ? 'rgba(124, 58, 237, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                  padding: '2px 6px',
                  borderRadius: '10px'
                }}>
                  {mod.endpoints.length}
                </span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div style={{
          padding: '24px',
          overflowY: 'auto',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', margin: '0 0 4px 0' }}>{activeModule.title}</h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>{activeModule.description}</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {activeModule.endpoints.map((ep, idx) => {
              const epId = `${ep.method}-${ep.path}`;
              const isCopied = copiedPath === epId;

              const methodColor = 
                ep.method === 'GET' ? '#06b6d4' :
                ep.method === 'POST' ? '#10b981' :
                ep.method === 'PUT' ? '#f59e0b' : '#ef4444';

              return (
                <div key={idx} style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  {/* Endpoint Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{
                        background: `${methodColor}20`,
                        color: methodColor,
                        border: `1px solid ${methodColor}50`,
                        padding: '3px 10px',
                        borderRadius: '6px',
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-mono)'
                      }}>
                        {ep.method}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.95rem', fontWeight: 600, color: '#f1f5f9' }}>
                        {ep.path}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ep.name}</span>
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '4px 8px', fontSize: '0.75rem' }}
                        onClick={() => handleCopy(`${ep.method} ${ep.path}`, epId)}
                        title="Copy endpoint"
                      >
                        {isCopied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Query / URL Params if any */}
                  {ep.queryParams && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <span style={{ color: '#c084fc', fontWeight: 600 }}>Query Parameters: </span>
                      <code>{JSON.stringify(ep.queryParams)}</code>
                    </div>
                  )}

                  {/* Request Body if applicable */}
                  {ep.requestBody && (
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Payload Request Schema:
                      </div>
                      <pre style={{
                        background: '#070a13',
                        padding: '12px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        color: '#38bdf8',
                        overflowX: 'auto',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                      }}>
                        {JSON.stringify(ep.requestBody, null, 2)}
                      </pre>
                    </div>
                  )}

                  {/* Response Body */}
                  {ep.responseBody && (
                    <div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Standard 200 OK Response Contract:
                      </div>
                      <pre style={{
                        background: '#070a13',
                        padding: '12px',
                        borderRadius: '8px',
                        fontSize: '0.8rem',
                        color: '#34d399',
                        overflowX: 'auto',
                        border: '1px solid rgba(255, 255, 255, 0.05)'
                      }}>
                        {JSON.stringify(ep.responseBody, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(0, 0, 0, 0.2)'
        }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
            Service Layer: <code>src/services/api.js</code> • Real backend + mock fallback ready
          </span>
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
