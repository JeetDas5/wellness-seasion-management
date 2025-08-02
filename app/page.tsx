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
    <ErrorBoundary>
      <PageLayout
        title="Wellness Sessions"
        currentUser={user}
        onLogout={logout}
      >
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Welcome back, {user.name}!
            </h2>
            <p className="text-gray-600 text-sm sm:text-base">
              Discover wellness sessions created by our community. Browse through yoga, meditation, 
              and other wellness activities shared by fellow practitioners.
            </p>
          </div>

          <SessionList
            sessions={sessions}
            loading={sessionsLoading}
            error={error}
            onRetry={refetch}
            emptyMessage="No published sessions available yet. Be the first to create and share a wellness session!"
            showAuthor={true}
          />
        </div>
      </PageLayout>
    </ErrorBoundary>
  );
}
