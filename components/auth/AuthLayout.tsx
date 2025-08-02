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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Wellness Platform
          </h1>
          <p className="text-sm text-gray-600">
            Discover and create wellness sessions
          </p>
        </div>

        {/* Auth Form Container */}
        <div className="bg-white py-6 sm:py-8 px-4 sm:px-10 shadow-lg sm:rounded-lg border border-gray-200">
          <div className="mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 text-center">
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
                  className="text-blue-600 hover:text-blue-500 active:text-blue-700 font-medium transition-colors touch-manipulation inline-block py-2 px-4 rounded-md hover:bg-blue-50"
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