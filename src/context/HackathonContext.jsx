import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api.js';
import {
  MOCK_EVENTS,
  MOCK_USERS,
  MOCK_JUDGES,
  MOCK_SUBMISSIONS,
  MOCK_COMMUNITY_VOTING
} from '../services/mockData.js';

const HackathonContext = createContext(null);

export function HackathonProvider({ children }) {
  // Shared state across the entire application
  const [events, setEvents] = useState(() => JSON.parse(JSON.stringify(MOCK_EVENTS)));
  const [judges, setJudges] = useState(() => JSON.parse(JSON.stringify(MOCK_JUDGES)));
  const [submissions, setSubmissions] = useState(() => JSON.parse(JSON.stringify(MOCK_SUBMISSIONS)));
  const [selectedEventId, setSelectedEventId] = useState('evt-dogfood-2026');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  }, []);

  // 1. Add Event Action
  const addEvent = useCallback((eventData) => {
    const id = `evt-${Date.now().toString().slice(-6)}`;
    const newEvent = {
      id,
      title: eventData.title || 'Untitled Hackathon',
      tagline: eventData.tagline || 'Next-generation developer challenge',
      description: eventData.description || 'Full hackathon details coming soon.',
      status: eventData.status || 'upcoming',
      startDate: eventData.startDate || new Date(Date.now() + 86400000 * 7).toISOString(),
      endDate: eventData.endDate || new Date(Date.now() + 86400000 * 10).toISOString(),
      registrationDeadline: eventData.registrationDeadline || new Date(Date.now() + 86400000 * 6).toISOString(),
      prizePool: eventData.prizePool || '$25,000 USD',
      location: eventData.location || 'Virtual • Global',
      format: eventData.format || 'Online',
      participantCount: 0,
      maxParticipants: Number(eventData.maxParticipants) || 500,
      bannerImage: eventData.bannerImage || 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
      tracks: Array.isArray(eventData.tracks) && eventData.tracks.length > 0
        ? eventData.tracks
        : [
            { id: `trk-${Date.now()}-1`, name: 'Open Innovation', prize: '$15,000' },
            { id: `trk-${Date.now()}-2`, name: 'Developer Tooling', prize: '$10,000' }
          ],
      tags: Array.isArray(eventData.tags) && eventData.tags.length > 0 ? eventData.tags : ['Hackathon', 'DevTools', 'Innovation'],
      organizer: {
        id: 'org-cur',
        name: eventData.organizerName || 'Hackathon Core Committee',
        avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=120&q=80',
        verified: true
      },
      isRegistered: false
    };

    setEvents((prev) => [newEvent, ...prev]);

    // Also update in-memory API service mock if present
    if (api._mockEvents) {
      api._mockEvents.unshift(newEvent);
    }

    showNotification(`Created new event: "${newEvent.title}"!`, 'success');
    return newEvent;
  }, [showNotification]);

  // 2. Update Event Action
  const updateEvent = useCallback((id, updatedFields) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          const updated = { ...e, ...updatedFields };
          return updated;
        }
        return e;
      })
    );

    if (api._mockEvents) {
      const idx = api._mockEvents.findIndex((e) => e.id === id);
      if (idx !== -1) {
        Object.assign(api._mockEvents[idx], updatedFields);
      }
    }

    showNotification(`Event "${id}" updated successfully.`, 'info');
  }, [showNotification]);

  // 3. Delete Event Action
  const deleteEvent = useCallback((id) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
    if (api._mockEvents) {
      api._mockEvents = api._mockEvents.filter((e) => e.id !== id);
    }
    showNotification(`Event removed.`, 'info');
  }, [showNotification]);

  // 4. Toggle Event Registration
  const toggleEventRegistration = useCallback(async (eventId) => {
    const event = events.find((e) => e.id === eventId);
    if (!event) return;

    const newStatus = !event.isRegistered;
    const newCount = newStatus ? event.participantCount + 1 : Math.max(0, event.participantCount - 1);

    setEvents((prev) =>
      prev.map((e) =>
        e.id === eventId
          ? { ...e, isRegistered: newStatus, participantCount: newCount }
          : e
      )
    );

    showNotification(
      newStatus
        ? `🎉 Registered for "${event.title}"!`
        : `Cancelled registration for "${event.title}".`,
      newStatus ? 'success' : 'info'
    );
  }, [events, showNotification]);

  // 5. Assign Judge to Event
  const assignJudgeToEvent = useCallback((judgeId, eventId) => {
    const event = events.find((e) => e.id === eventId);
    const eventTitle = event ? event.title : eventId;

    setJudges((prev) =>
      prev.map((j) => {
        if (j.id === judgeId) {
          const assignedIds = j.assignedEventIds || [];
          const assignedNames = j.assignedEvents || [];

          if (assignedIds.includes(eventId)) {
            return j; // Already assigned
          }

          return {
            ...j,
            assignedEventIds: [...assignedIds, eventId],
            assignedEvents: [...assignedNames, eventTitle]
          };
        }
        return j;
      })
    );

    showNotification(`Judge assigned to event: "${eventTitle}".`, 'success');
  }, [events, showNotification]);

  // 6. Community Voting actions
  const castVote = useCallback((submissionId) => {
    setSubmissions((prev) =>
      prev.map((s) => {
        if (s.id === submissionId && !s.hasVoted) {
          return { ...s, votesCount: s.votesCount + 1, hasVoted: true };
        }
        return s;
      })
    );
    showNotification('Vote recorded!', 'success');
  }, [showNotification]);

  const retractVote = useCallback((submissionId) => {
    setSubmissions((prev) =>
      prev.map((s) => {
        if (s.id === submissionId && s.hasVoted) {
          return { ...s, votesCount: Math.max(0, s.votesCount - 1), hasVoted: false };
        }
        return s;
      })
    );
    showNotification('Vote retracted.', 'info');
  }, [showNotification]);

  const value = {
    events,
    judges,
    submissions,
    selectedEventId,
    setSelectedEventId,
    addEvent,
    updateEvent,
    deleteEvent,
    toggleEventRegistration,
    assignJudgeToEvent,
    castVote,
    retractVote,
    notification
  };

  return (
    <HackathonContext.Provider value={value}>
      {children}
    </HackathonContext.Provider>
  );
}

export function useHackathon() {
  const context = useContext(HackathonContext);
  if (!context) {
    throw new Error('useHackathon must be used within a HackathonProvider');
  }
  return context;
}

export default HackathonContext;
