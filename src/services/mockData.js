/**
 * Mock Data for DOGFOOD 2026 Platform
 * Covers Events, Users, Judges, Submissions, and Community Voting.
 */

export const MOCK_EVENTS = [
  {
    id: 'evt-dogfood-2026',
    title: 'DOGFOOD 2026: Global Developer Hackathon',
    tagline: 'Build, dogfood, and ship the next generation of developer tools and autonomous agents.',
    description: 'Join 1,200+ top engineers, researchers, and designers worldwide to construct bleeding-edge developer tools, AI agent ecosystems, and resilient decentralized applications.',
    status: 'active', // 'upcoming' | 'active' | 'completed'
    startDate: '2026-10-01T09:00:00Z',
    endDate: '2026-10-04T18:00:00Z',
    registrationDeadline: '2026-09-30T23:59:59Z',
    prizePool: '$75,000 USD',
    location: 'Hybrid • San Francisco & Virtual',
    format: 'Hybrid',
    participantCount: 482,
    maxParticipants: 1000,
    bannerImage: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
    tracks: [
      { id: 'trk-1', name: 'Autonomous Coding Agents', prize: '$25,000' },
      { id: 'trk-2', name: 'Developer Productivity & DX', prize: '$20,000' },
      { id: 'trk-3', name: 'Web3 & Decentralized Protocols', prize: '$15,000' },
      { id: 'trk-4', name: 'AI Ethics, Security & Trust', prize: '$15,000' }
    ],
    tags: ['AI', 'Agents', 'TypeScript', 'Cloud', 'Developer Tools'],
    organizer: {
      id: 'org-1',
      name: 'Google DeepMind & Antigravity Core',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80',
      verified: true
    },
    isRegistered: false
  },
  {
    id: 'evt-ai-sprint-2026',
    title: 'Cognitive Engine AI Sprint 2026',
    tagline: '48-hour challenge building reasoning engines that integrate with IDEs.',
    description: 'Design context-aware assistants that understand ASTs, test suites, and git histories to execute end-to-end coding workflows with minimal human intervention.',
    status: 'active',
    startDate: '2026-10-12T00:00:00Z',
    endDate: '2026-10-14T23:59:59Z',
    registrationDeadline: '2026-10-11T12:00:00Z',
    prizePool: '$50,000 USD',
    location: '100% Virtual (Global Discord & Stream)',
    format: 'Online',
    participantCount: 840,
    maxParticipants: 1200,
    bannerImage: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80',
    tracks: [
      { id: 'trk-5', name: 'AST & Code Analysis', prize: '$20,000' },
      { id: 'trk-6', name: 'Self-Healing Test Runners', prize: '$15,000' },
      { id: 'trk-7', name: 'Agentic Debuggers', prize: '$15,000' }
    ],
    tags: ['Machine Learning', 'LLMs', 'Compilers', 'Automations'],
    organizer: {
      id: 'org-2',
      name: 'NextGen AI Institute',
      avatar: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=120&q=80',
      verified: true
    },
    isRegistered: true
  },
  {
    id: 'evt-cyber-mesh-2026',
    title: 'ZeroTrust CyberMesh Summit 2026',
    tagline: 'Hardening modern cloud-native architectures against automated threat vectors.',
    description: 'Tackle adversarial AI threats, cryptographically authenticated microservices, and quantum-resistant network protocols.',
    status: 'upcoming',
    startDate: '2026-11-05T09:00:00Z',
    endDate: '2026-11-08T18:00:00Z',
    registrationDeadline: '2026-11-01T23:59:59Z',
    prizePool: '$40,000 USD',
    location: 'Austin, Texas • In-Person',
    format: 'In-Person',
    participantCount: 195,
    maxParticipants: 400,
    bannerImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    tracks: [
      { id: 'trk-8', name: 'Post-Quantum Encryption', prize: '$20,000' },
      { id: 'trk-9', name: 'eBPF Kernel Defense', prize: '$20,000' }
    ],
    tags: ['Cybersecurity', 'Rust', 'eBPF', 'Zero-Trust'],
    organizer: {
      id: 'org-3',
      name: 'Cloud Security Alliance',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80',
      verified: true
    },
    isRegistered: false
  },
  {
    id: 'evt-green-code-2026',
    title: 'EcoCode: Sustainable Compute Hack',
    tagline: 'Minimizing the watt-per-token footprint in large scale distributed computing.',
    description: 'Focus on profiling GPU workloads, carbon-aware scheduling algorithms, and ultra-lightweight client-side inferencing.',
    status: 'upcoming',
    startDate: '2026-11-20T08:00:00Z',
    endDate: '2026-11-22T20:00:00Z',
    registrationDeadline: '2026-11-18T23:59:59Z',
    prizePool: '$30,000 USD',
    location: 'Zurich & Remote Hybrid',
    format: 'Hybrid',
    participantCount: 112,
    maxParticipants: 500,
    bannerImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
    tracks: [
      { id: 'trk-10', name: 'Green AI Model Pruning', prize: '$15,000' },
      { id: 'trk-11', name: 'Energy-Aware Cloud Schedulers', prize: '$15,000' }
    ],
    tags: ['Sustainability', 'Distributed Systems', 'Python', 'GreenTech'],
    organizer: {
      id: 'org-4',
      name: 'Open Climate Foundation',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80',
      verified: false
    },
    isRegistered: false
  },
  {
    id: 'evt-web3-defi-2025',
    title: 'DeFi Frontiers Winter Hackathon',
    tagline: 'Next-gen algorithmic liquidity protocols and intent-based transaction routing.',
    description: 'Explored MEV mitigation, decentralized intent solvers, and account abstraction on Ethereum L2 rollups.',
    status: 'completed',
    startDate: '2025-12-10T09:00:00Z',
    endDate: '2025-12-14T18:00:00Z',
    registrationDeadline: '2025-12-08T23:59:59Z',
    prizePool: '$60,000 USD',
    location: 'Berlin & Online',
    format: 'Hybrid',
    participantCount: 650,
    maxParticipants: 650,
    bannerImage: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80',
    tracks: [
      { id: 'trk-12', name: 'Intent Solvers', prize: '$30,000' },
      { id: 'trk-13', name: 'Account Abstraction SDK', prize: '$30,000' }
    ],
    tags: ['Solidity', 'Ethereum', 'DeFi', 'Cryptography'],
    organizer: {
      id: 'org-5',
      name: 'Web3 Builders Guild',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      verified: true
    },
    isRegistered: false
  }
];

