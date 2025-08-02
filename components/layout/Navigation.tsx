import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import toast from 'react-hot-toast';
import Button from '../ui/Button';

interface User {
  _id: string;
  name: string;
  email: string;
}

interface NavigationProps {
  currentUser: User;
  onLogout: () => void;
  loading?: boolean;
}

export default function Navigation({ currentUser, onLogout, loading = false }: NavigationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Helper function to determine if a link is active
  const isActiveLink = (href: string) => {
    if (href === '/' && pathname === '/') return true;
    if (href !== '/' && pathname.startsWith(href)) return true;
    return false;
  };

  // Navigation items configuration
  const navigationItems = [
    { href: '/', label: 'Dashboard', icon: 'dashboard' },
    { href: '/my-sessions', label: 'My Sessions', icon: 'sessions' },
    { href: '/sessions/new', label: 'Create Session', icon: 'create' },
  ];

  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple logout attempts
    
    try {
      setIsLoggingOut(true);
      
      // Call the logout API
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Clear local storage
        localStorage.removeItem('user');
        
        // Call the parent logout handler if provided
        await onLogout();
        
        // Show success message
        toast.success('Logged out successfully');
        
        // Redirect to login page
        router.push('/login');
      } else {
        console.error('Logout API call failed');
        toast.error('Logout failed, but you have been signed out locally');
        // Still attempt to clear local data and redirect
        localStorage.removeItem('user');
        await onLogout();
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout failed, but you have been signed out locally');
      // Fallback: clear local data and redirect anyway
      localStorage.removeItem('user');
      try {
        await onLogout();
      } catch (e) {
        console.error('Parent logout handler failed:', e);
      }
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <nav ref={navRef} className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Wellness Platform
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const isActive = isActiveLink(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-500'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="text-sm text-gray-700">
              <span className="hidden lg:inline">Welcome, </span>
              <span className="font-medium">{currentUser.name}</span>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleLogout}
              loading={isLoggingOut}
            >
              Logout
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 p-2 rounded-md"
              aria-expanded={isMobileMenuOpen}
              aria-label="Toggle main menu"
            >
              <span className="sr-only">
                {isMobileMenuOpen ? 'Close main menu' : 'Open main menu'}
              </span>
              {isMobileMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden transition-all duration-300 ease-in-out ${
        isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
      }`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50 border-t border-gray-200">
          {navigationItems.map((item) => {
            const isActive = isActiveLink(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`block px-3 py-2 rounded-md text-base font-medium transition-colors duration-200 ${
                  isActive
                    ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          
          {/* Mobile user info and logout */}
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="px-3 py-2">
              <div className="text-base font-medium text-gray-800">
                {currentUser.name}
              </div>
              <div className="text-sm text-gray-500">
                {currentUser.email}
              </div>
            </div>
            <div className="px-3 mt-3">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleLogout();
                }}
                loading={isLoggingOut}
                className="w-full"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}