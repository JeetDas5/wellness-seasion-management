'use client';

import React from 'react';
import { PageLayout, SessionList, LoadingSpinner, ErrorBoundary } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { useSessions } from '@/hooks/useSessions';

export default function Dashboard() {
  const { user, loading: authLoading, logout } = useAuth();
  const { sessions, loading: sessionsLoading, error, refetch } = useSessions();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your dashboard..." />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login via useAuth hook
  }

  return (
    <PageLayout
      title="Wellness Sessions"
      currentUser={user}
      onLogout={logout}
    >
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Welcome back, {user.name}!
          </h2>
          <p className="text-gray-600">
            Discover wellness sessions created by our community. Browse through yoga, meditation, 
            and other wellness activities shared by fellow practitioners.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error loading sessions
                </h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <SessionList
          sessions={sessions}
          loading={sessionsLoading}
          emptyMessage="No published sessions available yet. Be the first to create and share a wellness session!"
          showAuthor={true}
        />
      </div>
    </PageLayout>
  );
}
