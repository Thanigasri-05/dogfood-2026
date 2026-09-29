/**
 * Centralized API Service Layer for DOGFOOD 2026 Platform
 * 
 * Features:
 * 1. Configurable Base URL via environment variables (VITE_API_URL) or runtime setter.
 * 2. Automatic Mock Fallback support: Falls back to realistic mock responses when the backend
 *    is unreachable, or runs entirely in mock mode when VITE_USE_MOCK is enabled.
 * 3. Network delay & simulated error toggles for rigorous frontend testing (loading skeletons & retry states).
 * 4. Structured endpoints for Events, Users, Judges, Submissions, and Community Voting.
 */

import {
  MOCK_EVENTS,
  MOCK_USERS,
  MOCK_JUDGES,
  MOCK_SUBMISSIONS,
  MOCK_COMMUNITY_VOTING
} from './mockData.js';
import { API_CONTRACTS } from './apiContracts.js';

// Deep clone helper to maintain mutable state in mock session
const clone = (obj) => JSON.parse(JSON.stringify(obj));

class ApiService {
  constructor() {
    // Configurable base URL (reads from Vite env or defaults to local backend)
    this.baseUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) || 'http://localhost:5000/api/v1';
    
    // Mock mode configuration
    const envMock = typeof import.meta !== 'undefined' && import.meta.env?.VITE_USE_MOCK;
    this.useMock = envMock !== undefined ? envMock === 'true' || envMock === true : true; // Default to true if not specified
    this.autoFallbackOnNetworkError = true;
    
    // Development / Demo flags
    this.simulatedDelayMs = 600;
    this.simulatedError = false;
    this.lastFallbackOccurred = false;
    this.authToken = null;

    // In-memory mock databases for state persistence across actions
    this._mockEvents = clone(MOCK_EVENTS);
    this._mockUsers = clone(MOCK_USERS);
    this._mockJudges = clone(MOCK_JUDGES);
    this._mockSubmissions = clone(MOCK_SUBMISSIONS);
    this._mockVoting = clone(MOCK_COMMUNITY_VOTING);

