'use client'

import { useState } from 'react';
import Link from 'next/link'
import ThemeSwitcher from './ThemeSwitcher';
import { useAuth } from '../../lib/contexts/AuthContext';
import { useProfile } from '../../lib/hooks/useProfile';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { logout, isAuthenticated } = useAuth();
  const { profile } = useProfile();

  return (
    <div className="navbar bg-base-100 sticky top-0 z-50 shadow-md animate-fade-in px-2 sm:px-4">
      <div className="navbar-start">
        <div className="dropdown">
          <label 
            tabIndex={0} 
            className="btn btn-ghost btn-square lg:hidden transition-all duration-300 min-h-[44px] touch-manipulation" 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMenuOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
              </svg>
            )}
          </label>
          {isMenuOpen && (
            <>
              <div 
                className="fixed inset-0 bg-black bg-opacity-50 z-[1] lg:hidden" 
                onClick={() => setIsMenuOpen(false)}
              />
              <ul className="menu menu-sm dropdown-content mt-3 z-[2] p-3 shadow-xl bg-base-100 rounded-box w-64 sm:w-72 animate-slide-up border border-base-300">
                <li className="animate-fade-in">
                  <Link 
                    href="/#features" 
                    className="hover:bg-primary hover:text-primary-content transition-all duration-300 min-h-[44px] text-base touch-manipulation"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Features
                  </Link>
                </li>
                <li className="animate-fade-in animate-delay-100">
                  <Link 
                    href="/#how-it-works" 
                    className="hover:bg-primary hover:text-primary-content transition-all duration-300 min-h-[44px] text-base touch-manipulation"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    How It Works
                  </Link>
                </li>
                <li className="animate-fade-in animate-delay-200">
                  <Link 
                    href="/#testimonials" 
                    className="hover:bg-primary hover:text-primary-content transition-all duration-300 min-h-[44px] text-base touch-manipulation"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m10 0v10a2 2 0 01-2 2H9a2 2 0 01-2-2V8m10 0H7" />
                    </svg>
                    Testimonials
                  </Link>
                </li>
                <li className="animate-fade-in animate-delay-300">
                  <Link 
                    href="/#faq" 
                    className="hover:bg-primary hover:text-primary-content transition-all duration-300 min-h-[44px] text-base touch-manipulation"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    FAQ
                  </Link>
                </li>
                {isAuthenticated && (
                  <>
                    <div className="divider my-2"></div>
                    <li className="animate-fade-in animate-delay-400">
                      <Link 
                        href="/profile" 
                        className="hover:bg-primary hover:text-primary-content transition-all duration-300 min-h-[44px] text-base touch-manipulation"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Profile Settings
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </>
          )}
        </div>
        <Link href="/" className="btn btn-ghost text-lg sm:text-xl animate-fade-in min-h-[44px] px-2 sm:px-4">
          <span className="hidden sm:inline">Myth.OS</span>
          <span className="sm:hidden">M.OS</span>
        </Link>
      </div>
      
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li className="animate-fade-in">
            <Link 
              href={process.env.NODE_ENV === "development" ? "http://localhost:3001" : "https://reply.mythos.co"} 
              className="hover:bg-primary hover:text-primary-content transition-all duration-300 min-h-[44px] touch-manipulation"
            >
              Reply Agent
            </Link>
          </li>
        </ul>
      </div>
      
      <div className="navbar-end">
        <div className="flex items-center gap-1 sm:gap-2">
          {isAuthenticated && profile && (
            <div className="dropdown dropdown-end">
              <div 
                tabIndex={0} 
                role="button" 
                className="btn btn-ghost btn-circle avatar min-h-[44px] min-w-[44px] touch-manipulation"
                aria-label="User menu"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary text-primary-content flex items-center justify-center">
                  <span className="text-sm sm:text-base font-medium">
                    {profile.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <ul className="mt-3 z-[1] p-3 shadow-xl menu menu-sm dropdown-content bg-base-100 rounded-box w-64 border border-base-300">
                <li className="menu-title mb-2">
                  <span className="text-base font-semibold">Account</span>
                </li>
                <li className="mb-2">
                  <a className="text-xs opacity-70 cursor-default px-3 py-2 bg-base-200 rounded">
                    {profile.account_id}
                  </a>
                </li>
                <div className="divider my-1"></div>
                <li>
                  <Link 
                    href="/profile" 
                    className="hover:bg-primary hover:text-primary-content min-h-[44px] touch-manipulation"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Profile Settings
                  </Link>
                </li>
                <li>
                  <button 
                    onClick={logout} 
                    className="text-error hover:bg-error hover:text-error-content min-h-[44px] touch-manipulation"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          )}
          <ThemeSwitcher />
        </div>
      </div>
    </div>
  );
}