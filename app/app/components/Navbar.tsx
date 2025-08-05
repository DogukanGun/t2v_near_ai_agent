'use client'

import { useState } from 'react';
import Link from 'next/link'
import ThemeSwitcher from './ThemeSwitcher';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  };

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
              <li className="animate-fade-in animate-delay-100"><Link href="/#how-it-works" className="hover:bg-primary hover:text-primary-content transition-all duration-300">How It Works</Link></li>
              <li className="animate-fade-in animate-delay-200"><Link href="/#testimonials" className="hover:bg-primary hover:text-primary-content transition-all duration-300">Testimonials</Link></li>
              <li className="animate-fade-in animate-delay-300"><Link href="/#faq" className="hover:bg-primary hover:text-primary-content transition-all duration-300">FAQ</Link></li>
            </ul>
          )}
        </div>
        <Link href="/" className="btn btn-ghost text-xl animate-fade-in">Myth.OS</Link>
      </div>
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li className="animate-fade-in"><Link href="/#features" className="hover:bg-primary hover:text-primary-content transition-all duration-300">Features</Link></li>
          <li className="animate-fade-in animate-delay-100"><Link href="/#how-it-works" className="hover:bg-primary hover:text-primary-content transition-all duration-300">How It Works</Link></li>
          <li className="animate-fade-in animate-delay-200"><Link href="/#testimonials" className="hover:bg-primary hover:text-primary-content transition-all duration-300">Testimonials</Link></li>
          <li className="animate-fade-in animate-delay-300"><Link href="/#faq" className="hover:bg-primary hover:text-primary-content transition-all duration-300">FAQ</Link></li>
        </ul>
      </div>
      <div className="navbar-end">
        <ThemeSwitcher />
        <Link href="https://6e0907dab094d1512a9b569584b75b0ac17fa88f-5678.dstack-prod5.phala.network/form/e59e78eb-05e0-4c94-b53b-15c9e83045f5" className="btn btn-primary ml-2 animate-bounce-in animate-delay-400 hover:animate-pulse-soft">Launch dApp</Link>
      </div>
    </div>
  );
}