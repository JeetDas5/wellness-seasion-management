import { useState, useEffect } from 'react';
import { handleApiError, apiRequest, retryRequest } from '@/utils/errorHandling';

interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: Date;
}

interface Session {
  _id: string;
  userId: string | User;
  title: string;
  tags: string[];
  json_file_url: string;
  status: 'draft' | 'published';
  createdAt: Date;
  updatedAt: Date;
}

interface UseMySessionsReturn {
  sessions: Session[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createSession: (sessionData: Partial<Session>) => Promise<Session>;
  updateSession: (sessionId: string, sessionData: Partial<Session>) => Promise<Session>;
  deleteSession: (sessionId: string) => Promise<void>;
}

export function useMySession(): UseMySessionsReturn {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await retryRequest(
        () => apiRequest('/api/my-sessions'),
        3,
        1000
      );

      if (data.success) {
        setSessions(data.sessions || []);
      } else {
        const errorMessage = data.message || 'Failed to fetch your sessions';
        setError(errorMessage);
      }
    } catch (err) {
      const apiError = handleApiError(err, {
        customMessage: 'Unable to load your sessions. Please try again.'
      });
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  const createSession = async (sessionData: Partial<Session>): Promise<Session> => {
    try {
      const data = await apiRequest('/api/sessions', {
        method: 'POST',
        body: JSON.stringify(sessionData),
      });

      if (data.success) {
        // Add the new session to the local state
        setSessions(prev => [data.session, ...prev]);
        return data.session;
      } else {
        throw new Error(data.message || 'Failed to create session');
      }
    } catch (err) {
      handleApiError(err, {
        customMessage: 'Failed to create session. Please try again.'
      });
      throw err;
    }
  };

  const updateSession = async (sessionId: string, sessionData: Partial<Session>): Promise<Session> => {
    try {
      const data = await apiRequest(`/api/sessions/${sessionId}`, {
        method: 'PUT',
        body: JSON.stringify(sessionData),
      });

      if (data.success) {
        // Update the session in local state
        setSessions(prev => 
          prev.map(session => 
            session._id === sessionId ? { ...session, ...data.session } : session
          )
        );
        return data.session;
      } else {
        throw new Error(data.message || 'Failed to update session');
      }
    } catch (err) {
      handleApiError(err, {
        customMessage: 'Failed to update session. Please try again.'
      });
      throw err;
    }
  };

  const deleteSession = async (sessionId: string): Promise<void> => {
    try {
      const data = await apiRequest(`/api/sessions/${sessionId}`, {
        method: 'DELETE',
      });

      if (data.success) {
        // Remove the session from local state
        setSessions(prev => prev.filter(session => session._id !== sessionId));
      } else {
        throw new Error(data.message || 'Failed to delete session');
      }
    } catch (err) {
      handleApiError(err, {
        customMessage: 'Failed to delete session. Please try again.'
      });
      throw err;
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return { 
    sessions, 
    loading, 
    error, 
    refetch: fetchSessions,
    createSession,
    updateSession,
    deleteSession
  };
}