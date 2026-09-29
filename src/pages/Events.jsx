import React, { useState, useMemo } from 'react';
import {
  Calendar,
  MapPin,
  Users,
  Trophy,
  Search,
  Filter,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Tag,
  Clock,
  ChevronRight,
  X,
  Server,
  LayoutGrid,
  Table as TableIcon,
  PlusCircle,
  Edit3
} from 'lucide-react';
import { useHackathon } from '../context/HackathonContext.jsx';
import api from '../services/api.js';

export default function Events() {
  const {
    events,
    addEvent,
    updateEvent,
    toggleEventRegistration
  } = useHackathon();

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState('all');
  const [trackFilter, setTrackFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  // Modals & form state
  const [selectedEventModal, setSelectedEventModal] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [registeringId, setRegisteringId] = useState(null);

  // New Event Form Data
  const [formData, setFormData] = useState({
    title: '',
    tagline: '',
    description: '',
    prizePool: '$35,000 USD',
    format: 'Hybrid',
    location: 'San Francisco & Online',
    status: 'upcoming',
    tracksInput: 'Autonomous Agents, DevTools, Zero-Knowledge',
    maxParticipants: 500,
    organizerName: 'DOGFOOD Labs'
  });

  // Real-time client-side filtered events
  const filteredEvents = useMemo(() => {
    return events.filter((evt) => {
      // Status Filter
      if (statusFilter !== 'all' && evt.status.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
      // Track Filter
      if (trackFilter !== 'all') {
        const matchesTrack = evt.tracks?.some((t) =>
          t.name.toLowerCase().includes(trackFilter.toLowerCase())
        );
        if (!matchesTrack) return false;
      }
      // Search Query
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = evt.title?.toLowerCase().includes(query);
        const matchesTagline = evt.tagline?.toLowerCase().includes(query);
        const matchesOrganizer = evt.organizer?.name?.toLowerCase().includes(query);
        const matchesLocation = evt.location?.toLowerCase().includes(query);
        const matchesFormat = evt.format?.toLowerCase().includes(query);
        const matchesTags = evt.tags?.some((tag) => tag.toLowerCase().includes(query));
        const matchesTrackName = evt.tracks?.some((t) => t.name.toLowerCase().includes(query));
        return matchesTitle || matchesTagline || matchesOrganizer || matchesLocation || matchesFormat || matchesTags || matchesTrackName;
      }
      return true;
    });
  }, [events, statusFilter, trackFilter, searchTerm]);

  // Extract all distinct tracks for the dropdown filter dynamically from shared context
  const availableTracks = useMemo(() => {
    const trackSet = new Set();
    events.forEach((evt) => {
      evt.tracks?.forEach((t) => trackSet.add(t.name));
    });
    return Array.from(trackSet);
  }, [events]);

  // Handle Event Creation Form Submit
  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const tracksList = formData.tracksInput
      .split(',')
      .map((t, idx) => ({ id: `trk-${Date.now()}-${idx}`, name: t.trim(), prize: '$10,000' }))
      .filter((t) => t.name.length > 0);

    if (isEditing && selectedEventModal) {
      updateEvent(selectedEventModal.id, {
        title: formData.title,
        tagline: formData.tagline,
        description: formData.description,
        prizePool: formData.prizePool,
        format: formData.format,
        location: formData.location,
        status: formData.status,
        tracks: tracksList.length > 0 ? tracksList : selectedEventModal.tracks
      });
      setSelectedEventModal((prev) => ({ ...prev, ...formData }));
    } else {
      addEvent({
        ...formData,
        tracks: tracksList
      });
    }

    setIsCreateModalOpen(false);
    setIsEditing(false);
    setFormData({
      title: '',
      tagline: '',
      description: '',
      prizePool: '$35,000 USD',
      format: 'Hybrid',
      location: 'San Francisco & Online',
      status: 'upcoming',
      tracksInput: 'Autonomous Agents, DevTools, Zero-Knowledge',
      maxParticipants: 500,
      organizerName: 'DOGFOOD Labs'
    });
  };

  const openEditModal = (event) => {
    setSelectedEventModal(event);
    setFormData({
      title: event.title,
      tagline: event.tagline,
      description: event.description,
      prizePool: event.prizePool,
      format: event.format,
      location: event.location,
      status: event.status,
      tracksInput: event.tracks?.map((t) => t.name).join(', ') || '',
      maxParticipants: event.maxParticipants,
      organizerName: event.organizer?.name || ''
    });
    setIsEditing(true);
    setIsCreateModalOpen(true);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return (
          <span className="badge badge-active">
            <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981' }} />
            Active Now
          </span>
        );
      case 'upcoming':
        return (
          <span className="badge badge-upcoming">
            <Clock size={12} /> Upcoming
          </span>
        );
      case 'completed':
        return (
          <span className="badge badge-completed">
            <CheckCircle2 size={12} /> Concluded
          </span>
        );
      default:
        return <span className="badge">{status}</span>;
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px 80px' }}>
      
      {/* Hero Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: 'var(--radius-pill)', background: 'rgba(124, 58, 237, 0.12)', border: '1px solid rgba(124, 58, 237, 0.3)', marginBottom: '14px' }}>
          <Sparkles size={16} color="#c084fc" />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#c084fc', letterSpacing: '0.04em' }}>
            SHARED REACT CONTEXT (HACKATHON CONTEXT)
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', lineHeight: 1.15, marginBottom: '8px', background: 'linear-gradient(135deg, #ffffff 40%, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Events Management Table
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '720px' }}>
              Events created here dynamically populate dropdown options in Judges, Submissions, and Community Voting in real-time.
            </p>
          </div>

          {/* Action Buttons: Create Event & View Toggle */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={() => {
                setIsEditing(false);
                setIsCreateModalOpen(true);
              }}
              className="btn btn-primary"
              style={{ padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <PlusCircle size={16} />
              <span>Create Event</span>
            </button>

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
                title="Grid View"
              >
                <LayoutGrid size={15} />
                <span>Cards Grid</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SEARCH & GLOBAL FILTERING TOOLBAR (Above each table)
         ========================================================================= */}
      <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Real-time Search Input */}
        <div style={{ position: 'relative', flex: 1, minWidth: '280px', maxWidth: '420px' }}>
          <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search events by title, organizer, track, tags..."
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

        {/* Combined Dropdown Filters */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          
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
              <option value="all">All Statuses</option>
              <option value="active">Active Now</option>
              <option value="upcoming">Upcoming</option>
              <option value="completed">Concluded</option>
            </select>
          </div>

          {/* Track Dropdown Filter */}
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
                maxWidth: '200px'
              }}
            >
              <option value="all">All Tracks</option>
              {availableTracks.map((track) => (
                <option key={track} value={track}>{track}</option>
              ))}
            </select>
          </div>

          {/* Clear Filters Button */}
          {(searchTerm || statusFilter !== 'all' || trackFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
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

      {/* Row Count Badge & Active Filters Summary */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', fontSize: '0.825rem', color: 'var(--text-dim)' }}>
        <div>
          Showing <strong style={{ color: '#f1f5f9' }}>{filteredEvents.length}</strong> of <strong style={{ color: '#f1f5f9' }}>{events.length}</strong> events in HackathonContext
          {searchTerm && <span> matching "<span style={{ color: '#38bdf8' }}>{searchTerm}</span>"</span>}
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {statusFilter !== 'all' && (
            <span className="badge" style={{ background: 'rgba(124, 58, 237, 0.2)', color: '#c084fc' }}>
              Status: {statusFilter}
            </span>
          )}
          {trackFilter !== 'all' && (
            <span className="badge" style={{ background: 'rgba(6, 182, 212, 0.2)', color: '#38bdf8' }}>
              Track: {trackFilter}
            </span>
          )}
        </div>
      </div>

      {/* =========================================================================
          ADMIN TABLE VIEW (Requirement 1, 2, 3)
         ========================================================================= */}
      {filteredEvents.length > 0 && viewMode === 'table' && (
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Event & Organizer</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>Timeline</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>Prize Pool</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>Participants</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>Format / Location</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right', fontWeight: 600 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((event) => {
                  const isReg = event.isRegistered;
                  const isBusy = registeringId === event.id;
                  const percentFilled = Math.min(100, Math.round((event.participantCount / event.maxParticipants) * 100));

                  return (
                    <tr
                      key={event.id}
                      onClick={() => setSelectedEventModal(event)}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background-color 0.15s ease',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      {/* Event Title & Organizer */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          <img
                            src={event.bannerImage}
                            alt={event.title}
                            style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.95rem' }}>
                              {event.title}
                            </div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                              {event.tagline}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px', fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                              <span>by {event.organizer?.name || 'Committee'}</span>
                              {event.organizer?.verified && <ShieldCheck size={12} color="#06b6d4" />}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '16px 16px' }}>
                        {getStatusBadge(event.status)}
                      </td>

                      {/* Dates */}
                      <td style={{ padding: '16px 16px', color: 'var(--text-muted)', fontSize: '0.825rem', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={13} color="#7c3aed" />
                          <span>{new Date(event.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – {new Date(event.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      </td>

                      {/* Prize Pool */}
                      <td style={{ padding: '16px 16px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#facc15', fontWeight: 700 }}>
                          <Trophy size={14} />
                          <span>{event.prizePool}</span>
                        </div>
                      </td>

                      {/* Participant Capacity */}
                      <td style={{ padding: '16px 16px', minWidth: '160px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '4px' }}>
                          <span style={{ color: '#fff', fontWeight: 600 }}>{event.participantCount}</span>
                          <span style={{ color: 'var(--text-dim)' }}>/ {event.maxParticipants}</span>
                        </div>
                        <div style={{ height: '6px', borderRadius: '3px', background: 'rgba(255, 255, 255, 0.08)', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            width: `${percentFilled}%`,
                            background: percentFilled > 80 ? '#ef4444' : 'linear-gradient(90deg, #7c3aed, #06b6d4)',
                            borderRadius: '3px'
                          }} />
                        </div>
                      </td>

                      {/* Format / Location */}
                      <td style={{ padding: '16px 16px', color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MapPin size={13} color="#06b6d4" />
                          <span>{event.format}</span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'block', marginTop: '2px' }}>
                          {event.location}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(event);
                            }}
                            title="Edit Event"
                          >
                            <Edit3 size={13} />
                          </button>

                          <button
                            className={`btn btn-sm ${isReg ? 'btn-success' : 'btn-primary'}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleEventRegistration(event.id);
                            }}
                            style={{ padding: '6px 12px', fontSize: '0.8rem', minWidth: '105px' }}
                          >
                            {isReg ? (
                              <>
                                <CheckCircle2 size={13} />
                                <span>Joined</span>
                              </>
                            ) : (
                              <>
                                <span>Register</span>
                                <ArrowRight size={13} />
                              </>
                            )}
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
      {filteredEvents.length > 0 && viewMode === 'grid' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '28px' }}>
          {filteredEvents.map((event) => {
            const isReg = event.isRegistered;

            return (
              <div
                key={event.id}
                className="glass-panel"
                onClick={() => setSelectedEventModal(event)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'transform var(--transition-normal)'
                }}
              >
                <div style={{ position: 'relative', height: '170px', overflow: 'hidden' }}>
                  <img
                    src={event.bannerImage}
                    alt={event.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.85)' }}
                  />
                  <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', gap: '8px' }}>
                    {getStatusBadge(event.status)}
                    <span className="badge" style={{ background: 'rgba(0,0,0,0.7)', color: '#38bdf8' }}>{event.format}</span>
                  </div>
                  <div style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(10,12,20,0.85)', padding: '4px 12px', borderRadius: '999px', color: '#facc15', fontWeight: 700, fontSize: '0.8rem' }}>
                    {event.prizePool}
                  </div>
                </div>

                <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{event.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>{event.tagline}</p>
                  
                  <div style={{ marginTop: 'auto', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button className="btn btn-secondary btn-sm" onClick={(e) => { e.stopPropagation(); openEditModal(event); }}>
                      <Edit3 size={13} />
                      <span>Edit</span>
                    </button>
                    <button
                      className={`btn btn-sm ${isReg ? 'btn-success' : 'btn-primary'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleEventRegistration(event.id);
                      }}
                    >
                      {isReg ? 'Registered' : 'Register Now'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================================
          CREATE / EDIT EVENT MODAL (Updates Shared Context)
         ========================================================================= */}
      {isCreateModalOpen && (
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
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#0c1020',
            border: '1px solid rgba(124, 58, 237, 0.4)',
            overflow: 'hidden'
          }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <PlusCircle size={20} color="#c084fc" />
                <h2 style={{ fontSize: '1.3rem', margin: 0 }}>
                  {isEditing ? 'Edit Hackathon Event' : 'Create New Hackathon Event'}
                </h2>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="btn btn-secondary btn-sm" style={{ padding: '6px' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Autonomous Agent Hack 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '10px 14px', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Tagline / Catchphrase
                </label>
                <input
                  type="text"
                  placeholder="e.g., Build and dogfood self-healing code agents"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '10px 14px', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Prize Pool
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., $50,000 USD"
                    value={formData.prizePool}
                    onChange={(e) => setFormData({ ...formData, prizePool: e.target.value })}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '10px 14px', color: '#fff' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{ width: '100%', background: '#0f1424', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '10px 14px', color: '#fff' }}
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="active">Active</option>
                    <option value="completed">Concluded</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Format
                  </label>
                  <select
                    value={formData.format}
                    onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                    style={{ width: '100%', background: '#0f1424', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '10px 14px', color: '#fff' }}
                  >
                    <option value="Hybrid">Hybrid</option>
                    <option value="Online">Online</option>
                    <option value="In-Person">In-Person</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '10px 14px', color: '#fff' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Tracks (Comma Separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g., Code Gen, AI Safety, Decentralized Systems"
                  value={formData.tracksInput}
                  onChange={(e) => setFormData({ ...formData, tracksInput: e.target.value })}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '10px 14px', color: '#fff' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Explain the hackathon challenge, rules, and rubric criteria..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '10px 14px', color: '#fff' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn btn-secondary btn-sm">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {isEditing ? 'Save Changes' : 'Publish Hackathon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedEventModal && !isCreateModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 90,
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
            border: '1px solid rgba(124, 58, 237, 0.3)',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                {getStatusBadge(selectedEventModal.status)}
                <h2 style={{ fontSize: '1.4rem', marginTop: '8px' }}>{selectedEventModal.title}</h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{selectedEventModal.tagline}</p>
              </div>
              <button onClick={() => setSelectedEventModal(null)} className="btn btn-secondary btn-sm" style={{ padding: '6px' }}>
                <X size={16} />
              </button>
            </div>

            <p style={{ color: '#cbd5e1', fontSize: '0.9rem', marginBottom: '16px', lineHeight: 1.6 }}>
              {selectedEventModal.description}
            </p>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => openEditModal(selectedEventModal)}>
                <Edit3 size={14} />
                <span>Edit Event</span>
              </button>
              <button
                className={`btn btn-sm ${selectedEventModal.isRegistered ? 'btn-success' : 'btn-primary'}`}
                onClick={() => {
                  toggleEventRegistration(selectedEventModal.id);
                  setSelectedEventModal((prev) => ({ ...prev, isRegistered: !prev.isRegistered }));
                }}
              >
                {selectedEventModal.isRegistered ? 'Registered' : 'Register Now'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
