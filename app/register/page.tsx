'use client'

import React from 'react';
import AuthLayout from '@/components/auth/AuthLayout';
import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join our wellness community and start creating sessions."
      toggleText="Already have an account? Sign in"
      toggleLink="/login"
    >
      <RegisterForm />
    </AuthLayout>
  );
}