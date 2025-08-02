'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout, SessionList, Button, LoadingSpinner, ErrorBoundary } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { useMySession } from '@/hooks/useMySession';

export default function MySessionsPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const { sessions, loading: sessionsLoading, error, refetch } = useMySession();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your sessions..." />
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login via useAuth hook
  }

  const handleEditSession = (sessionId: string) => {
    router.push(`/sessions/edit/${sessionId}`);
  };

  const handleCreateSession = () => {
    router.push('/sessions/new');
  };

  // Separate drafts and published sessions
  const draftSessions = sessions.filter(session => session.status === 'draft');
  const publishedSessions = sessions.filter(session => session.status === 'published');

  return (
    <ErrorBoundary>
      <PageLayout
        title="My Sessions"
        currentUser={user}
        onLogout={logout}
      >
      <div className="space-y-6 sm:space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                My Wellness Sessions
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Manage your wellness sessions. Edit drafts, update published content, or create new sessions.
              </p>
            </div>
            <Button
              variant="primary"
              onClick={handleCreateSession}
              className="w-full sm:w-auto flex-shrink-0"
            >
              Create New Session
            </Button>
          </div>
        </div>



        {/* Draft Sessions Section */}
        {(draftSessions.length > 0 || (!sessionsLoading && sessions.length === 0)) && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 flex items-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mr-3 flex-shrink-0">
                  Draft
                </span>
                <span className="truncate">Draft Sessions ({draftSessions.length})</span>
              </h3>
            </div>
            
            <SessionList
              sessions={draftSessions}
              loading={sessionsLoading}
              error={error}
              onRetry={refetch}
              emptyMessage="No draft sessions yet. Start creating a new session to save it as a draft first."
              showAuthor={false}
              onEdit={handleEditSession}
            />
          </div>
        )}

        {/* Published Sessions Section */}
        {(publishedSessions.length > 0 || (!sessionsLoading && sessions.length === 0)) && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <h3 className="text-base sm:text-lg font-medium text-gray-900 flex items-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-3 flex-shrink-0">
                  Published
                </span>
                <span className="truncate">Published Sessions ({publishedSessions.length})</span>
              </h3>
            </div>
            
            <SessionList
              sessions={publishedSessions}
              loading={sessionsLoading}
              error={error}
              onRetry={refetch}
              emptyMessage="No published sessions yet. Publish your drafts to share them with the community."
              showAuthor={false}
              onEdit={handleEditSession}
            />
          </div>
        )}

        {/* Empty State - No Sessions at All */}
        {!sessionsLoading && sessions.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No sessions yet
            </h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              You haven&apos;t created any wellness sessions yet. Start by creating your first session to share your wellness expertise with the community.
            </p>
            <Button
              variant="primary"
              onClick={handleCreateSession}
            >
              Create Your First Session
            </Button>
          </div>
        )}
      </div>
      </PageLayout>
    </ErrorBoundary>
  );
}