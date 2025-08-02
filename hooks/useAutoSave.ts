import { useState, useCallback, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';

interface UseAutoSaveOptions {
  delay: number;
  onSave: (data: any) => Promise<void>;
  enabled: boolean;
}

interface UseAutoSaveReturn {
  save: (data: any) => void;
  status: 'idle' | 'saving' | 'saved' | 'error';
  lastSaved: Date | null;
  manualSave: (data: any) => Promise<void>;
}

export function useAutoSave({
  delay = 5000,
  onSave,
  enabled = true
}: UseAutoSaveOptions): UseAutoSaveReturn {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingDataRef = useRef<any>(null);
  const isUnmountedRef = useRef(false);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      isUnmountedRef.current = true;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const performSave = useCallback(async (data: any) => {
    if (isUnmountedRef.current) return;
    
    setStatus('saving');
    
    try {
      await onSave(data);
      
      if (!isUnmountedRef.current) {
        setStatus('saved');
        setLastSaved(new Date());
        
        // Show success toast for auto-save
        toast.success('Changes saved automatically', {
          duration: 2000,
          position: 'bottom-right',
        });
        
        // Reset to idle after 3 seconds
        setTimeout(() => {
          if (!isUnmountedRef.current) {
            setStatus('idle');
          }
        }, 3000);
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
      
      if (!isUnmountedRef.current) {
        setStatus('error');
        
        // Show error toast
        toast.error('Auto-save failed. Please save manually.', {
          duration: 4000,
          position: 'bottom-right',
        });
        
        // Reset to idle after 5 seconds
        setTimeout(() => {
          if (!isUnmountedRef.current) {
            setStatus('idle');
          }
        }, 5000);
      }
    }
  }, [onSave]);

  const save = useCallback((data: any) => {
    if (!enabled || isUnmountedRef.current) return;
    
    // Store the latest data
    pendingDataRef.current = data;
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      if (pendingDataRef.current && !isUnmountedRef.current) {
        performSave(pendingDataRef.current);
      }
    }, delay);
  }, [delay, enabled, performSave]);

  const manualSave = useCallback(async (data: any) => {
    // Clear any pending auto-save
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    await performSave(data);
  }, [performSave]);

  return {
    save,
    status,
    lastSaved,
    manualSave
  };
}