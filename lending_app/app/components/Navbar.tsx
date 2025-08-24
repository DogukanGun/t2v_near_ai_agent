'use client'

import { useState } from 'react';
import Link from 'next/link'
import ThemeSwitcher from './ThemeSwitcher';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = usePathname();

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
          <li className="animate-fade-in"><Link href="/#features" className="hover:bg-primary hover:text-primary-content transition-all duration-300">Features</Link></li>
          <li className="animate-fade-in animate-delay-100"><Link href="/#features" className="hover:bg-primary hover:text-primary-content transition-all duration-300">How It Works</Link></li>
          <li className="animate-fade-in animate-delay-200"><Link href="/#testimonials" className="hover:bg-primary hover:text-primary-content transition-all duration-300">Testimonials</Link></li>
          <li className="animate-fade-in animate-delay-300"><Link href="/#faq" className="hover:bg-primary hover:text-primary-content transition-all duration-300">FAQ</Link></li>
          <li className="animate-fade-in"><Link href={process.env.NODE_ENV === "development" ? "http://localhost:3001" : "https://reply.mythos.co"} className="hover:bg-primary hover:text-primary-content transition-all duration-300">Reply Agent</Link></li>
        </ul>
      </div>
      <div className="navbar-end">
        <ThemeSwitcher />
        <Link href={process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://agent.mythos.co"} className="btn btn-primary ml-2 animate-bounce-in animate-delay-400 hover:animate-pulse-soft">Launch dApp</Link>
      </div>
    </div>
  );
}