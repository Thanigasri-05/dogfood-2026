import React, { useState, useMemo } from 'react';
import {
  Trophy,
  ThumbsUp,
  GitBranch,
  ExternalLink,
  Code2,
  AlertTriangle,
  RefreshCw,
  Search,
  Filter,
  X,
  Sparkles,
  Table as TableIcon,
  LayoutGrid,
  CheckCircle2,
  Clock,
  Calendar
} from 'lucide-react';
import { useHackathon } from '../context/HackathonContext.jsx';

export default function Submissions() {
  const { events, submissions, castVote, retractVote } = useHackathon();

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [eventFilter, setEventFilter] = useState('all');
  const [trackFilter, setTrackFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('votes'); // 'votes' | 'score' | 'recent'
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  // Modal inspection
  const [selectedSubModal, setSelectedSubModal] = useState(null);

  // Real-time client filtering across dynamic events from context
  const filteredSubmissions = useMemo(() => {
    let list = submissions.filter((sub) => {
      // Event filter from shared context
      if (eventFilter !== 'all' && sub.eventId !== eventFilter) {
        return false;
      }
      // Track filter
      if (trackFilter !== 'all' && !sub.track.toLowerCase().includes(trackFilter.toLowerCase())) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'all' && sub.status?.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesTitle = sub.title?.toLowerCase().includes(q);
        const matchesTagline = sub.tagline?.toLowerCase().includes(q);
        const matchesTeam = sub.teamName?.toLowerCase().includes(q);
        const matchesDesc = sub.description?.toLowerCase().includes(q);
        const matchesMember = sub.members?.some((m) => m.name.toLowerCase().includes(q));
        const matchesTrack = sub.track?.toLowerCase().includes(q);
        return matchesTitle || matchesTagline || matchesTeam || matchesDesc || matchesMember || matchesTrack;
      }
      return true;
    });

    if (sortBy === 'votes') {
      list.sort((a, b) => b.votesCount - a.votesCount);
    } else if (sortBy === 'score') {
      list.sort((a, b) => (b.judgeScores?.average || 0) - (a.judgeScores?.average || 0));
    }

    return list;
  }, [submissions, eventFilter, trackFilter, statusFilter, searchTerm, sortBy]);

  // Extract distinct tracks
  const availableTracks = useMemo(() => {
    const tracks = new Set();
    submissions.forEach((s) => {
      if (s.track) tracks.add(s.track);
    });
    return Array.from(tracks);
  }, [submissions]);

  const handleVoteToggle = (e, sub) => {
    e.stopPropagation();
    if (sub.hasVoted) {
      retractVote(sub.id);
    } else {
      castVote(sub.id);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px 80px' }}>
      
      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: 'var(--radius-pill)', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', marginBottom: '14px' }}>
          <Trophy size={16} color="#34d399" />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#34d399', letterSpacing: '0.04em' }}>
            PROJECT SHOWCASE • CONSUMING SHARED HACKATHON CONTEXT
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', lineHeight: 1.15, marginBottom: '8px', background: 'linear-gradient(135deg, #ffffff 40%, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Project Submissions Admin Table
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '720px' }}>
              Submissions linked dynamically to events defined in <strong>HackathonContext</strong>.
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
              title="Cards Grid"
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
        <div style={{ position: 'relative', flex: 1, minWidth: '260px', maxWidth: '380px' }}>
          <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search submissions by title, team, member, track..."
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
            <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 600 }}>Event:</span>
            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              style={{
                background: '#0f1424',
                color: '#f8fafc',
                border: '1px solid rgba(6, 182, 212, 0.4)',
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

          {/* Track Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Track:</span>
            <select
              value={trackFilter}
              onChange={(e) => setTrackFilter(e.target.value)}
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
              <option value="all">All Tracks</option>
              {availableTracks.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
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
              <option value="votes">Most Votes</option>
              <option value="score">Highest Score</option>
            </select>
          </div>

          {/* Reset Filters */}
          {(searchTerm || eventFilter !== 'all' || trackFilter !== 'all' || statusFilter !== 'all' || sortBy !== 'votes') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setEventFilter('all');
                setTrackFilter('all');
                setStatusFilter('all');
                setSortBy('votes');
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
          Showing <strong style={{ color: '#f1f5f9' }}>{filteredSubmissions.length}</strong> of <strong style={{ color: '#f1f5f9' }}>{submissions.length}</strong> project submissions
          {eventFilter !== 'all' && (
            <span> for "<span style={{ color: '#38bdf8' }}>{events.find((e) => e.id === eventFilter)?.title}</span>"</span>
          )}
          {searchTerm && <span> matching "<span style={{ color: '#38bdf8' }}>{searchTerm}</span>"</span>}
        </div>
      </div>

      {/* =========================================================================
          ADMIN TABLE VIEW
         ========================================================================= */}
      {filteredSubmissions.length > 0 && viewMode === 'table' && (
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Project Submission</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>Track</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>Team & Members</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>Judge Score</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>Votes</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right', fontWeight: 600 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.map((sub) => (
                  <tr
                    key={sub.id}
                    onClick={() => setSelectedSubModal(sub)}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background-color 0.15s ease',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    {/* Project */}
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <img
                          src={sub.thumbnail}
                          alt={sub.title}
                          style={{ width: '56px', height: '42px', borderRadius: '6px', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.95rem' }}>{sub.title}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>{sub.tagline}</div>
                        </div>
                      </div>
                    </td>

                    {/* Track */}
                    <td style={{ padding: '16px 16px' }}>
                      <span className="badge" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#38bdf8', fontSize: '0.72rem' }}>
                        {sub.track}
                      </span>
                    </td>

                    {/* Team */}
                    <td style={{ padding: '16px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#cbd5e1' }}>{sub.teamName}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginTop: '2px' }}>
                        {sub.members?.map((m) => m.name).join(', ')}
                      </div>
                    </td>

                    {/* Judge Score */}
                    <td style={{ padding: '16px 16px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: 700 }}>
                        <Trophy size={14} color="#facc15" />
                        <span>{sub.judgeScores?.average ? `${sub.judgeScores.average} / 10` : 'Pending'}</span>
                      </div>
                    </td>

                    {/* Community Votes */}
                    <td style={{ padding: '16px 16px', whiteSpace: 'nowrap' }}>
                      <button
                        className={`btn btn-sm ${sub.hasVoted ? 'btn-success' : 'btn-secondary'}`}
                        onClick={(e) => handleVoteToggle(e, sub)}
                        style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                        title={sub.hasVoted ? 'Click to retract vote' : 'Click to vote'}
                      >
                        <ThumbsUp size={13} />
                        <span>{sub.votesCount}</span>
                      </button>
                    </td>

                    {/* Status */}
                    <td style={{ padding: '16px 16px' }}>
                      <span className="badge" style={{
                        background: sub.status === 'approved' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: sub.status === 'approved' ? '#34d399' : '#fbbf24'
                      }}>
                        {sub.status === 'approved' ? 'Approved' : 'Pending'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                        <a
                          href={sub.repoUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '5px 8px' }}
                          onClick={(e) => e.stopPropagation()}
                          title="GitHub Repository"
                        >
                          <GitBranch size={14} />
                        </a>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedSubModal(sub);
                          }}
                        >
                          Inspect
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Submission Detail Modal */}
      {selectedSubModal && (
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
            maxWidth: '650px',
            backgroundColor: '#0c1020',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <span className="badge" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#38bdf8', marginBottom: '6px' }}>{selectedSubModal.track}</span>
                <h2 style={{ fontSize: '1.4rem', margin: 0 }}>{selectedSubModal.title}</h2>
              </div>
              <button
                onClick={() => setSelectedSubModal(null)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '6px', borderRadius: '50%' }}
              >
                <X size={16} />
              </button>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
              {selectedSubModal.description}
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Team</span>
                <div style={{ fontWeight: 600 }}>{selectedSubModal.teamName}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Judge Score Average</span>
                <div style={{ fontWeight: 700, color: '#34d399' }}>{selectedSubModal.judgeScores?.average ? `${selectedSubModal.judgeScores.average} / 10` : 'Under Review'}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <a href={selectedSubModal.demoUrl} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">
                <span>Open Live Demo</span>
                <ExternalLink size={14} />
              </a>
              <button className="btn btn-secondary btn-sm" onClick={() => setSelectedSubModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