export const MOCK_USERS = [
  {
    id: 'usr-101',
    name: 'Alex Rivera',
    email: 'alex.rivera@example.com',
    role: 'participant', // 'participant' | 'judge' | 'organizer' | 'admin'
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    title: 'Lead Systems Architect',
    bio: 'Specializing in agentic runtime orchestration, multi-threaded worker pools, and React web apps.',
    skills: ['React', 'TypeScript', 'Go', 'Python', 'Docker'],
    github: 'https://github.com/alexrivera',
    portfolio: 'https://alexrivera.dev',
    registeredEventIds: ['evt-dogfood-2026', 'evt-ai-sprint-2026'],
    joinedAt: '2026-08-15T10:30:00Z'
  },
  {
    id: 'usr-102',
    name: 'Siddharth Rao',
    email: 'sid.rao@example.com',
    role: 'participant',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    title: 'Machine Learning Engineer',
    bio: 'Pioneering graph neural networks for causal inference in distributed system tracing.',
    skills: ['PyTorch', 'Rust', 'CUDA', 'Python'],
    github: 'https://github.com/sidrao',
    registeredEventIds: ['evt-dogfood-2026'],
    joinedAt: '2026-08-20T14:15:00Z'
  },
  {
    id: 'usr-103',
    name: 'Maya Lin',
    email: 'maya.lin@speccraft.io',
    role: 'participant',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    title: 'Full Stack & API Engineer',
    bio: 'Building schema synthesizers and real-time type generation engines.',
    skills: ['Node.js', 'GraphQL', 'Next.js', 'TypeScript'],
    github: 'https://github.com/mayalin',
    registeredEventIds: ['evt-dogfood-2026'],
    joinedAt: '2026-09-01T09:00:00Z'
  },
  {
    id: 'usr-104',
    name: 'Tariq Al-Mansoor',
    email: 'tariq.mansoor@cybermesh.org',
    role: 'participant',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    title: 'Security Research Fellow',
    bio: 'Focusing on zero-knowledge execution enclaves and runtime kernel instrumentation.',
    skills: ['Rust', 'eBPF', 'C++', 'Cryptography'],
    github: 'https://github.com/tariq-mansoor',
    registeredEventIds: ['evt-dogfood-2026', 'evt-cyber-mesh-2026'],
    joinedAt: '2026-09-05T11:45:00Z'
  },
  {
    id: 'usr-201',
    name: 'Dr. Elena Rostova',
    email: 'elena.rostova@deepmind.com',
    role: 'judge',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    title: 'Staff Research Scientist',
    organization: 'DeepMind Technologies',
    bio: 'Researcher in emergent reasoning, neurosymbolic AI, and agent evaluation frameworks.',
    skills: ['Deep Learning', 'System Design', 'Evaluation Rubrics'],
    registeredEventIds: ['evt-dogfood-2026'],
    joinedAt: '2026-07-10T08:00:00Z'
  },
  {
    id: 'usr-202',
    name: 'Marcus Sterling',
    email: 'marcus.sterling@devinfra.io',
    role: 'judge',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80',
    title: 'Principal Developer Advocate',
    organization: 'Cloudflare / Vercel Ecosystem',
    bio: 'Author of developer experience benchmarks, serverless runtimes, and distributed edge computing.',
    skills: ['Cloud Architecture', 'Developer Experience', 'Edge Compute'],
    registeredEventIds: ['evt-dogfood-2026'],
    joinedAt: '2026-07-18T16:20:00Z'
  },
  {
    id: 'usr-301',
    name: 'Samantha Wei',
    email: 'samantha.wei@hackathon-core.org',
    role: 'organizer',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    title: 'Global Hackathon Director',
    organization: 'DOGFOOD Operations',
    bio: 'Organizing international hackathons and mentoring 10,000+ developers.',
    skills: ['Operations', 'Community Management', 'Partnerships'],
    registeredEventIds: ['evt-dogfood-2026', 'evt-ai-sprint-2026'],
    joinedAt: '2026-06-01T12:00:00Z'
  },
  {
    id: 'usr-401',
    name: 'Devon Miller',
    email: 'devon.miller@admin.dogfood2026.dev',
    role: 'admin',
    status: 'active',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=200&q=80',
    title: 'Platform Infrastructure Lead',
    organization: 'DOGFOOD Core Team',
    bio: 'Maintaining cluster uptime, real-time leaderboard websocket infrastructure, and database clusters.',
    skills: ['Kubernetes', 'Go', 'PostgreSQL', 'Redis'],
    registeredEventIds: ['evt-dogfood-2026'],
    joinedAt: '2026-05-12T09:30:00Z'
  },
  {
    id: 'usr-105',
    name: 'Chloe Dubois',
    email: 'chloe.dubois@parislabs.fr',
    role: 'participant',
    status: 'invited',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    title: 'UX & Design Systems Engineer',
    bio: 'Crafting high-density accessible UI workflows for mission-critical developer tools.',
    skills: ['Figma', 'React', 'CSS Architecture', 'Accessibility'],
    github: 'https://github.com/chloedubois',
    registeredEventIds: ['evt-green-code-2026'],
    joinedAt: '2026-09-22T13:10:00Z'
  }
];

