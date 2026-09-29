import React, { useState, useMemo } from 'react';
import {
  Award,
  Search,
  Filter,
  X,
  Building,
  CheckCircle2,
  Clock,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Table as TableIcon,
  LayoutGrid,
  Calendar,
  UserPlus
} from 'lucide-react';
import { useHackathon } from '../context/HackathonContext.jsx';

export default function Judges() {
  const { events, judges, assignJudgeToEvent } = useHackathon();

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [eventFilter, setEventFilter] = useState('all');
  const [orgFilter, setOrgFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  // Modals & Assignment
  const [selectedJudgeModal, setSelectedJudgeModal] = useState(null);
  const [assigningJudge, setAssigningJudge] = useState(null);
  const [selectedEventToAssign, setSelectedEventToAssign] = useState('');

  // Real-time instant filtering across events, search, organization, and status
  const filteredJudges = useMemo(() => {
    return judges.filter((judge) => {
      // Dynamic Event Filter from HackathonContext
      if (eventFilter !== 'all') {
        const isAssigned = judge.assignedEventIds?.includes(eventFilter) ||
          judge.assignedEvents?.some((eName) => {
            const ev = events.find((e) => e.id === eventFilter);
            return ev && ev.title.toLowerCase() === eName.toLowerCase();
          });
        if (!isAssigned) return false;
      }

      // Organization filter
      if (orgFilter !== 'all' && !judge.organization.toLowerCase().includes(orgFilter.toLowerCase())) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all' && judge.status?.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = judge.name?.toLowerCase().includes(q);
        const matchesEmail = judge.email?.toLowerCase().includes(q);
        const matchesOrg = judge.organization?.toLowerCase().includes(q);
        const matchesRole = judge.role?.toLowerCase().includes(q);
        const matchesEvents = judge.assignedEvents?.some((e) => e.toLowerCase().includes(q));
        const matchesCriteria = judge.rubricCriteria?.some((c) => c.name.toLowerCase().includes(q));
        return matchesName || matchesEmail || matchesOrg || matchesRole || matchesEvents || matchesCriteria;
      }
      return true;
    });
  }, [judges, eventFilter, orgFilter, statusFilter, searchTerm, events]);

  // Extract distinct organizations for dropdown
  const availableOrgs = useMemo(() => {
    const orgs = new Set();
    judges.forEach((j) => {
      if (j.organization) orgs.add(j.organization);
    });
    return Array.from(orgs);
  }, [judges]);

  const handleAssignSubmit = (e) => {
    e.preventDefault();
    if (!selectedEventToAssign || !assigningJudge) return;
    assignJudgeToEvent(assigningJudge.id, selectedEventToAssign);
    setAssigningJudge(null);
    setSelectedEventToAssign('');
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px 80px' }}>
      
      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: 'var(--radius-pill)', background: 'rgba(124, 58, 237, 0.12)', border: '1px solid rgba(124, 58, 237, 0.3)', marginBottom: '14px' }}>
          <Award size={16} color="#c084fc" />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#c084fc', letterSpacing: '0.04em' }}>
            EVALUATION PANEL & RUBRICS • CONSUMING SHARED HACKATHON CONTEXT
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', lineHeight: 1.15, marginBottom: '8px', background: 'linear-gradient(135deg, #ffffff 40%, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Evaluation Judges & Rubrics
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '720px' }}>
              Event dropdown below is dynamically populated from <strong>HackathonContext</strong>. Any event created in the Events tab immediately appears here.
            </p>
          </div>

          {/* View Mode Toggle */}
          <div style={{ display: 'flex', gap: '4px', background: 'rgba(255, 255, 255, 0.05)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => setViewMode('table')}
              className={`btn btn-sm ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 12px' }}
              title="Table View"
            >
              <TableIcon size={15} />
              <span>Admin Table</span>
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 12px' }}
              title="Cards View"
            >
              <LayoutGrid size={15} />
              <span>Cards Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SEARCH & DROPDOWN FILTER TOOLBAR (With Dynamic Event Options from Context)
         ========================================================================= */}
      <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Real-time Search Input */}
        <div style={{ position: 'relative', flex: 1, minWidth: '280px', maxWidth: '380px' }}>
          <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search judges by name, organization, event, criteria..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '9px 12px 9px 36px',
              color: '#ffffff',
              fontSize: '0.875rem'
            }}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-dim)',
                cursor: 'pointer'
              }}
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Dropdown Filters */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          
          {/* Dynamic Event Dropdown populated by HackathonContext */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: '#c084fc', fontWeight: 600 }}>Event:</span>
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              style={{
                background: '#0f1424',
                color: '#f8fafc',
                border: '1px solid rgba(124, 58, 237, 0.4)',
                borderRadius: 'var(--radius-sm)',
                padding: '7px 12px',
                fontSize: '0.825rem',
                cursor: 'pointer',
                maxWidth: '220px'
              }}
            >
              <option value="all">All Events ({events.length})</option>
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.title}
                </option>
              ))}
            </select>
          </div>

          {/* Organization Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Org:</span>
            <select
              value={orgFilter}
              onChange={(e) => setOrgFilter(e.target.value)}
              style={{
                background: '#0f1424',
                color: '#f8fafc',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '7px 12px',
                fontSize: '0.825rem',
                cursor: 'pointer',
                maxWidth: '180px'
              }}
            >
              <option value="all">All Orgs</option>
              {availableOrgs.map((org) => (
                <option key={org} value={org}>{org}</option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                background: '#0f1424',
                color: '#f8fafc',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-sm)',
                padding: '7px 12px',
                fontSize: '0.825rem',
                cursor: 'pointer'
              }}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Reset Filters */}
          {(searchTerm || eventFilter !== 'all' || orgFilter !== 'all' || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setEventFilter('all');
                setOrgFilter('all');
                setStatusFilter('all');
              }}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem' }}
            >
              <X size={12} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Row Counter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', fontSize: '0.825rem', color: 'var(--text-dim)' }}>
        <div>
          Showing <strong style={{ color: '#f1f5f9' }}>{filteredJudges.length}</strong> of <strong style={{ color: '#f1f5f9' }}>{judges.length}</strong> evaluation judges
          {eventFilter !== 'all' && (
            <span> for event "<span style={{ color: '#c084fc' }}>{events.find((e) => e.id === eventFilter)?.title}</span>"</span>
          )}
          {searchTerm && <span> matching "<span style={{ color: '#38bdf8' }}>{searchTerm}</span>"</span>}
        </div>
      </div>

      {/* =========================================================================
          ADMIN TABLE VIEW
         ========================================================================= */}
      {filteredJudges.length > 0 && viewMode === 'table' && (
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Judge Profile</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>Organization & Role</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>Assigned Events</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>Rubric Criteria</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>Scoring Progress</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right', fontWeight: 600 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredJudges.map((judge) => {
                  const totalEvals = judge.evaluationsCompleted + judge.evaluationsPending;
                  const percentComplete = totalEvals > 0 ? Math.round((judge.evaluationsCompleted / totalEvals) * 100) : 0;

                  return (
                    <tr
                      key={judge.id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      {/* Judge Profile */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={judge.avatar}
                            alt={judge.name}
                            style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, color: '#f1f5f9' }}>{judge.name}</div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
                              {judge.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Organization & Role */}
                      <td style={{ padding: '16px 16px' }}>
                        <div style={{ fontWeight: 600, color: '#cbd5e1' }}>{judge.organization}</div>
                        <div style={{ fontSize: '0.8rem', color: '#06b6d4', marginTop: '2px' }}>{judge.role}</div>
                      </td>

                      {/* Assigned Events */}
                      <td style={{ padding: '16px 16px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '240px' }}>
                          {judge.assignedEvents?.map((evt, idx) => (
                            <span key={idx} className="badge" style={{ background: 'rgba(124, 58, 237, 0.15)', color: '#c084fc', fontSize: '0.7rem' }}>
                              {evt}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Rubric Criteria */}
                      <td style={{ padding: '16px 16px', color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                        <strong style={{ color: '#fff' }}>{judge.rubricCriteria?.length}</strong> criteria
                      </td>

                      {/* Scoring Progress */}
                      <td style={{ padding: '16px 16px', minWidth: '150px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                          <span style={{ color: '#10b981', fontWeight: 600 }}>{judge.evaluationsCompleted} reviewed</span>
                          <span style={{ color: 'var(--text-dim)' }}>{judge.evaluationsPending} pending</span>
                        </div>
                        <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            width: `${percentComplete}%`,
                            background: 'linear-gradient(90deg, #10b981, #06b6d4)',
                            borderRadius: '3px'
                          }} />
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '16px 16px' }}>
                        <span className="badge" style={{
                          background: judge.status === 'active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: judge.status === 'active' ? '#34d399' : '#fbbf24',
                          border: `1px solid ${judge.status === 'active' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                        }}>
                          {judge.status === 'active' ? 'Active' : 'Pending'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '5px 8px', fontSize: '0.75rem' }}
                            onClick={() => {
                              setAssigningJudge(judge);
                              setSelectedEventToAssign(events[0]?.id || '');
                            }}
                            title="Assign to Event"
                          >
                            <UserPlus size={13} />
                            <span>Assign</span>
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '5px 8px', fontSize: '0.75rem' }}
                            onClick={() => setSelectedJudgeModal(judge)}
                          >
                            Rubric
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================================
          CARDS GRID VIEW
         ========================================================================= */}
      {filteredJudges.length > 0 && viewMode === 'grid' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
          {filteredJudges.map((judge) => (
            <div key={judge.id} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                <img src={judge.avatar} alt={judge.name} style={{ width: '54px', height: '54px', borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <h3 style={{ fontSize: '1.1rem', margin: 0 }}>{judge.name}</h3>
                  <span style={{ fontSize: '0.8rem', color: '#06b6d4' }}>{judge.role} • {judge.organization}</span>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{judge.email}</div>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>Assigned Events:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {judge.assignedEvents?.map((e, idx) => (
                    <span key={idx} className="badge" style={{ background: 'rgba(124, 58, 237, 0.15)', color: '#c084fc', fontSize: '0.72rem' }}>
                      {e}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => {
                    setAssigningJudge(judge);
                    setSelectedEventToAssign(events[0]?.id || '');
                  }}
                >
                  <UserPlus size={13} />
                  <span>Assign Event</span>
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => setSelectedJudgeModal(judge)}>
                  Rubric Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assign Judge to Event Modal */}
      {assigningJudge && (
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
            maxWidth: '480px',
            backgroundColor: '#0c1020',
            border: '1px solid rgba(124, 58, 237, 0.4)',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Assign Event to {assigningJudge.name}</h3>
              <button onClick={() => setAssigningJudge(null)} className="btn btn-secondary btn-sm" style={{ padding: '6px' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit}>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                Select an event from the shared HackathonContext. Events added on the Events page automatically appear in this list:
              </p>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '6px' }}>
                  Target Hackathon:
                </label>
                <select
                  value={selectedEventToAssign}
                  onChange={(e) => setSelectedEventToAssign(e.target.value)}
                  style={{ width: '100%', background: '#0f1424', color: '#fff', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '10px 14px' }}
                >
                  {events.map((evt) => (
                    <option key={evt.id} value={evt.id}>
                      {evt.title} ({evt.status})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setAssigningJudge(null)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rubric Details Modal */}
      {selectedJudgeModal && (
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
            maxWidth: '600px',
            backgroundColor: '#0c1020',
            border: '1px solid rgba(124, 58, 237, 0.3)',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <img
                  src={selectedJudgeModal.avatar}
                  alt={selectedJudgeModal.name}
                  style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <h3 style={{ fontSize: '1.25rem', margin: 0 }}>{selectedJudgeModal.name}</h3>
                  <span style={{ fontSize: '0.85rem', color: '#c084fc' }}>{selectedJudgeModal.role} • {selectedJudgeModal.organization}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedJudgeModal(null)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '6px', borderRadius: '50%' }}
              >
                <X size={16} />
              </button>
            </div>

            <h4 style={{ fontSize: '0.9rem', color: '#06b6d4', textTransform: 'uppercase', marginBottom: '12px' }}>
              Evaluation Rubrics Breakdown
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' }}>
              {selectedJudgeModal.rubricCriteria.map((c) => (
                <div key={c.id} style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{c.name}</span>
                    <strong style={{ color: '#facc15' }}>{(c.weight * 100)}% Weight</strong>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Max Score: {c.maxScore} points</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setSelectedJudgeModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
