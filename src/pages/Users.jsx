import React, { useState, useEffect, useMemo } from 'react';
import {
  Users as UsersIcon,
  Search,
  Filter,
  X,
  Mail,
  Copy,
  Check,
  Shield,
  Award,
  Sparkles,
  ExternalLink,
  RefreshCw,
  UserCheck,
  UserPlus
} from 'lucide-react';
import api from '../services/api.js';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // UI state
  const [copiedEmail, setCopiedEmail] = useState(null);
  const [selectedUserModal, setSelectedUserModal] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.users.getAll({
        role: roleFilter,
        status: statusFilter,
        search: searchTerm
      });
      if (res && res.success) {
        setUsers(res.data || []);
      } else {
        throw new Error(res?.message || 'Failed to fetch users.');
      }
    } catch (err) {
      console.error('[Users.jsx] Error loading users:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, statusFilter]);

  // Real-time instant filtering
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Role filter
      if (roleFilter !== 'all' && user.role.toLowerCase() !== roleFilter.toLowerCase()) {
        return false;
      }
      // Status filter
      if (statusFilter !== 'all' && user.status?.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchesName = user.name?.toLowerCase().includes(q);
        const matchesEmail = user.email?.toLowerCase().includes(q);
        const matchesTitle = user.title?.toLowerCase().includes(q);
        const matchesOrg = user.organization?.toLowerCase().includes(q);
        const matchesSkills = user.skills?.some((s) => s.toLowerCase().includes(q));
        return matchesName || matchesEmail || matchesTitle || matchesOrg || matchesSkills;
      }
      return true;
    });
  }, [users, roleFilter, statusFilter, searchTerm]);

  const handleCopyEmail = (email) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}>Admin</span>;
      case 'organizer':
        return <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' }}>Organizer</span>;
      case 'judge':
        return <span className="badge" style={{ background: 'rgba(124, 58, 237, 0.15)', color: '#c084fc', border: '1px solid rgba(124, 58, 237, 0.3)' }}>Judge</span>;
      case 'participant':
      default:
        return <span className="badge" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#38bdf8', border: '1px solid rgba(6, 182, 212, 0.3)' }}>Participant</span>;
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px 80px' }}>
      
      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: 'var(--radius-pill)', background: 'rgba(6, 182, 212, 0.12)', border: '1px solid rgba(6, 182, 212, 0.3)', marginBottom: '14px' }}>
          <UsersIcon size={16} color="#38bdf8" />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#38bdf8', letterSpacing: '0.04em' }}>
            COMMUNITY & ACCESS CONTROL
          </span>
        </div>
        <h1 style={{ fontSize: '2.5rem', lineHeight: 1.15, marginBottom: '8px', background: 'linear-gradient(135deg, #ffffff 40%, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Users Directory & Admin Table
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem', maxWidth: '720px' }}>
          Search and manage registered developers, judges, team leads, and platform administrators.
        </p>
      </div>

      {/* =========================================================================
          SEARCH & DROPDOWN FILTER TOOLBAR (Above Users Table)
         ========================================================================= */}
      <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '14px', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Real-time Search Input */}
        <div style={{ position: 'relative', flex: 1, minWidth: '280px', maxWidth: '420px' }}>
          <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Search users by name, email, skills, role..."
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
          
          {/* Role Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
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
              <option value="all">All Roles</option>
              <option value="participant">Participant</option>
              <option value="judge">Judge</option>
              <option value="organizer">Organizer</option>
              <option value="admin">Admin</option>
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
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="invited">Invited</option>
            </select>
          </div>

          {/* Reset Filters */}
          {(searchTerm || roleFilter !== 'all' || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setRoleFilter('all');
                setStatusFilter('all');
              }}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.78rem' }}
            >
              <X size={12} />
              <span>Reset</span>
            </button>
          )}

          {/* Refresh Button */}
          <button
            onClick={fetchUsers}
            className="btn btn-secondary btn-sm"
            disabled={loading}
            title="Refresh users"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Row Count Badge & Active Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', fontSize: '0.825rem', color: 'var(--text-dim)' }}>
        <div>
          Showing <strong style={{ color: '#f1f5f9' }}>{filteredUsers.length}</strong> of <strong style={{ color: '#f1f5f9' }}>{users.length}</strong> users
          {searchTerm && <span> matching "<span style={{ color: '#38bdf8' }}>{searchTerm}</span>"</span>}
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {roleFilter !== 'all' && (
            <span className="badge" style={{ background: 'rgba(124, 58, 237, 0.2)', color: '#c084fc' }}>
              Role: {roleFilter}
            </span>
          )}
          {statusFilter !== 'all' && (
            <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}>
              Status: {statusFilter}
            </span>
          )}
        </div>
      </div>

      {/* =========================================================================
          LOADING STATE
         ========================================================================= */}
      {loading && (
        <div className="glass-panel" style={{ padding: '24px' }}>
          {[1, 2, 3, 4].map((n) => (
            <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <div className="skeleton" style={{ width: '42px', height: '42px', borderRadius: '50%' }} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="skeleton" style={{ height: '18px', width: '30%' }} />
                <div className="skeleton" style={{ height: '14px', width: '45%' }} />
              </div>
              <div className="skeleton" style={{ height: '24px', width: '80px' }} />
              <div className="skeleton" style={{ height: '20px', width: '120px' }} />
              <div className="skeleton" style={{ height: '32px', width: '90px' }} />
            </div>
          ))}
        </div>
      )}

      {/* =========================================================================
          EMPTY SEARCH STATE
         ========================================================================= */}
      {!loading && !error && filteredUsers.length === 0 && (
        <div className="glass-panel" style={{ padding: '60px 24px', textAlign: 'center' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(255, 255, 255, 0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: 'var(--text-dim)' }}>
            <Search size={24} />
          </div>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>No Users Match Your Query</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
            No user records matched "{searchTerm}". Try clearing or broadening your search criteria.
          </p>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setSearchTerm('');
              setRoleFilter('all');
              setStatusFilter('all');
            }}
          >
            Clear Search & Filters
          </button>
        </div>
      )}

      {/* =========================================================================
          ADMIN USERS TABLE
         ========================================================================= */}
      {!loading && !error && filteredUsers.length > 0 && (
        <div className="glass-panel" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: 'rgba(255, 255, 255, 0.03)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>User Profile</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>Email Address</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>Role</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>Skills / Expertise</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>Events</th>
                  <th style={{ padding: '14px 16px', fontWeight: 600 }}>Status</th>
                  <th style={{ padding: '14px 20px', textAlign: 'right', fontWeight: 600 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => {
                  const isCopied = copiedEmail === user.email;

                  return (
                    <tr
                      key={user.id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background-color 0.15s ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.02)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      {/* User Profile */}
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <img
                            src={user.avatar}
                            alt={user.name}
                            style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ fontWeight: 600, color: '#f1f5f9' }}>{user.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.title}</div>
                          </div>
                        </div>
                      </td>

                      {/* Email Address with Copy */}
                      <td style={{ padding: '16px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#cbd5e1' }}>
                            {user.email}
                          </span>
                          <button
                            onClick={() => handleCopyEmail(user.email)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '3px 6px' }}
                            title="Copy email"
                          >
                            {isCopied ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                          </button>
                        </div>
                      </td>

                      {/* Role */}
                      <td style={{ padding: '16px 16px' }}>
                        {getRoleBadge(user.role)}
                      </td>

                      {/* Skills */}
                      <td style={{ padding: '16px 16px' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '240px' }}>
                          {user.skills?.slice(0, 3).map((skill, idx) => (
                            <span key={idx} style={{
                              background: 'rgba(255, 255, 255, 0.04)',
                              border: '1px solid var(--border-subtle)',
                              padding: '2px 7px',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              color: 'var(--text-muted)'
                            }}>
                              {skill}
                            </span>
                          ))}
                          {user.skills?.length > 3 && (
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', padding: '2px 4px' }}>
                              +{user.skills.length - 3}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Registered Events */}
                      <td style={{ padding: '16px 16px', color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                        <strong>{user.registeredEventIds?.length || 0}</strong> events
                      </td>

                      {/* Status */}
                      <td style={{ padding: '16px 16px' }}>
                        <span className="badge" style={{
                          background: user.status === 'active' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: user.status === 'active' ? '#34d399' : '#fbbf24',
                          border: `1px solid ${user.status === 'active' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                        }}>
                          {user.status === 'active' ? '● Active' : '● Invited'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                          onClick={() => setSelectedUserModal(user)}
                        >
                          Profile
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {selectedUserModal && (
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
            maxWidth: '560px',
            backgroundColor: '#0c1020',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            padding: '24px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <img
                  src={selectedUserModal.avatar}
                  alt={selectedUserModal.name}
                  style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <h3 style={{ fontSize: '1.25rem', margin: 0 }}>{selectedUserModal.name}</h3>
                  <span style={{ fontSize: '0.85rem', color: '#06b6d4' }}>{selectedUserModal.title}</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserModal(null)}
                className="btn btn-secondary btn-sm"
                style={{ padding: '6px', borderRadius: '50%' }}
              >
                <X size={16} />
              </button>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px', lineHeight: 1.5 }}>
              {selectedUserModal.bio}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-muted)', background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
              <div><strong>Email:</strong> {selectedUserModal.email}</div>
              <div><strong>Role:</strong> {selectedUserModal.role}</div>
              {selectedUserModal.github && (
                <div><strong>GitHub:</strong> <a href={selectedUserModal.github} target="_blank" rel="noreferrer" style={{ color: '#38bdf8' }}>{selectedUserModal.github}</a></div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setSelectedUserModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
