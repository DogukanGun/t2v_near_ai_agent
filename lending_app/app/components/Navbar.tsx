'use client'

import { useState } from 'react';
import Link from 'next/link'
import ThemeSwitcher from './ThemeSwitcher';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    Lending Features
                  </Link>
                </li>
                <li className="animate-fade-in animate-delay-100">
                  <Link 
                    href="/#how-it-works" 
                    className="hover:bg-primary hover:text-primary-content transition-all duration-300 min-h-[44px] text-base touch-manipulation"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
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
                <div className="divider my-2"></div>
                <li className="animate-fade-in animate-delay-400">
                  <Link 
                    href={process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://agent.mythos.co"} 
                    className="hover:bg-primary hover:text-primary-content transition-all duration-300 min-h-[44px] text-base touch-manipulation"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Launch dApp
                  </Link>
                </li>
              </ul>
            </>
          )}
        </div>
        <Link href="/" className="btn btn-ghost text-lg sm:text-xl animate-fade-in min-h-[44px] px-2 sm:px-4">
          <span className="hidden sm:inline">Lending App</span>
          <span className="sm:hidden">Lend</span>
        </Link>
      </div>
      
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li className="animate-fade-in">
            <Link 
              href="/#features" 
              className="hover:bg-primary hover:text-primary-content transition-all duration-300 min-h-[44px] touch-manipulation"
            >
              Features
            </Link>
          </li>
          <li className="animate-fade-in animate-delay-100">
            <Link 
              href="/#how-it-works" 
              className="hover:bg-primary hover:text-primary-content transition-all duration-300 min-h-[44px] touch-manipulation"
            >
              How It Works
            </Link>
          </li>
          <li className="animate-fade-in animate-delay-200">
            <Link 
              href="/#testimonials" 
              className="hover:bg-primary hover:text-primary-content transition-all duration-300 min-h-[44px] touch-manipulation"
            >
              Testimonials
            </Link>
          </li>
          <li className="animate-fade-in animate-delay-300">
            <Link 
              href="/#faq" 
              className="hover:bg-primary hover:text-primary-content transition-all duration-300 min-h-[44px] touch-manipulation"
            >
              FAQ
            </Link>
          </li>
        </ul>
      </div>
      
      <div className="navbar-end">
        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeSwitcher />
          <Link 
            href={process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://agent.mythos.co"} 
            className="btn btn-primary btn-sm sm:btn-md min-h-[44px] px-3 sm:px-6 text-sm sm:text-base animate-bounce-in animate-delay-400 hover:animate-pulse-soft touch-manipulation"
          >
            <span className="hidden sm:inline">Launch dApp</span>
            <span className="sm:hidden">Launch</span>
          </Link>
        </div>
      </div>
    </div>
  );
}