export const MOCK_JUDGES = [
  {
    id: 'jdg-201',
    userId: 'usr-201',
    name: 'Dr. Elena Rostova',
    email: 'elena.rostova@deepmind.com',
    role: 'Lead Evaluation Judge',
    organization: 'DeepMind Technologies',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80',
    assignedEventIds: ['evt-dogfood-2026', 'evt-ai-sprint-2026'],
    assignedEvents: ['DOGFOOD 2026', 'Cognitive Engine AI Sprint'],
    rubricCriteria: [
      { id: 'crit-1', name: 'Innovation & Novelty', weight: 0.25, maxScore: 10 },
      { id: 'crit-2', name: 'Technical Depth & Architecture', weight: 0.30, maxScore: 10 },
      { id: 'crit-3', name: 'UI / UX Polish & Design System', weight: 0.20, maxScore: 10 },
      { id: 'crit-4', name: 'Real-World Impact & Feasibility', weight: 0.25, maxScore: 10 }
    ],
    evaluationsCompleted: 14,
    evaluationsPending: 6,
    status: 'active'
  },
  {
    id: 'jdg-202',
    userId: 'usr-202',
    name: 'Marcus Sterling',
    email: 'marcus.sterling@devinfra.io',
    role: 'Principal Developer Advocate',
    organization: 'Cloudflare / Vercel Ecosystem',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=200&q=80',
    assignedEventIds: ['evt-dogfood-2026'],
    assignedEvents: ['DOGFOOD 2026'],
    rubricCriteria: [
      { id: 'crit-1', name: 'Innovation & Novelty', weight: 0.25, maxScore: 10 },
      { id: 'crit-2', name: 'Technical Depth & Architecture', weight: 0.30, maxScore: 10 },
      { id: 'crit-3', name: 'UI / UX Polish & Design System', weight: 0.20, maxScore: 10 },
      { id: 'crit-4', name: 'Real-World Impact & Feasibility', weight: 0.25, maxScore: 10 }
    ],
    evaluationsCompleted: 18,
    evaluationsPending: 2,
    status: 'active'
  },
  {
    id: 'jdg-203',
    userId: 'usr-203',
    name: 'Ananya Sharma',
    email: 'ananya.sharma@openclimate.org',
    role: 'Principal Systems Auditor',
    organization: 'Open Climate Foundation',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
    assignedEventIds: ['evt-green-code-2026'],
    assignedEvents: ['EcoCode Sustainability Hack'],
    rubricCriteria: [
      { id: 'crit-1', name: 'Carbon Efficiency & Compute Profiling', weight: 0.40, maxScore: 10 },
      { id: 'crit-2', name: 'Scalability & Cloud Architecture', weight: 0.35, maxScore: 10 },
      { id: 'crit-3', name: 'Open Source Transparency', weight: 0.25, maxScore: 10 }
    ],
    evaluationsCompleted: 9,
    evaluationsPending: 1,
    status: 'active'
  },
  {
    id: 'jdg-204',
    userId: 'usr-204',
    name: 'Julian Bennett',
    email: 'julian.bennett@zerotrust.net',
    role: 'Chief Security Architect',
    organization: 'Cloud Security Alliance',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    assignedEventIds: ['evt-cyber-mesh-2026'],
    assignedEvents: ['ZeroTrust CyberMesh Summit 2026'],
    rubricCriteria: [
      { id: 'crit-1', name: 'Cryptographic Hardening', weight: 0.35, maxScore: 10 },
      { id: 'crit-2', name: 'Adversarial Defense Capability', weight: 0.35, maxScore: 10 },
      { id: 'crit-3', name: 'Code Quality & Test Rigor', weight: 0.30, maxScore: 10 }
    ],
    evaluationsCompleted: 0,
    evaluationsPending: 12,
    status: 'pending'
  }
];

