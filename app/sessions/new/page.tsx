'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PageLayout } from '@/components/layout';
import { SessionEditor } from '@/components/sessions';
import toast from 'react-hot-toast';

interface SessionData {
  title: string;
  tags: string[];
  json_file_url: string;
}

export default function NewSessionPage() {
  const router = useRouter();

  const handleSave = async (data: SessionData) => {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
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
        toast.success('Draft saved successfully');
        router.push('/my-sessions');
      } else {
        throw new Error(result.message || 'Failed to save draft');
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      throw error; // Re-throw to let SessionEditor handle the error display
    }
  };

  const handlePublish = async (data: SessionData) => {
    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
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
        toast.success('Session published successfully');
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
    <PageLayout title="Create New Session">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 break-words">
            Create New Session
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Create a new wellness session to share with the community. You can save it as a draft first or publish it immediately.
          </p>
        </div>

        <SessionEditor
          onSave={handleSave}
          onPublish={handlePublish}
        />
      </div>
    </PageLayout>
  );
}