import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { handleApiError, apiRequest, retryRequest } from '@/utils/errorHandling';

interface User {
  _id: string;
  name: string;
  email: string;
  createdAt: Date;
}

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  logout: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await retryRequest(
        () => apiRequest('/api/auth/me'),
        2, // Retry up to 2 times
        1000 // 1 second delay
      );

      if (data.success) {
        setUser(data.user);
      } else {
        setError(data.message || 'Failed to fetch user data');
        if (data.status === 401) {
          router.push('/login');
        }
      }
    } catch (err) {
      const apiError = handleApiError(err, {
        showToast: false, // Don't show toast for auth checks
        onAuthError: () => router.push('/login')
      });
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await apiRequest('/api/auth/logout', {
        method: 'POST',
      });

      setUser(null);
      router.push('/login');
    } catch (err) {
      handleApiError(err, {
        customMessage: 'Failed to logout properly. You have been logged out locally.'
      });
      // Still log out locally even if server request fails
      setUser(null);
      router.push('/login');
    }
  };

  return { user, loading, error, logout };
}