import React, { useState, useMemo } from 'react';
import {
  Vote,
  Award,
  Flame,
  Search,
  ThumbsUp,
  X,
  Trophy,
  Calendar,
  Sparkles,
  ExternalLink,
  GitBranch,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useHackathon } from '../context/HackathonContext.jsx';

export default function Community() {
  const {
    events,
    selectedEventId,
    setSelectedEventId,
    submissions,
    castVote,
    retractVote
  } = useHackathon();

  const [searchTerm, setSearchTerm] = useState('');
  const [trackFilter, setTrackFilter] = useState('all');

  // Currently active event details
  const activeEvent = useMemo(() => {
    return events.find((e) => e.id === selectedEventId) || events[0] || null;
  }, [events, selectedEventId]);

  // Submissions for the currently selected event
  const eventSubmissions = useMemo(() => {
    return submissions.filter((s) => s.eventId === selectedEventId);
  }, [submissions, selectedEventId]);

  // Real-time filtered submissions
  const filteredSubmissions = useMemo(() => {
    return eventSubmissions.filter((sub) => {
      if (trackFilter !== 'all' && !sub.track.toLowerCase().includes(trackFilter.toLowerCase())) {
        return false;
      }
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesTitle = sub.title?.toLowerCase().includes(q);
        const matchesTeam = sub.teamName?.toLowerCase().includes(q);
        const matchesTagline = sub.tagline?.toLowerCase().includes(q);
        const matchesTrack = sub.track?.toLowerCase().includes(q);
        return matchesTitle || matchesTeam || matchesTagline || matchesTrack;
      }
      return true;
    });
  }, [eventSubmissions, trackFilter, searchTerm]);

  // Ranked leaderboard sorted by community votes
  const leaderboard = useMemo(() => {
    return [...filteredSubmissions].sort((a, b) => b.votesCount - a.votesCount);
  }, [filteredSubmissions]);

  // Total community votes across this event
  const totalVotes = useMemo(() => {
    return eventSubmissions.reduce((sum, s) => sum + (s.votesCount || 0), 0);
  }, [eventSubmissions]);

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px 80px' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: 'var(--radius-pill)', background: 'rgba(6, 182, 212, 0.12)', border: '1px solid rgba(6, 182, 212, 0.3)', marginBottom: '14px' }}>
          <Flame size={16} color="#38bdf8" />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#38bdf8', letterSpacing: '0.04em' }}>
            COMMUNITY VOTING & LEADERBOARD • SHARED CONTEXT
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', lineHeight: 1.15, marginBottom: '8px', background: 'linear-gradient(135deg, #ffffff 40%, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Community Voting & Live Leaderboard
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '720px' }}>
              Select any hackathon from <strong>HackathonContext</strong> to view live community vote tallies and project rankings.
            </p>
          </div>

          {/* Dynamic Active Event Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255, 255, 255, 0.03)', padding: '8px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <span style={{ fontSize: '0.825rem', color: '#c084fc', fontWeight: 600 }}>Active Event:</span>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              style={{
                background: '#0f1424',
                color: '#fff',
                border: '1px solid rgba(124, 58, 237, 0.4)',
                borderRadius: '6px',
                padding: '8px 14px',
                fontSize: '0.85rem',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              {events.map((evt) => (
                <option key={evt.id} value={evt.id}>
                  {evt.title} ({evt.status})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Active Event Overview Stats Bar */}
      {activeEvent && (
        <div className="glass-panel" style={{ padding: '20px 24px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                ● Voting Open
              </span>
              <span style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>{activeEvent.title}</span>
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Format: {activeEvent.format} • Prize Pool: <strong style={{ color: '#facc15' }}>{activeEvent.prizePool}</strong> • Total Submissions: <strong>{eventSubmissions.length}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '24px' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>Total Community Votes</span>
              <strong style={{ fontSize: '1.4rem', color: '#38bdf8' }}>{totalVotes}</strong>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block' }}>Registered Teams</span>
              <strong style={{ fontSize: '1.4rem', color: '#34d399' }}>{activeEvent.participantCount}</strong>
            </div>
          </div>
        </div>
      )}

      {/* Search & Filter Toolbar Above Voting Table */}
      <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Search Input */}
        <div style={{ position: 'relative', flex: 1, minWidth: '280px', maxWidth: '420px' }}>
          <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search projects or team names in real-time..."
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

        {/* Track Dropdown Filter */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
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
              maxWidth: '220px'
            }}
          >
            <option value="all">All Tracks</option>
            {activeEvent?.tracks?.map((t) => (
              <option key={t.id || t.name} value={t.name}>{t.name}</option>
            ))}
          </select>

          {/* Reset Filters */}
          {(searchTerm || trackFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setTrackFilter('all');
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
          Showing <strong style={{ color: '#f1f5f9' }}>{leaderboard.length}</strong> ranked entries
          {searchTerm && <span> matching "<span style={{ color: '#38bdf8' }}>{searchTerm}</span>"</span>}
        </div>
      </div>

      {/* Leaderboard Table */}
      {leaderboard.length > 0 ? (
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '14px 20px', width: '80px' }}>Rank</th>
                  <th style={{ padding: '14px 20px' }}>Project Submission</th>
                  <th style={{ padding: '14px 16px' }}>Track</th>
                  <th style={{ padding: '14px 16px' }}>Judge Score</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right' }}>Community Votes</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((item, idx) => (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      transition: 'background-color 0.15s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    {/* Rank */}
                    <td style={{
                      padding: '16px 20px',
                      fontWeight: 800,
                      fontSize: '1.05rem',
                      color: idx === 0 ? '#facc15' : idx === 1 ? '#cbd5e1' : idx === 2 ? '#c084fc' : 'var(--text-dim)'
                    }}>
                      #{idx + 1}
                    </td>

                    {/* Project */}
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          style={{ width: '48px', height: '36px', borderRadius: '6px', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, color: '#f1f5f9' }}>{item.title}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Team: {item.teamName}</div>
                        </div>
                      </div>
                    </td>

                    {/* Track */}
                    <td style={{ padding: '16px 16px', color: 'var(--text-muted)' }}>
                      <span className="badge" style={{ background: 'rgba(6, 182, 212, 0.12)', color: '#38bdf8', fontSize: '0.72rem' }}>
                        {item.track}
                      </span>
                    </td>

                    {/* Judge Score */}
                    <td style={{ padding: '16px 16px', color: '#34d399', fontWeight: 600 }}>
                      {item.judgeScores?.average ? `${item.judgeScores.average} / 10` : 'Pending'}
                    </td>

                    {/* Community Votes with Action */}
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <button
                        className={`btn btn-sm ${item.hasVoted ? 'btn-success' : 'btn-secondary'}`}
                        onClick={() => (item.hasVoted ? retractVote(item.id) : castVote(item.id))}
                        style={{ padding: '5px 12px', fontSize: '0.825rem' }}
                        title={item.hasVoted ? 'Click to retract vote' : 'Click to vote'}
                      >
                        <ThumbsUp size={13} />
                        <span>{item.votesCount}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--text-dim)' }}>
            <Search size={24} />
          </div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>No Submissions Found for Active Event</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
            There are no submissions matching your filters for "{activeEvent?.title}".
          </p>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setSearchTerm('');
              setTrackFilter('all');
            }}
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
