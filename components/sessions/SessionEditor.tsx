'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button, Input, LoadingSpinner, ErrorMessage } from '@/components/ui';
import AutoSaveIndicator from '@/components/ui/AutoSaveIndicator';
import { useAutoSave } from '@/hooks/useAutoSave';
import { handleApiError, apiRequest, formatValidationErrors } from '@/utils/errorHandling';
import toast from 'react-hot-toast';

interface SessionData {
  title: string;
  tags: string[];
  json_file_url: string;
}

interface SessionEditorProps {
  sessionId?: string;
  initialData?: Partial<SessionData>;
  onSave?: (data: SessionData) => Promise<void>;
  onPublish?: (data: SessionData) => Promise<void>;
}

interface FormErrors {
  [key: string]: string | undefined;
  title?: string;
  tags?: string;
  json_file_url?: string;
}

export default function SessionEditor({
  sessionId,
  initialData,
  onSave,
  onPublish
}: SessionEditorProps) {
  const [formData, setFormData] = useState<SessionData>({
    title: '',
    tags: [],
    json_file_url: ''
  });
  
  const [tagsInput, setTagsInput] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Auto-save functionality
  const autoSaveCallback = useCallback(async (data: SessionData) => {
    if (!sessionId) return; // Only auto-save existing sessions
    
    try {
      await apiRequest(`/api/sessions/${sessionId}/auto-save`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      console.error('Auto-save error:', error);
      throw error;
    }
  }, [sessionId]);

  const { save: triggerAutoSave, status: autoSaveStatus, lastSaved, manualSave } = useAutoSave({
    delay: 5000,
    onSave: autoSaveCallback,
    enabled: !!sessionId // Only enable auto-save for existing sessions
  });

  // Handle navigation away from the page - ensure auto-save is triggered
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (sessionId && autoSaveStatus === 'saving') {
        e.preventDefault();
        e.returnValue = 'Your changes are being saved. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && sessionId) {
        // Trigger immediate save when page becomes hidden
        manualSave(formData).catch(console.error);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [sessionId, autoSaveStatus, formData, manualSave]);

  // Initialize form data
  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        tags: initialData.tags || [],
        json_file_url: initialData.json_file_url || ''
      });
      setTagsInput(initialData.tags?.join(', ') || '');
    }
  }, [initialData]);

  const fetchSessionData = useCallback(async () => {
    if (!sessionId) return;
    
    setIsLoading(true);
    try {
      const data = await apiRequest(`/api/my-sessions/${sessionId}`);
      
      if (data.success && data.session) {
        const session = data.session;
        setFormData({
          title: session.title,
          tags: session.tags || [],
          json_file_url: session.json_file_url || ''
        });
        setTagsInput(session.tags?.join(', ') || '');
      } else {
        throw new Error(data.message || 'Failed to load session data');
      }
    } catch (error) {
      handleApiError(error, {
        customMessage: 'Failed to load session data. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  // Fetch session data if editing existing session
  useEffect(() => {
    if (sessionId && !initialData) {
      fetchSessionData();
    }
  }, [sessionId, initialData, fetchSessionData]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate title
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters long';
    } else if (formData.title.trim().length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }

    // Validate JSON URL if provided
    if (formData.json_file_url.trim()) {
      try {
        const url = new URL(formData.json_file_url.trim());
        if (!url.protocol.startsWith('http')) {
          newErrors.json_file_url = 'URL must start with http:// or https://';
        }
      } catch {
        newErrors.json_file_url = 'Please provide a valid URL';
      }
    }

    // Validate tags
    if (formData.tags.length > 10) {
      newErrors.tags = 'Maximum 10 tags allowed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof SessionData, value: string) => {
    const newFormData = {
      ...formData,
      [field]: value
    };
    
    setFormData(newFormData);
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
    
    // Trigger auto-save with updated data
    triggerAutoSave(newFormData);
  };

  const handleTagsChange = (value: string) => {
    setTagsInput(value);
    
    // Parse tags from comma-separated string
    const tags = value
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0)
      .slice(0, 10); // Limit to 10 tags
    
    const newFormData = {
      ...formData,
      tags
    };
    
    setFormData(newFormData);
    
    // Clear tags error when user starts typing
    if (errors.tags) {
      setErrors(prev => ({
        ...prev,
        tags: undefined
      }));
    }
    
    // Trigger auto-save with updated data
    triggerAutoSave(newFormData);
  };

  const handleSaveAsDraft = async () => {
    if (!validateForm()) {
      const errorMessage = formatValidationErrors(
        Object.fromEntries(
          Object.entries(errors).filter(([_, value]) => value !== undefined)
        ) as Record<string, string>
      );
      toast.error(errorMessage);
      return;
    }

    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(formData);
      } else {
        // Default save implementation
        const url = sessionId ? `/api/sessions/${sessionId}` : '/api/sessions';
        const method = sessionId ? 'PUT' : 'POST';
        
        const data = await apiRequest(url, {
          method,
          body: JSON.stringify({
            ...formData,
            status: 'draft'
          }),
        });
        
        if (data.success) {
          toast.success(sessionId ? 'Draft updated successfully' : 'Draft saved successfully');
        } else {
          throw new Error(data.message || 'Failed to save draft');
        }
      }
    } catch (error) {
      handleApiError(error, {
        customMessage: 'Failed to save draft. Please try again.'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!validateForm()) {
      const errorMessage = formatValidationErrors(
        Object.fromEntries(
          Object.entries(errors).filter(([_, value]) => value !== undefined)
        ) as Record<string, string>
      );
      toast.error(errorMessage);
      return;
    }

    setIsPublishing(true);
    try {
      if (onPublish) {
        await onPublish(formData);
      } else {
        // Default publish implementation
        const url = sessionId ? `/api/sessions/${sessionId}` : '/api/sessions';
        const method = sessionId ? 'PUT' : 'POST';
        
        const data = await apiRequest(url, {
          method,
          body: JSON.stringify({
            ...formData,
            status: 'published'
          }),
        });
        
        if (data.success) {
          toast.success(sessionId ? 'Session updated and published' : 'Session published successfully');
        } else {
          throw new Error(data.message || 'Failed to publish session');
        }
      }
    } catch (error) {
      handleApiError(error, {
        customMessage: 'Failed to publish session. Please try again.'
      });
    } finally {
      setIsPublishing(false);
    }
  };

  if (isLoading) {
    return (
      <LoadingSpinner size="lg" text="Loading session data..." className="py-12" />
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <Input
          label="Session Title"
          value={formData.title}
          onChange={(value) => handleInputChange('title', value)}
          error={errors.title}
          required
          placeholder="Enter a descriptive title for your session"
          className="w-full"
        />

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tags
            <span className="text-gray-500 ml-1 block sm:inline">(comma-separated, max 10)</span>
          </label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => handleTagsChange(e.target.value)}
            placeholder="yoga, meditation, wellness, relaxation"
            className={`
              w-full px-3 py-3 sm:py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-base sm:text-sm touch-manipulation
              ${errors.tags 
                ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                : 'border-gray-300 hover:border-gray-400'
              }
            `}
          />
          {errors.tags && (
            <p className="mt-2 text-sm text-red-600 flex items-start">
              <svg className="h-4 w-4 text-red-500 mt-0.5 mr-1 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{errors.tags}</span>
            </p>
          )}
          {formData.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5 sm:gap-2">
              {formData.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <Input
          label="JSON File URL"
          type="url"
          value={formData.json_file_url}
          onChange={(value) => handleInputChange('json_file_url', value)}
          error={errors.json_file_url}
          placeholder="https://example.com/session-data.json"
          className="w-full"
        />

        {/* Auto-save indicator - only show for existing sessions */}
        {sessionId && (
          <AutoSaveIndicator 
            status={autoSaveStatus} 
            lastSaved={lastSaved} 
          />
        )}

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6">
          <Button
            variant="secondary"
            onClick={handleSaveAsDraft}
            loading={isSaving}
            disabled={isPublishing}
            className="flex-1 order-2 sm:order-1"
          >
            Save as Draft
          </Button>
          
          <Button
            variant="primary"
            onClick={handlePublish}
            loading={isPublishing}
            disabled={isSaving}
            className="flex-1 order-1 sm:order-2"
          >
            Publish Session
          </Button>
        </div>
      </form>
    </div>
  );
}