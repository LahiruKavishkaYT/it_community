import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Project, Event, Job, UserStats } from '../types';
import { getProjects, getEvents, getJobs, getUserStats } from '../services/api';
import { useAuth } from './AuthContext';

interface StatsContextValue {
  stats: UserStats | null;
  projectCount: number;
  eventCount: number;
  jobCount: number;
  loading: boolean;
  refreshStats: () => Promise<void>;
  incrementProjectCount: () => void;
  incrementEventCount: () => void;
  incrementJobCount: () => void;
}

const StatsContext = createContext<StatsContextValue | undefined>(undefined);

export const useStats = () => {
  const context = useContext(StatsContext);
  if (context === undefined) {
    throw new Error('useStats must be used within a StatsProvider');
  }
  return context;
};

interface StatsProviderProps {
  children: React.ReactNode;
}

export const StatsProvider: React.FC<StatsProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [projectCount, setProjectCount] = useState(0);
  const [eventCount, setEventCount] = useState(0);
  const [jobCount, setJobCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    if (!user) {
      setStats(null);
      setProjectCount(0);
      setEventCount(0);
      setJobCount(0);
      return;
    }

    setLoading(true);
    try {
      // Fetch all data in parallel
      const [userStats, projects, events, jobs] = await Promise.all([
        getUserStats().catch(() => null),
        getProjects().catch(() => [] as Project[]),
        getEvents().catch(() => [] as Event[]),
        getJobs().catch(() => [] as Job[])
      ]);

      setStats(userStats);
      setProjectCount(projects.length);
      setEventCount(events.length);
      setJobCount(jobs.length);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refreshStats = useCallback(async () => {
    await fetchStats();
  }, [fetchStats]);

  // Real-time increment functions
  const incrementProjectCount = useCallback(() => {
    setProjectCount(prev => prev + 1);
    // Also update user stats if available
    if (stats) {
      setStats(prev => prev ? { ...prev, projectsOrJobs: prev.projectsOrJobs + 1 } : null);
    }
  }, [stats]);

  const incrementEventCount = useCallback(() => {
    setEventCount(prev => prev + 1);
    if (stats) {
      setStats(prev => prev ? { ...prev, eventsOrOrganized: prev.eventsOrOrganized + 1 } : null);
    }
  }, [stats]);

  const incrementJobCount = useCallback(() => {
    setJobCount(prev => prev + 1);
    if (stats) {
      setStats(prev => prev ? { ...prev, projectsOrJobs: prev.projectsOrJobs + 1 } : null);
    }
  }, [stats]);

  // Fetch stats when user changes or component mounts
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Set up periodic refresh every 30 seconds for real-time updates
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchStats();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user, fetchStats]);

  const value: StatsContextValue = {
    stats,
    projectCount,
    eventCount,
    jobCount,
    loading,
    refreshStats,
    incrementProjectCount,
    incrementEventCount,
    incrementJobCount
  };

  return <StatsContext.Provider value={value}>{children}</StatsContext.Provider>;
}; 