export const MOCK_SUBMISSIONS = [
  {
    id: 'sub-501',
    eventId: 'evt-dogfood-2026',
    title: 'AgentTrace: Multi-Agent Causal Observability',
    tagline: 'Visual time-travel debugger and causal dependency graph for autonomous LLM agents.',
    track: 'Autonomous Coding Agents',
    teamName: 'CausalNodes',
    teamLeader: 'usr-101',
    members: [
      { id: 'usr-101', name: 'Alex Rivera', role: 'Architect' },
      { id: 'usr-102', name: 'Siddharth Rao', role: 'ML Engineer' }
    ],
    repoUrl: 'https://github.com/causalnodes/agenttrace',
    demoUrl: 'https://agenttrace.live',
    videoUrl: 'https://youtube.com/watch?v=agenttrace-demo',
    description: 'AgentTrace intercepts agent prompt-eval cycles, builds real-time AST state transitions, and detects reasoning drift before catastrophic tool calls occur.',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    submittedAt: '2026-10-03T14:20:00Z',
    status: 'approved', // 'pending' | 'approved' | 'rejected'
    votesCount: 342,
    hasVoted: false,
    judgeScores: {
      average: 9.35,
      breakdown: {
        innovation: 9.6,
        technicalDepth: 9.4,
        uiUx: 9.0,
        impact: 9.4
      },
      reviewsCount: 4
    }
  },
  {
    id: 'sub-502',
    eventId: 'evt-dogfood-2026',
    title: 'AutoDoc SpecSynth',
    tagline: 'Autonomous OpenAPI & RPC contract synthesizer inferred directly from git diffs.',
    track: 'Developer Productivity & DX',
    teamName: 'SpecCraft',
    teamLeader: 'usr-103',
    members: [{ id: 'usr-103', name: 'Maya Lin', role: 'Full Stack' }],
    repoUrl: 'https://github.com/speccraft/specsynth',
    demoUrl: 'https://specsynth.dev',
    videoUrl: 'https://youtube.com/watch?v=specsynth',
    description: 'Eliminates backend-frontend drift by automatically validating API contracts against live test payloads on every pull request.',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
    submittedAt: '2026-10-03T16:45:00Z',
    status: 'approved',
    votesCount: 289,
    hasVoted: true,
    judgeScores: {
      average: 8.95,
      breakdown: {
        innovation: 8.8,
        technicalDepth: 9.1,
        uiUx: 8.7,
        impact: 9.2
      },
      reviewsCount: 3
    }
  },
  {
    id: 'sub-503',
    eventId: 'evt-dogfood-2026',
    title: 'GuardMesh: Zero-Knowledge Code Attestation',
    tagline: 'Cryptographic proof that your AI-generated code never left sandboxed hardware enclaves.',
    track: 'AI Ethics, Security & Trust',
    teamName: 'EnclaveZero',
    teamLeader: 'usr-104',
    members: [{ id: 'usr-104', name: 'Tariq Al-Mansoor', role: 'Security' }],
    repoUrl: 'https://github.com/enclavezero/guardmesh',
    demoUrl: 'https://guardmesh.security',
    videoUrl: 'https://youtube.com/watch?v=guardmesh',
    description: 'Enforces compliance and IP protection for enterprise LLM development environments.',
    thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80',
    submittedAt: '2026-10-03T18:10:00Z',
    status: 'approved',
    votesCount: 215,
    hasVoted: false,
    judgeScores: {
      average: 9.10,
      breakdown: {
        innovation: 9.4,
        technicalDepth: 9.5,
        uiUx: 8.2,
        impact: 9.3
      },
      reviewsCount: 4
    }
  }
];

export const MOCK_COMMUNITY_VOTING = {
  eventId: 'evt-dogfood-2026',
  isVotingOpen: true,
  closesAt: '2026-10-05T23:59:59Z',
  totalVotesCast: 1420,
  maxVotesPerUser: 3,
  userVotedSubmissionIds: ['sub-502'],
  rules: 'Each authenticated community member may cast up to 3 votes across different tracks. Bot protection and rate-limiting enforced.'
};
