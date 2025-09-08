'use client'

import { useState } from 'react';
import Link from 'next/link'
import ThemeSwitcher from './ThemeSwitcher';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../lib/contexts/AuthContext';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = usePathname();
  const { user, logout, isAuthenticated } = useAuth();

  return (
    <div className="navbar bg-base-100 sticky top-0 z-50 shadow-md animate-fade-in">
      <div className="navbar-start">
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-ghost lg:hidden transition-all duration-300" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" /></svg>
          </label>
          {isMenuOpen && (
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52 animate-slide-up">
              <li className="animate-fade-in"><Link href="/#features" className="hover:bg-primary hover:text-primary-content transition-all duration-300">Features</Link></li>
              <li className="animate-fade-in animate-delay-100"><Link href="/#features" className="hover:bg-primary hover:text-primary-content transition-all duration-300">How It Works</Link></li>
              <li className="animate-fade-in animate-delay-200"><Link href="/#testimonials" className="hover:bg-primary hover:text-primary-content transition-all duration-300">Testimonials</Link></li>
              <li className="animate-fade-in animate-delay-300"><Link href="/#faq" className="hover:bg-primary hover:text-primary-content transition-all duration-300">FAQ</Link></li>
            </ul>
          )}
        </div>
        <Link href="/" className="btn btn-ghost text-xl animate-fade-in">Myth.OS</Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li className="animate-fade-in"><Link href={process.env.NODE_ENV === "development" ? "http://localhost:3001" : "https://reply.mythos.co"} className="hover:bg-primary hover:text-primary-content transition-all duration-300">Reply Agent</Link></li>
        </ul>
      </div>
      <div className="navbar-end">
        <div className="flex items-center gap-2">
          {isAuthenticated && user && (
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                <div className="w-8 rounded-full bg-primary text-primary-content flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <ul tabIndex={0} className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-52">
                <li className="menu-title">
                  <span>Account</span>
                </li>
                <li>
                  <a className="text-xs opacity-70 cursor-default">
                    {user.accountId}
                  </a>
                </li>
                <div className="divider my-1"></div>
                <li>
                  <button onClick={logout} className="text-error hover:bg-error hover:text-error-content">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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