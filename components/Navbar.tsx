'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavbarProps {
  trainCount: number;
  lastUpdate: Date | null;
  isLoading?: boolean;
}

export default function Navbar({ trainCount, lastUpdate, isLoading }: NavbarProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo and title */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-red-500 rounded-lg">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C7.58 2 4 3.79 4 6v12c0 1.1.9 2 2 2h1v1c0 .55.45 1 1 1s1-.45 1-1v-1h6v1c0 .55.45 1 1 1s1-.45 1-1v-1h1c1.1 0 2-.9 2-2V6c0-2.21-3.58-4-8-4zm0 2c3.23 0 6 1.25 6 2s-2.77 2-6 2-6-1.25-6-2 2.77-2 6-2zM6 18V8.37C7.69 9.27 9.73 9.8 12 9.8s4.31-.53 6-1.43V18H6zm2-3c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm8 0c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
              </svg>
            </div>
            <span className="font-semibold text-gray-900">Train Tracker Switzerland</span>
          </div>

          {/* Navigation links */}
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className={`text-sm font-medium transition-colors ${
                pathname === '/' ? 'text-red-500' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Live Map
            </Link>
            <Link
              href="/stats"
              className={`text-sm font-medium transition-colors ${
                pathname === '/stats' ? 'text-red-500' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Analytics
            </Link>
          </div>

          {/* Status */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              {isLoading ? (
                <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
              ) : (
                <div className="w-2 h-2 bg-green-400 rounded-full" />
              )}
              <span className="text-gray-600">
                <span className="font-medium text-gray-900">{trainCount}</span> trains
              </span>
            </div>
            {lastUpdate && (
              <span className="text-gray-400 hidden sm:inline">
                Updated {lastUpdate.toLocaleTimeString('fr-CH')}
              </span>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
