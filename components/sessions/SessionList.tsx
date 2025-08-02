import React from 'react';
import SessionCard from './SessionCard';
import { LoadingSpinner, ErrorMessage } from '@/components/ui';

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

interface SessionListProps {
  sessions: Session[];
  emptyMessage: string;
  showAuthor?: boolean;
  onEdit?: (sessionId: string) => void;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export default function SessionList({ 
  sessions, 
  emptyMessage, 
  showAuthor = true, 
  onEdit,
  loading = false,
  error = null,
  onRetry
}: SessionListProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        <LoadingSpinner size="lg" text="Loading sessions..." className="py-12" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6 animate-pulse">
              <div className="h-5 sm:h-6 bg-gray-200 rounded mb-4"></div>
              <div className="flex gap-1.5 sm:gap-2 mb-4">
                <div className="h-4 sm:h-5 bg-gray-200 rounded-full w-12 sm:w-16"></div>
                <div className="h-4 sm:h-5 bg-gray-200 rounded-full w-16 sm:w-20"></div>
              </div>
              <div className="h-3 sm:h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage
        title="Failed to load sessions"
        message={error}
        onRetry={onRetry}
        retryText="Reload Sessions"
        variant="card"
        className="my-8"
      />
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
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
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions found</h3>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {sessions.map((session) => (
        <SessionCard
          key={session._id}
          session={session}
          showAuthor={showAuthor}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}