/**
 * DOGFOOD 2026 - Centralized API Contracts Specification
 * 
 * Defines standard RESTful endpoints, request payloads, response structures,
 * query parameters, and HTTP status codes for the Hackathon Platform.
 */

export const API_CONTRACTS = {
  version: 'v1',
  baseUrl: '/api/v1',
  modules: {
    // ==========================================
    // 1. EVENTS API CONTRACT
    // ==========================================
    events: {
      title: 'Events Service',
      description: 'Lifecycle management for hackathons, workshops, and sprint competitions.',
      endpoints: [
        {
          name: 'List Events',
          method: 'GET',
          path: '/api/v1/events',
          queryParams: {
            status: { type: 'string', enum: ['all', 'upcoming', 'active', 'completed'], default: 'all' },
            track: { type: 'string', description: 'Filter by specific track or discipline' },
            search: { type: 'string', description: 'Search term against title, tags, or description' },
            page: { type: 'number', default: 1 },
            limit: { type: 'number', default: 20 }
          },
          responseBody: {
            success: true,
            count: 4,
            data: [
              {
                id: 'evt-dogfood-2026',
                title: 'DOGFOOD 2026: Global Developer Hackathon',
                tagline: 'Build, dogfood, and ship next-gen developer tools.',
                status: 'active',
                startDate: '2026-10-01T09:00:00Z',
                endDate: '2026-10-04T18:00:00Z',
                prizePool: '$75,000 USD',
                participantCount: 482,
                tracks: [{ id: 'trk-1', name: 'Autonomous Coding Agents', prize: '$25,000' }],
                organizer: { id: 'org-1', name: 'Google DeepMind', verified: true }
              }
            ]
          }
        },
        {
          name: 'Get Event Details',
          method: 'GET',
          path: '/api/v1/events/:id',
          urlParams: { id: 'Event UUID / Slug' },
          responseBody: {
            success: true,
            data: {
              id: 'evt-dogfood-2026',
              title: 'DOGFOOD 2026: Global Developer Hackathon',
              description: 'Full comprehensive event description, rules, and guidelines.',
              tracks: [],
              rubrics: [],
              schedule: [],
              isRegistered: false
            }
          }
        },
        {
          name: 'Register for Event',
          method: 'POST',
          path: '/api/v1/events/:id/register',
          requestHeaders: { 'Authorization': 'Bearer <token>', 'Content-Type': 'application/json' },
          requestBody: {
            teamName: 'CausalNodes (optional, blank if solo)',
            trackId: 'trk-1',
            discordHandle: 'alex_dev#0001',
            acceptRules: true
          },
          responseBody: {
            success: true,
            message: 'Successfully registered for DOGFOOD 2026',
            registrationId: 'reg-88219',
            isRegistered: true
          }
        }
      ]
    },

    // ==========================================
    // 2. USERS API CONTRACT
    // ==========================================
    users: {
      title: 'Users & Authentication Service',
      description: 'User profiles, skills matrix, authentication credentials, and participation history.',
      endpoints: [
        {
          name: 'Get Current Authenticated User',
          method: 'GET',
          path: '/api/v1/users/me',
          requestHeaders: { 'Authorization': 'Bearer <jwt_token>' },
          responseBody: {
            success: true,
            data: {
              id: 'usr-101',
              name: 'Alex Rivera',
              email: 'alex.rivera@example.com',
              role: 'participant',
              avatar: 'https://...',
              skills: ['React', 'TypeScript', 'Python'],
              registeredEventIds: ['evt-dogfood-2026']
            }
          }
        },
        {
          name: 'Update User Profile',
          method: 'PUT',
          path: '/api/v1/users/profile',
          requestBody: {
            name: 'Alex Rivera',
            bio: 'Updated bio description',
            skills: ['React', 'Go', 'Rust'],
            github: 'https://github.com/alexrivera'
          },
          responseBody: {
            success: true,
            message: 'Profile updated successfully',
            data: { id: 'usr-101', name: 'Alex Rivera' }
          }
        }
      ]
    },

    // ==========================================
    // 3. JUDGES API CONTRACT
    // ==========================================
    judges: {
      title: 'Judges & Rubrics Service',
      description: 'Judge scoring assignments, criteria weights, and evaluation submissions.',
      endpoints: [
        {
          name: 'List Judges for Event',
          method: 'GET',
          path: '/api/v1/events/:id/judges',
          responseBody: {
            success: true,
            data: [
              {
                id: 'jdg-201',
                name: 'Dr. Elena Rostova',
                role: 'Lead Evaluation Judge',
                organization: 'DeepMind Technologies',
                rubricCriteria: [
                  { id: 'crit-1', name: 'Innovation & Novelty', weight: 0.25 },
                  { id: 'crit-2', name: 'Technical Depth', weight: 0.30 }
                ]
              }
            ]
          }
        },
        {
          name: 'Submit Rubric Evaluation',
          method: 'POST',
          path: '/api/v1/submissions/:id/evaluate',
          requestHeaders: { 'Authorization': 'Bearer <judge_token>' },
          requestBody: {
            judgeId: 'jdg-201',
            scores: {
              innovation: 9.5,
              technicalDepth: 9.2,
              uiUx: 8.8,
              impact: 9.4
            },
            feedback: 'Exceptional AST time-travel debugging visuals with zero latency.',
            recommendForAward: true
          },
          responseBody: {
            success: true,
            message: 'Score successfully recorded',
            evaluationId: 'eval-9012'
          }
        }
      ]
    },

    // ==========================================
    // 4. SUBMISSIONS API CONTRACT
    // ==========================================
    submissions: {
      title: 'Submissions Service',
      description: 'Project submissions, video demos, code repositories, and team attribution.',
      endpoints: [
        {
          name: 'List Event Submissions',
          method: 'GET',
          path: '/api/v1/events/:id/submissions',
          queryParams: {
            track: 'trk-1 (optional)',
            sort: 'votes | score | recent',
            status: 'approved | pending'
          },
          responseBody: {
            success: true,
            count: 3,
            data: [
              {
                id: 'sub-501',
                title: 'AgentTrace: Multi-Agent Causal Observability',
                teamName: 'CausalNodes',
                repoUrl: 'https://github.com/causalnodes/agenttrace',
                demoUrl: 'https://agenttrace.live',
                votesCount: 342,
                judgeScoreAverage: 9.35
              }
            ]
          }
        },
        {
          name: 'Create Project Submission',
          method: 'POST',
          path: '/api/v1/events/:id/submissions',
          requestBody: {
            title: 'AgentTrace',
            tagline: 'Multi-agent visual causal inspector',
            trackId: 'trk-1',
            teamName: 'CausalNodes',
            repoUrl: 'https://github.com/...',
            demoUrl: 'https://...',
            videoUrl: 'https://youtube.com/...',
            description: 'Comprehensive markdown description of tech stack and design decisions.'
          },
          responseBody: {
            success: true,
            message: 'Project submitted successfully for judging',
            submissionId: 'sub-501'
          }
        }
      ]
    },

    // ==========================================
    // 5. COMMUNITY VOTING API CONTRACT
    // ==========================================
    communityVoting: {
      title: 'Community Voting & Leaderboard Service',
      description: 'Public upvoting, anti-sybil vote verification, and real-time popularity leaderboard.',
      endpoints: [
        {
          name: 'Get Voting Status & Rules',
          method: 'GET',
          path: '/api/v1/events/:id/voting',
          responseBody: {
            success: true,
            data: {
              eventId: 'evt-dogfood-2026',
              isVotingOpen: true,
              closesAt: '2026-10-05T23:59:59Z',
              totalVotesCast: 1420,
              userRemainingVotes: 2,
              userVotedSubmissionIds: ['sub-502']
            }
          }
        },
        {
          name: 'Cast Community Vote',
          method: 'POST',
          path: '/api/v1/submissions/:id/vote',
          requestHeaders: { 'Authorization': 'Bearer <user_token>' },
          responseBody: {
            success: true,
            message: 'Vote cast successfully',
            submissionId: 'sub-501',
            updatedVoteCount: 343,
            hasVoted: true
          }
        },
        {
          name: 'Retract Vote',
          method: 'DELETE',
          path: '/api/v1/submissions/:id/vote',
          responseBody: {
            success: true,
            message: 'Vote rescinded',
            submissionId: 'sub-501',
            updatedVoteCount: 342,
            hasVoted: false
          }
        },
        {
          name: 'Get Live Leaderboard',
          method: 'GET',
          path: '/api/v1/events/:id/leaderboard',
          queryParams: {
            category: 'community | judges | overall'
          },
          responseBody: {
            success: true,
            lastUpdated: '2026-09-27T21:55:00Z',
            rankings: [
              { rank: 1, submissionId: 'sub-501', title: 'AgentTrace', votes: 342, score: 9.35 }
            ]
          }
        }
      ]
    }
  }
};
