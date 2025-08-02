import React from 'react';
import Button from '../ui/Button';

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

interface SessionCardProps {
  session: Session;
  onEdit?: (sessionId: string) => void;
  showAuthor?: boolean;
}

export default function SessionCard({ session, onEdit, showAuthor = true }: SessionCardProps) {
  const author = typeof session.userId === 'object' ? session.userId : null;
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
          {session.title}
        </h3>
        {session.status === 'draft' && (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Draft
          </span>
        )}
      </div>

      {session.tags && session.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {session.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {session.json_file_url && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">Session File:</p>
          <a
            href={session.json_file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm underline break-all"
          >
            {session.json_file_url}
          </a>
        </div>
      )}

      <div className="flex justify-between items-center text-sm text-gray-500">
        <div>
          {showAuthor && author && (
            <p className="mb-1">
              By <span className="font-medium text-gray-700">{author.name}</span>
            </p>
          )}
          <p>Created {formatDate(session.createdAt)}</p>
        </div>
        
        {onEdit && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onEdit(session._id)}
          >
            Edit
          </Button>
        )}
      </div>
    </div>
  );
}