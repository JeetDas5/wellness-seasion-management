'use client';

import React, { use } from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout } from '@/components/layout';
import { SessionEditor } from '@/components/sessions';
import toast from 'react-hot-toast';

interface SessionData {
  title: string;
  tags: string[];
  json_file_url: string;
}

interface EditSessionPageProps {
  params: Promise<{ id: string }>;
}

export default function EditSessionPage({ params }: EditSessionPageProps) {
  const { id } = use(params);
  const router = useRouter();

  const handleSave = async (data: SessionData) => {
    try {
      const response = await fetch(`/api/sessions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          status: 'draft'
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Draft updated successfully');
        router.push('/my-sessions');
      } else {
        throw new Error(result.message || 'Failed to update draft');
      }
    } catch (error) {
      console.error('Error updating draft:', error);
      throw error; // Re-throw to let SessionEditor handle the error display
    }
  };

  const handlePublish = async (data: SessionData) => {
    try {
      const response = await fetch(`/api/sessions/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          status: 'published'
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Session updated and published successfully');
        router.push('/my-sessions');
      } else {
        throw new Error(result.message || 'Failed to publish session');
      }
    } catch (error) {
      console.error('Error publishing session:', error);
      throw error; // Re-throw to let SessionEditor handle the error display
    }
  };

  return (
    <PageLayout title="Edit Session">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Edit Session
          </h1>
          <p className="text-gray-600">
            Update your wellness session. You can save changes as a draft or publish them immediately.
          </p>
        </div>

        <SessionEditor
          sessionId={id}
          onSave={handleSave}
          onPublish={handlePublish}
        />
      </div>
    </PageLayout>
  );
}