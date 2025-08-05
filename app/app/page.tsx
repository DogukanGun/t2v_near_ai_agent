'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function Home() {
  const [activeTab, setActiveTab] = useState('how-it-works')
  const [activeFaq, setActiveFaq] = useState<number | null>(null)

  const toggleFaq = (index: number) => {
    if (activeFaq === index) {
      setActiveFaq(null)
    } else {
      setActiveFaq(index)
    }
  }

  const faqs = [
    {
      question: "What is Myth.OS?",
      answer: "Myth.OS is a comprehensive platform that enables you to create, deploy, and manage intelligent marketing agents across both Web3 blockchain networks and traditional Web2 platforms. Our AI-powered system seamlessly bridges decentralized and centralized ecosystems, making it easy to build sophisticated cross-platform marketing agents without extensive coding knowledge."
    },
    {
      question: "How does Myth.OS work?",
      answer: "Myth.OS uses advanced AI to translate your marketing requirements into functional autonomous agents. Simply describe what marketing tasks you want your agent to perform, and our system will generate, test, and deploy it for you. You can then monitor and optimize its performance through our dashboard."
    },
    {
      question: "What can I build with Myth.OS?",
      answer: "You can build a wide range of marketing-focused autonomous agents, including social media campaign managers, customer engagement bots, content distribution systems, influencer outreach coordinators, analytics collectors, and much more. If it's related to blockchain marketing, Myth.OS can help you build it."
    },
    {
      question: 'Are the agents secure?',
      answer: 'Yes, our agents undergo rigorous security testing and auditing. We implement industry-standard security practices and continuously monitor for potential vulnerabilities.'
    },
    {
      question: 'Can I customize my agents?',
      answer: 'Absolutely! You can customize your agents\'s behavior, tasks, and triggers using our intuitive interface or through code if you prefer more granular control.'
    },
    {
      question: 'What kind of support do you offer?',
      answer: 'We offer comprehensive support including documentation, tutorials, community forums, and direct technical assistance for enterprise customers.'
    }
  ]

  const blockchains = [
    'Ethereum',
    'Arbitrum',
    'Optimism',
    'Base',
    'Polygon',
    'Avalanche',
    'BNB Chain',
    'NEAR'
  ]

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <div className="hero min-h-screen gradient-hero">
        <div className="hero-content text-center">
          <div className="max-w-4xl">
            <h1 className="text-7xl md:text-8xl font-bold mb-6 hero-title animate-fade-in">Myth.OS</h1>
            <p className="text-2xl md:text-3xl mb-8 hero-subtitle animate-fade-in animate-delay-200 text-white font-light tracking-wide">Design, deploy, and manage intelligent marketing agents powered by advanced AI—across Web3 blockchains and Web2 platforms</p>
            <p className="text-lg md:text-xl pb-8 hero-description text-gray-200 max-w-3xl mx-auto leading-relaxed">
              Revolutionize your blockchain marketing with AI-powered autonomous agents. Secure, efficient, and intelligent marketing automation at your fingertips.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6 animate-fade-in animate-delay-400">
              <a href="https://6e0907dab094d1512a9b569584b75b0ac17fa88f-5678.dstack-prod5.phala.network/form/e59e78eb-05e0-4c94-b53b-15c9e83045f5" className="floating-btn btn btn-primary btn-lg text-lg px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 border-none text-white hover:from-purple-700 hover:to-pink-700 transform transition-all duration-300">
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Launch dApp
                </span>
              </a>
              <a href="/docs" className="floating-btn btn btn-outline btn-lg text-lg px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-gray-900 backdrop-blur-sm bg-white/10 transform transition-all duration-300">
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View Documentation
                </span>
              </a>
            </div>
            
            {/* Floating elements */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-white rounded-full opacity-60 animate-ping" style={{animationDelay: '0s'}}></div>
              <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-purple-300 rounded-full opacity-80 animate-ping" style={{animationDelay: '1s'}}></div>
              <div className="absolute bottom-1/3 left-1/3 w-1.5 h-1.5 bg-pink-300 rounded-full opacity-70 animate-ping" style={{animationDelay: '2s'}}></div>
              <div className="absolute top-1/2 right-1/3 w-1 h-1 bg-cyan-300 rounded-full opacity-60 animate-ping" style={{animationDelay: '3s'}}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Supported Blockchains */}
      <div className="bg-base-100 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 animate-fade-in">Marketing on These Blockchain Networks</h2>
          <p className="text-center mb-8 animate-fade-in animate-delay-100">Deploy your autonomous agents across multiple leading blockchain networks</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 justify-items-center">
            {blockchains.map((chain, index) => (
              <div key={index} className={`flex flex-col items-center animate-bounce-in animate-delay-${(index % 5) * 100}`}>
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mb-3 hover:animate-pulse-soft">
                  <span className="text-primary-content text-xl font-bold">{chain.charAt(0)}</span>
                </div>
                <span className="font-medium">{chain}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="container mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-4 animate-fade-in">Powered by Advanced Technology</h2>
        <p className="text-center mb-12 animate-fade-in animate-delay-100">Our platform combines cutting-edge AI with blockchain technology to deliver a seamless agent creation experience.</p>
        
        <div className="tabs tabs-boxed flex justify-center mb-12 animate-fade-in animate-delay-200">
          <a 
            className={`tab ${activeTab === 'features' ? 'tab-active' : ''} transition-all duration-300 ease-in-out`}
            onClick={() => setActiveTab('features')}
          >
            Features
          </a>
          <a 
            className={`tab ${activeTab === 'how-it-works' ? 'tab-active' : ''} transition-all duration-300 ease-in-out`}
            onClick={() => setActiveTab('how-it-works')}
          >
            How It Works
          </a>
        </div>

        {activeTab === 'features' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 animate-slide-up">
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="card-body">
                <h3 className="card-title animate-fade-in">AI-Powered Marketing Generation</h3>
                <p className="animate-fade-in animate-delay-100">Leverage advanced AI models to automatically create and manage marketing-focused autonomous agents.</p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="card-body">
                <h3 className="card-title animate-fade-in animate-delay-200">Secure by Design</h3>
                <p className="animate-fade-in animate-delay-300">Built-in security checks and best practices ensure your marketing agents are protected against vulnerabilities.</p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="card-body">
                <h3 className="card-title animate-fade-in animate-delay-400">Custom Marketing Logic</h3>
                <p className="animate-fade-in animate-delay-500">Easily implement complex marketing strategies with our intuitive agent creation interface.</p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="card-body">
                <h3 className="card-title animate-fade-in">Cross-Chain Compatible</h3>
                <p className="animate-fade-in animate-delay-100">Deploy your autonomous agents across multiple blockchain networks with ease.</p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="card-body">
                <h3 className="card-title animate-fade-in animate-delay-200">Automated Campaign Monitoring</h3>
                <p className="animate-fade-in animate-delay-300">Continuous performance analysis and optimization suggestions for your marketing campaigns.</p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="card-body">
                <h3 className="card-title animate-fade-in animate-delay-400">Conversational No-Code Builder</h3>
                <p className="animate-fade-in animate-delay-500">Describe what you want in natural language; Myth.OS handles the implementation for you.</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'how-it-works' && (
          <div id="how-it-works" className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-slide-up">
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="card-body items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mb-4 animate-bounce-in">
                  <span className="text-primary-content font-bold">01</span>
                </div>
                <h3 className="card-title animate-fade-in">Define Marketing Requirements</h3>
                <p className="animate-fade-in animate-delay-100">Specify your marketing agent requirements using natural language or our intuitive interface.</p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="card-body items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mb-4 animate-bounce-in animate-delay-200">
                  <span className="text-primary-content font-bold">02</span>
                </div>
                <h3 className="card-title animate-fade-in animate-delay-200">AI Marketing Generation</h3>
                <p className="animate-fade-in animate-delay-300">Our AI system generates optimal marketing agent code and configuration based on your specifications.</p>
              </div>
            </div>
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300">
              <div className="card-body items-center text-center">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center mb-4 animate-bounce-in animate-delay-400">
                  <span className="text-primary-content font-bold">03</span>
                </div>
                <h3 className="card-title animate-fade-in animate-delay-400">Deploy & Monitor</h3>
                <p className="animate-fade-in animate-delay-500">Deploy your marketing agents with one click and monitor their campaign performance in real-time.</p>
              </div>
            </div>
          </div>
        )}
        
      {/* Testimonials - Now placed outside of tab structure */}
      <div id="testimonials" className="bg-base-200 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 animate-fade-in">What Our Users Say</h2>
          
          {/* Single testimonial centered */}
          <div className="flex justify-center animate-slide-up">
            <div className="card bg-base-100 shadow-xl max-w-2xl hover:shadow-2xl transition-all duration-300">
              <div className="card-body items-center text-center">
                <div className="avatar mb-6 animate-bounce-in">
                  <div className="w-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                    <img src="/ines.jpeg" alt="Dr. Ines O'Donovan" className="rounded-full" />
                  </div>
                </div>
                <blockquote className="text-lg mb-6 animate-fade-in animate-delay-200 italic leading-relaxed max-w-xl">
                  "Since integrating Myth.OS into our platform at Jeunessima Magazine, we've seen early signs of improved engagement. With AI-powered agents optimizing ad targeting and placement, we expect to see a 25% boost in interaction rates over the coming months."
                </blockquote>
                <div className="animate-fade-in animate-delay-300">
                  <h3 className="text-xl font-bold text-primary mb-1">Dr. Ines O'Donovan, PhD</h3>
                  <p className="text-lg font-semibold text-secondary mb-1">The Ageless Futurist</p>
                  <p className="text-base font-medium text-accent">CEO, Jeunessima Magazine</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      </div>

      {/* Call to Action */}
      <div className="bg-primary text-primary-content py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 animate-fade-in">Ready to Transform Your Blockchain Marketing?</h2>
          <p className="mb-8 max-w-2xl mx-auto animate-fade-in animate-delay-100">Join the growing community of blockchain projects leveraging AI-powered autonomous agents for their marketing needs.</p>
          <button className="btn btn-secondary btn-lg animate-bounce-in animate-delay-200 hover:animate-pulse-soft">Get Started Today</button>
        </div>
      </div>

      {/* FAQ Section */}
      <div id="faq" className="container mx-auto py-16 px-4">
        <h2 className="text-3xl font-bold text-center mb-12 animate-fade-in">Frequently Asked Questions</h2>
        <p className="text-center mb-8 animate-fade-in animate-delay-100">Everything you need to know about our AI-powered autonomous agents platform</p>
        
        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`collapse collapse-arrow bg-base-100 mb-4 animate-fade-in animate-delay-${index * 100} hover:shadow-md transition-all duration-300`}
            >
              <input 
                type="radio" 
                name="faq-accordion" 
                checked={activeFaq === index}
                onChange={() => toggleFaq(index)}
                className="min-h-[3rem]" 
              />
              <div className="collapse-title text-xl font-medium min-h-[3rem] flex items-center">
                {faq.question}
              </div>
              <div className="collapse-content">
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="footer p-10 bg-neutral text-neutral-content">
        <div className="animate-fade-in">
          <span className="footer-title">Services</span> 
          <a className="link link-hover transition-all duration-300">Branding</a>
          <a className="link link-hover transition-all duration-300">Design</a>
          <a className="link link-hover transition-all duration-300">Marketing</a>
          <a className="link link-hover transition-all duration-300">Advertisement</a>
        </div> 
        <div className="animate-fade-in animate-delay-100">
          <span className="footer-title">Company</span> 
          <a className="link link-hover transition-all duration-300">About us</a>
          <a className="link link-hover transition-all duration-300">Contact</a>
          <a className="link link-hover transition-all duration-300">Jobs</a>
          <a className="link link-hover transition-all duration-300">Press kit</a>
        </div> 
        <div className="animate-fade-in animate-delay-200">
          <span className="footer-title">Legal</span> 
          <a className="link link-hover transition-all duration-300">Terms of use</a>
          <a className="link link-hover transition-all duration-300">Privacy policy</a>
          <a className="link link-hover transition-all duration-300">Cookie policy</a>
        </div>
      </footer>
    </main>
  )
}