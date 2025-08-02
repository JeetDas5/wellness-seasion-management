import React from 'react';
import Navigation from './Navigation';

interface User {
  _id: string;
  name: string;
  email: string;
}

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  showNavigation?: boolean;
  currentUser?: User;
  onLogout?: () => void;
  loading?: boolean;
}

export default function PageLayout({
  children,
  title,
  showNavigation = true,
  currentUser,
  onLogout,
  loading = false,
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {showNavigation && currentUser && onLogout && (
        <Navigation currentUser={currentUser} onLogout={onLogout} loading={loading} />
      )}
      
      <main className={showNavigation ? 'pt-0' : 'pt-4 sm:pt-8'}>
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          {title && (
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">
                {title}
              </h1>
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}