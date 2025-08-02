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

interface UseSessionsReturn {
  sessions: Session[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useSessions(): UseSessionsReturn {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await retryRequest(
        () => apiRequest('/api/sessions'),
        3, // Retry up to 3 times for session data
        1000 // 1 second delay
      );

      if (data.success) {
        setSessions(data.sessions || []);
      } else {
        const errorMessage = data.message || 'Failed to fetch sessions';
        setError(errorMessage);
      }
    } catch (err) {
      const apiError = handleApiError(err, {
        customMessage: 'Unable to load sessions. Please try again.'
      });
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  return { 
    sessions, 
    loading, 
    error, 
    refetch: fetchSessions 
  };
}