import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

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
}

export function useMySession(): UseMySessionsReturn {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMySessions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/my-sessions');
      const data = await response.json();

      if (data.success) {
        setSessions(data.sessions || []);
      } else {
        setError(data.message || 'Failed to fetch your sessions');
      }
    } catch (err) {
      const errorMessage = 'Failed to fetch your sessions';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('My sessions fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMySessions();
  }, []);

  return { 
    sessions, 
    loading, 
    error, 
    refetch: fetchMySessions 
  };
}