    // Event listeners for config changes
    this._listeners = new Set();
  }

  // =========================================================================
  // Configuration & Utilities
  // =========================================================================

  setBaseUrl(url) {
    this.baseUrl = url.replace(/\/+$/, '');
    this._notifyListeners();
  }

  getBaseUrl() {
    return this.baseUrl;
  }

  setMockMode(enabled) {
    this.useMock = Boolean(enabled);
    this._notifyListeners();
  }

  isMockMode() {
    return this.useMock;
  }

  setSimulatedDelay(ms) {
    this.simulatedDelayMs = Number(ms);
  }

  setSimulateError(enable) {
    this.simulatedError = Boolean(enable);
    this._notifyListeners();
  }

  setAuthToken(token) {
    this.authToken = token;
  }

  onConfigChange(callback) {
    this._listeners.add(callback);
    return () => this._listeners.delete(callback);
  }

  _notifyListeners() {
    this._listeners.forEach((fn) => {
      try {
        fn({
          baseUrl: this.baseUrl,
          useMock: this.useMock,
          simulatedError: this.simulatedError,
          lastFallbackOccurred: this.lastFallbackOccurred
        });
      } catch (e) {
        console.error('Error notifying API listener:', e);
      }
    });
  }

  async _delay(ms = this.simulatedDelayMs) {
    if (ms <= 0) return;
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // =========================================================================
  // Central Request Handler
  // =========================================================================

  /**
   * Dispatches an HTTP request or seamlessly falls back to mock handler
   */
  async request({ endpoint, method = 'GET', body = null, params = {}, mockHandler }) {
    // 1. Check for intentional test error simulation
    if (this.simulatedError) {
      await this._delay(300);
      throw new Error('Simulated API Error: Service is temporarily unavailable (503 Service Unavailable).');
    }

    // 2. Direct Mock Mode Execution
    if (this.useMock) {
      await this._delay();
      this.lastFallbackOccurred = false;
      if (typeof mockHandler === 'function') {
        const result = await mockHandler();
        return {
          ...result,
          _meta: { source: 'mock', latency: this.simulatedDelayMs }
        };
      }
      throw new Error(`No mock handler configured for endpoint: ${endpoint}`);
    }

    // 3. Real Backend API Execution
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, value);
      }
    });
    const queryString = query.toString() ? `?${query.toString()}` : '';
    const fullUrl = `${this.baseUrl}${endpoint}${queryString}`;

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    try {
      const response = await fetch(fullUrl, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Request Failed: ${response.status} ${response.statusText}`);
      }

      this.lastFallbackOccurred = false;
      const data = await response.json();
      return {
        ...data,
        _meta: { source: 'live', status: response.status }
      };
    } catch (networkError) {
      console.warn(`[API Client] Real backend request to ${fullUrl} failed: ${networkError.message}`);

      // 4. Graceful Automatic Mock Fallback
      if (this.autoFallbackOnNetworkError && typeof mockHandler === 'function') {
        console.warn(`[API Client] Automatically falling back to local mock data for ${endpoint}`);
        this.lastFallbackOccurred = true;
        this._notifyListeners();
        await this._delay(200);
        const result = await mockHandler();
        return {
          ...result,
          _meta: {
            source: 'mock_fallback',
            reason: networkError.message,
            targetUrl: fullUrl
          }
        };
      }

      throw networkError;
    }
  }

  // =========================================================================
  // 1. EVENTS ENDPOINTS
  // =========================================================================

  events = {
    /**
     * Get list of events with optional filtering
     * @param {Object} [params] - { status, track, search, page, limit }
     */
    getAll: async (params = {}) => {
      return this.request({
        endpoint: '/events',
        method: 'GET',
        params,
        mockHandler: () => {
          let list = [...this._mockEvents];

          // Filter by status
          if (params.status && params.status !== 'all') {
            list = list.filter((e) => e.status.toLowerCase() === params.status.toLowerCase());
          }

          // Filter by track
          if (params.track && params.track !== 'all') {
            list = list.filter((e) =>
              e.tracks.some((t) => t.name.toLowerCase().includes(params.track.toLowerCase()))
            );
          }

          // Search term
          if (params.search) {
            const term = params.search.toLowerCase();
            list = list.filter(
              (e) =>
                e.title.toLowerCase().includes(term) ||
                e.tagline.toLowerCase().includes(term) ||
                e.description.toLowerCase().includes(term) ||
                e.tags.some((tag) => tag.toLowerCase().includes(term))
            );
          }

          return {
            success: true,
            count: list.length,
            data: list
          };
        }
      });
    },

    /**
     * Get single event by ID
     */
    getById: async (id) => {
      return this.request({
        endpoint: `/events/${id}`,
        method: 'GET',
        mockHandler: () => {
          const event = this._mockEvents.find((e) => e.id === id);
          if (!event) {
            throw new Error(`Event with id "${id}" not found.`);
          }
          return { success: true, data: event };
        }
      });
    },

    /**
     * Register current user for an event
     */
    register: async (id, payload = {}) => {
      return this.request({
        endpoint: `/events/${id}/register`,
        method: 'POST',
        body: payload,
        mockHandler: () => {
          const event = this._mockEvents.find((e) => e.id === id);
          if (!event) throw new Error(`Event ${id} not found.`);
          
          if (!event.isRegistered) {
            event.isRegistered = true;
            event.participantCount += 1;
          }

          return {
            success: true,
            message: `Successfully registered for ${event.title}!`,
            data: { eventId: id, isRegistered: true, participantCount: event.participantCount }
          };
        }
      });
    },

    /**
     * Cancel registration for an event
     */
    unregister: async (id) => {
      return this.request({
        endpoint: `/events/${id}/unregister`,
        method: 'POST',
        mockHandler: () => {
          const event = this._mockEvents.find((e) => e.id === id);
          if (!event) throw new Error(`Event ${id} not found.`);

          if (event.isRegistered) {
            event.isRegistered = false;
            event.participantCount = Math.max(0, event.participantCount - 1);
          }

          return {
            success: true,
            message: `Registration cancelled for ${event.title}.`,
            data: { eventId: id, isRegistered: false, participantCount: event.participantCount }
          };
        }
      });
    }
  };

  // =========================================================================
  // 2. USERS ENDPOINTS
  // =========================================================================

  users = {
    /**
     * Get all users with optional search, role, and status filters
     */
    getAll: async (params = {}) => {
      return this.request({
        endpoint: '/users',
        method: 'GET',
        params,
        mockHandler: () => {
          let list = [...this._mockUsers];

          if (params.role && params.role !== 'all') {
            list = list.filter((u) => u.role.toLowerCase() === params.role.toLowerCase());
          }

          if (params.status && params.status !== 'all') {
            list = list.filter((u) => u.status?.toLowerCase() === params.status.toLowerCase());
          }

          if (params.search) {
            const q = params.search.toLowerCase();
            list = list.filter(
              (u) =>
                u.name.toLowerCase().includes(q) ||
                u.email.toLowerCase().includes(q) ||
                u.title?.toLowerCase().includes(q) ||
                u.skills?.some((s) => s.toLowerCase().includes(q))
            );
          }

          return { success: true, count: list.length, data: list };
        }
      });
    },

    /**
     * Get current user profile
     */
    getCurrentUser: async () => {
      return this.request({
        endpoint: '/users/me',
        method: 'GET',
        mockHandler: () => {
          return { success: true, data: this._mockUsers[0] };
        }
      });
    },

    /**
     * Get user by ID
     */
    getById: async (id) => {
      return this.request({
        endpoint: `/users/${id}`,
        method: 'GET',
        mockHandler: () => {
          const user = this._mockUsers.find((u) => u.id === id);
          if (!user) throw new Error(`User ${id} not found.`);
          return { success: true, data: user };
        }
      });
    },

    /**
     * Update current user profile
     */
    updateProfile: async (data) => {
      return this.request({
        endpoint: '/users/profile',
        method: 'PUT',
        body: data,
        mockHandler: () => {
          const user = this._mockUsers[0];
          Object.assign(user, data);
          return { success: true, message: 'Profile updated successfully', data: user };
        }
      });
    }
  };

  // =========================================================================
  // 3. JUDGES ENDPOINTS
  // =========================================================================

  judges = {
    /**
     * Get all judges across all events with search and organization filter
     */
    getAll: async (params = {}) => {
      return this.request({
        endpoint: '/judges',
        method: 'GET',
        params,
        mockHandler: () => {
          let list = [...this._mockJudges];

          if (params.organization && params.organization !== 'all') {
            list = list.filter((j) =>
              j.organization.toLowerCase().includes(params.organization.toLowerCase())
            );
          }

          if (params.status && params.status !== 'all') {
            list = list.filter((j) => j.status?.toLowerCase() === params.status.toLowerCase());
          }

          if (params.search) {
            const q = params.search.toLowerCase();
            list = list.filter(
              (j) =>
                j.name.toLowerCase().includes(q) ||
                j.email?.toLowerCase().includes(q) ||
                j.organization.toLowerCase().includes(q) ||
                j.role.toLowerCase().includes(q) ||
                j.assignedEvents?.some((e) => e.toLowerCase().includes(q))
            );
          }

          return { success: true, count: list.length, data: list };
        }
      });
    },

    /**
     * Get assigned judges for an event
     */
    getByEvent: async (eventId) => {
      return this.request({
        endpoint: `/events/${eventId}/judges`,
        method: 'GET',
        mockHandler: () => {
          const judges = this._mockJudges.filter((j) =>
            j.assignedEventIds.includes(eventId)
          );
          return { success: true, count: judges.length, data: judges };
        }
      });
    },

    /**
     * Submit an evaluation for a submission
     */
    submitEvaluation: async (submissionId, evaluationData) => {
      return this.request({
        endpoint: `/submissions/${submissionId}/evaluate`,
        method: 'POST',
        body: evaluationData,
        mockHandler: () => {
          const submission = this._mockSubmissions.find((s) => s.id === submissionId);
          if (!submission) throw new Error(`Submission ${submissionId} not found.`);

          // Update submission score breakdown in mock
          const { scores, feedback } = evaluationData;
          if (scores) {
            submission.judgeScores = {
              average: 9.4,
              breakdown: scores,
              feedback,
              reviewsCount: (submission.judgeScores?.reviewsCount || 0) + 1
            };
          }

          return {
            success: true,
            message: 'Evaluation and scores recorded successfully.',
            data: { submissionId, judgeScores: submission.judgeScores }
          };
        }
      });
    }
  };

  // =========================================================================
  // 4. SUBMISSIONS ENDPOINTS
  // =========================================================================

  submissions = {
    /**
     * Get all submissions across events with search and filters
     */
    getAll: async (params = {}) => {
      return this.request({
        endpoint: '/submissions',
        method: 'GET',
        params,
        mockHandler: () => {
          let list = [...this._mockSubmissions];

          if (params.eventId && params.eventId !== 'all') {
            list = list.filter((s) => s.eventId === params.eventId);
          }

          if (params.track && params.track !== 'all') {
            list = list.filter((s) => s.track.toLowerCase().includes(params.track.toLowerCase()));
          }

          if (params.status && params.status !== 'all') {
            list = list.filter((s) => s.status?.toLowerCase() === params.status.toLowerCase());
          }

          if (params.search) {
            const q = params.search.toLowerCase();
            list = list.filter(
              (s) =>
                s.title.toLowerCase().includes(q) ||
                s.tagline.toLowerCase().includes(q) ||
                s.teamName.toLowerCase().includes(q) ||
                s.description?.toLowerCase().includes(q) ||
                s.members?.some((m) => m.name.toLowerCase().includes(q))
            );
          }

          if (params.sort === 'votes') {
            list.sort((a, b) => b.votesCount - a.votesCount);
          } else if (params.sort === 'score') {
            list.sort((a, b) => (b.judgeScores?.average || 0) - (a.judgeScores?.average || 0));
          }

          return { success: true, count: list.length, data: list };
        }
      });
    },

    /**
     * Get submissions for an event
     */
    getByEvent: async (eventId, params = {}) => {
      return this.request({
        endpoint: `/events/${eventId}/submissions`,
        method: 'GET',
        params,
        mockHandler: () => {
          let list = this._mockSubmissions.filter((s) => s.eventId === eventId);
          if (params.track) {
            list = list.filter((s) => s.track.toLowerCase().includes(params.track.toLowerCase()));
          }
          if (params.sort === 'votes') {
            list.sort((a, b) => b.votesCount - a.votesCount);
          } else if (params.sort === 'score') {
            list.sort((a, b) => (b.judgeScores?.average || 0) - (a.judgeScores?.average || 0));
          }
          return { success: true, count: list.length, data: list };
        }
      });
    },

    /**
     * Get single submission
     */
    getById: async (id) => {
      return this.request({
        endpoint: `/submissions/${id}`,
        method: 'GET',
        mockHandler: () => {
          const sub = this._mockSubmissions.find((s) => s.id === id);
          if (!sub) throw new Error(`Submission ${id} not found.`);
          return { success: true, data: sub };
        }
      });
    },

    /**
     * Create project submission
     */
    create: async (eventId, payload) => {
      return this.request({
        endpoint: `/events/${eventId}/submissions`,
        method: 'POST',
        body: payload,
        mockHandler: () => {
          const newSub = {
            id: `sub-${Date.now().toString().slice(-4)}`,
            eventId,
            title: payload.title,
            tagline: payload.tagline || '',
            track: payload.track || 'General',
            teamName: payload.teamName || 'Solo Project',
            teamLeader: 'usr-101',
            members: [{ id: 'usr-101', name: 'Alex Rivera', role: 'Author' }],
            repoUrl: payload.repoUrl,
            demoUrl: payload.demoUrl,
            description: payload.description,
            thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
            submittedAt: new Date().toISOString(),
            status: 'approved',
            votesCount: 1,
            hasVoted: true
          };

          this._mockSubmissions.unshift(newSub);
          return { success: true, message: 'Project submitted successfully!', data: newSub };
        }
      });
    }
  };

  // =========================================================================
  // 5. COMMUNITY VOTING ENDPOINTS
  // =========================================================================

  voting = {
    /**
     * Get voting configuration and status for an event
     */
    getStatus: async (eventId) => {
      return this.request({
        endpoint: `/events/${eventId}/voting`,
        method: 'GET',
        mockHandler: () => {
          return { success: true, data: this._mockVoting };
        }
      });
    },

    /**
     * Cast community vote for a submission
     */
    castVote: async (submissionId) => {
      return this.request({
        endpoint: `/submissions/${submissionId}/vote`,
        method: 'POST',
        mockHandler: () => {
          const sub = this._mockSubmissions.find((s) => s.id === submissionId);
          if (!sub) throw new Error(`Submission ${submissionId} not found.`);

          if (!sub.hasVoted) {
            sub.votesCount += 1;
            sub.hasVoted = true;
            if (!this._mockVoting.userVotedSubmissionIds.includes(submissionId)) {
              this._mockVoting.userVotedSubmissionIds.push(submissionId);
            }
            this._mockVoting.totalVotesCast += 1;
          }

          return {
            success: true,
            message: 'Vote recorded!',
            data: {
              submissionId,
              votesCount: sub.votesCount,
              hasVoted: true,
              userVotedSubmissionIds: this._mockVoting.userVotedSubmissionIds
            }
          };
        }
      });
    },

    /**
     * Retract a community vote
     */
    retractVote: async (submissionId) => {
      return this.request({
        endpoint: `/submissions/${submissionId}/vote`,
        method: 'DELETE',
        mockHandler: () => {
          const sub = this._mockSubmissions.find((s) => s.id === submissionId);
          if (!sub) throw new Error(`Submission ${submissionId} not found.`);

          if (sub.hasVoted) {
            sub.votesCount = Math.max(0, sub.votesCount - 1);
            sub.hasVoted = false;
            this._mockVoting.userVotedSubmissionIds = this._mockVoting.userVotedSubmissionIds.filter(
              (id) => id !== submissionId
            );
            this._mockVoting.totalVotesCast = Math.max(0, this._mockVoting.totalVotesCast - 1);
          }

          return {
            success: true,
            message: 'Vote retracted.',
            data: {
              submissionId,
              votesCount: sub.votesCount,
              hasVoted: false,
              userVotedSubmissionIds: this._mockVoting.userVotedSubmissionIds
            }
          };
        }
      });
    },

    /**
     * Get live ranking leaderboard
     */
    getLeaderboard: async (eventId) => {
      return this.request({
        endpoint: `/events/${eventId}/leaderboard`,
        method: 'GET',
        mockHandler: () => {
          const sorted = [...this._mockSubmissions]
            .filter((s) => s.eventId === eventId)
            .sort((a, b) => b.votesCount - a.votesCount)
            .map((s, idx) => ({
              rank: idx + 1,
              id: s.id,
              title: s.title,
              teamName: s.teamName,
              track: s.track,
              votesCount: s.votesCount,
              judgeScore: s.judgeScores?.average || null
            }));

          return {
            success: true,
            lastUpdated: new Date().toISOString(),
            data: sorted
          };
        }
      });
    }
  };

  /**
   * Reference to the API Contract schemas for introspection
   */
  contracts = API_CONTRACTS;
}

// Export singleton instance
export const api = new ApiService();
export default api;
