import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useAuthFormValidation } from '@/hooks/useFormValidation';
import { handleApiError, apiRequest } from '@/utils/errorHandling';

interface LoginFormProps {
  onSuccess?: () => void;
}

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginForm({ onSuccess }: LoginFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string>('');

  const {
    formData,
    errors,
    isValid,
    handleFieldChange,
    handleFieldBlur,
    validateForm,
    markAllTouched,
    setFieldError
  } = useAuthFormValidation('login', {
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched to show validation errors
    markAllTouched();

    if (!validateForm()) {
      toast.error('Please fix the validation errors before submitting');
      return;
    }

    setIsLoading(true);
    setGeneralError('');

    try {
      const data = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(formData),
      });

      if (data.success) {
        toast.success('Login successful!');

        if (onSuccess) {
          onSuccess();
        } else {
          // Force a page reload to trigger middleware redirect
          window.location.href = '/';
        }
      }
    } catch (error: any) {
      // Handle specific validation errors from server
      if (error.errors) {
        // Map server errors to form fields
        if (error.errors.email || error.message?.includes('does not exist')) {
          setFieldError('email', 'No account found with this email address');
        } else if (error.errors.password || error.message?.includes('Invalid password')) {
          setFieldError('password', 'Incorrect password');
        } else {
          setGeneralError(error.message || 'Login failed. Please try again.');
        }
      } else {
        setGeneralError(error.message || 'Login failed. Please try again.');
      }

      handleApiError(error, {
        customMessage: 'Login failed. Please check your credentials and try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {generalError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <p className="text-sm text-red-600">{generalError}</p>
        </div>
      )}

      <Input
        label="Email Address"
        type="email"
        value={formData.email}
        onChange={(value) => handleFieldChange('email', value)}
        onBlur={() => handleFieldBlur('email')}
        error={errors.email}
        required
        placeholder="Enter your email"
        disabled={isLoading}
        autoComplete="email"
      />

      <Input
        label="Password"
        type="password"
        value={formData.password}
        onChange={(value) => handleFieldChange('password', value)}
        onBlur={() => handleFieldBlur('password')}
        error={errors.password}
        required
        placeholder="Enter your password"
        disabled={isLoading}
        autoComplete="current-password"
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={isLoading}
        disabled={isLoading || !isValid}
        className="w-full"
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </Button>
    </form>
  );
}