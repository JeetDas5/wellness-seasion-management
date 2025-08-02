'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout, SessionList, Button } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { useMySession } from '@/hooks/useMySession';

export default function MySessionsPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const { sessions, loading: sessionsLoading, error, refetch } = useMySession();

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
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
    <PageLayout
      title="My Sessions"
      currentUser={user}
      onLogout={logout}
    >
      <div className="space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                My Wellness Sessions
              </h2>
              <p className="text-gray-600">
                Manage your wellness sessions. Edit drafts, update published content, or create new sessions.
              </p>
            </div>
            <Button
              variant="primary"
              onClick={handleCreateSession}
            >
              Create New Session
            </Button>
          </div>
        </div>

        {/* Error Display */}
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
                  Error loading your sessions
                </h3>
                <p className="mt-1 text-sm text-red-700">{error}</p>
                <div className="mt-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={refetch}
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Draft Sessions Section */}
        {(draftSessions.length > 0 || (!sessionsLoading && sessions.length === 0)) && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mr-3">
                  Draft
                </span>
                Draft Sessions ({draftSessions.length})
              </h3>
            </div>
            
            <SessionList
              sessions={draftSessions}
              loading={sessionsLoading}
              emptyMessage="No draft sessions yet. Start creating a new session to save it as a draft first."
              showAuthor={false}
              onEdit={handleEditSession}
            />
          </div>
        )}

        {/* Published Sessions Section */}
        {(publishedSessions.length > 0 || (!sessionsLoading && sessions.length === 0)) && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-3">
                  Published
                </span>
                Published Sessions ({publishedSessions.length})
              </h3>
            </div>
            
            <SessionList
              sessions={publishedSessions}
              loading={sessionsLoading}
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
  );
}