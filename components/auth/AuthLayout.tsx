import React from 'react';
import Link from 'next/link';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  showToggle?: boolean;
  toggleText?: string;
  toggleLink?: string;
}

export default function AuthLayout({
  children,
  title,
  subtitle,
  showToggle = true,
  toggleText,
  toggleLink,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo/Brand */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Wellness Platform
          </h1>
          <p className="text-sm text-gray-600">
            Discover and create wellness sessions
          </p>
        </div>

        {/* Auth Form Container */}
        <div className="mt-8 bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 text-center">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-2 text-sm text-gray-600 text-center">
                {subtitle}
              </p>
            )}
          </div>

          {children}

          {showToggle && toggleText && toggleLink && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">or</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Link
                  href={toggleLink}
                  className="text-blue-600 hover:text-blue-500 font-medium transition-colors"
                >
                  {toggleText}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}