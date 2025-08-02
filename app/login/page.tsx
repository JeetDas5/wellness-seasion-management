'use client'

import React from 'react';
import AuthLayout from '@/components/auth/AuthLayout';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <AuthLayout
      title="Sign In"
      subtitle="Welcome back! Please sign in to your account."
      toggleText="Don't have an account? Sign up"
      toggleLink="/register"
    >
      <LoginForm />
    </AuthLayout>
  );
}