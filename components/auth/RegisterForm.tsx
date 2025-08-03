import React, { useState } from 'react';
import toast from 'react-hot-toast';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { useAuthFormValidation } from '@/hooks/useFormValidation';
import { handleApiError, apiRequest } from '@/utils/errorHandling';

interface RegisterFormProps {
  onSuccess?: () => void;
}

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterForm({ onSuccess }: RegisterFormProps) {
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
  } = useAuthFormValidation('register', {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
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
      const data = await apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      if (data.success) {
        toast.success('Registration successful! Welcome to Wellness Platform!');
        
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
        if (error.errors.email || error.message?.includes('already exists')) {
          setFieldError('email', 'An account with this email already exists');
        } else if (error.errors.name) {
          setFieldError('name', error.errors.name);
        } else if (error.errors.password) {
          setFieldError('password', error.errors.password);
        } else {
          setGeneralError(error.message || 'Registration failed. Please try again.');
        }
      } else {
        setGeneralError(error.message || 'Registration failed. Please try again.');
      }

      handleApiError(error, {
        customMessage: 'Registration failed. Please check your information and try again.'
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
        label="Full Name"
        type="text"
        value={formData.name}
        onChange={(value) => handleFieldChange('name', value)}
        onBlur={() => handleFieldBlur('name')}
        error={errors.name}
        required
        placeholder="Enter your full name"
        disabled={isLoading}
        autoComplete="name"
      />

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
        placeholder="Create a password"
        disabled={isLoading}
        autoComplete="new-password"
      />

      <Input
        label="Confirm Password"
        type="password"
        value={formData.confirmPassword}
        onChange={(value) => handleFieldChange('confirmPassword', value)}
        onBlur={() => handleFieldBlur('confirmPassword')}
        error={errors.confirmPassword}
        required
        placeholder="Confirm your password"
        disabled={isLoading}
        autoComplete="new-password"
      />

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={isLoading}
        disabled={isLoading || !isValid}
        className="w-full"
      >
        {isLoading ? 'Creating account...' : 'Create Account'}
      </Button>
    </form>
  );
}