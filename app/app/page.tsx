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
            <p className="text-2xl md:text-3xl mb-8 hero-subtitle animate-fade-in animate-delay-200 text-white font-light tracking-wide">Design, deploy, and manage intelligent marketing agents powered by advanced AI, across Web3 blockchains and Web2 platforms</p>
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
              <a href="/docs" className="floating-btn btn btn-outline btn-lg text-lg px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-black backdrop-blur-sm bg-white/10 transform transition-all duration-300">
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
      <div className="relative py-24 bg-gradient-to-b from-base-100 to-base-200 overflow-hidden">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            Marketing on These Blockchain Networks
          </h2>
          <p className="text-xl text-center mb-16 max-w-2xl mx-auto text-black dark:text-black">
            Deploy your autonomous agents across multiple leading blockchain networks with seamless integration and optimal performance
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 justify-items-center max-w-5xl mx-auto">
            {blockchains.map((chain, index) => (
              <div 
                key={index} 
                className="group relative w-full max-w-[200px] aspect-square perspective-1000"
              >
                <div className="relative w-full h-full transition-all duration-500 transform-style-3d group-hover:rotate-y-180">
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary/90 to-primary p-6 rounded-2xl shadow-xl backface-hidden">
                    <span className="text-4xl font-bold text-primary-content">{chain.charAt(0)}</span>
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-secondary/90 to-secondary p-6 rounded-2xl shadow-xl backface-hidden rotate-y-180">
                    <span className="text-xl font-bold text-secondary-content text-center">{chain}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/30 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-pink-500/30 rounded-full filter blur-3xl"></div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="relative py-24 bg-base-100">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            Powered by Advanced Technology
          </h2>
          <p className="text-xl text-center mb-16 max-w-2xl mx-auto text-black dark:text-black">
            Our platform combines cutting-edge AI with blockchain technology to deliver a seamless agent creation experience
          </p>
          
          <div className="tabs tabs-boxed flex justify-center mb-16 bg-base-200 p-2 rounded-full max-w-md mx-auto">
            <button 
              className={`tab flex-1 rounded-full transition-all duration-300 ${activeTab === 'features' ? 'tab-active bg-primary text-primary-content' : ''}`}
              onClick={() => setActiveTab('features')}
            >
              Features
            </button>
            <button 
              className={`tab flex-1 rounded-full transition-all duration-300 ${activeTab === 'how-it-works' ? 'tab-active bg-primary text-primary-content' : ''}`}
              onClick={() => setActiveTab('how-it-works')}
            >
              How It Works
            </button>
          </div>

          {activeTab === 'features' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {[
                {
                  title: "AI-Powered Marketing Generation",
                  description: "Create sophisticated marketing campaigns with our advanced AI models that understand your goals and target audience.",
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )
                },
                {
                  title: "Secure by Design",
                  description: "Enterprise-grade security with continuous monitoring and automatic threat detection to protect your marketing operations.",
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  )
                },
                {
                  title: "Custom Marketing Logic",
                  description: "Build complex marketing strategies with our visual workflow builder and natural language processing.",
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                  )
                },
                {
                  title: "Cross-Chain Compatible",
                  description: "Seamlessly deploy and manage marketing campaigns across multiple blockchain networks from a single dashboard.",
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                  )
                },
                {
                  title: "Automated Campaign Monitoring",
                  description: "Real-time analytics and AI-driven insights to optimize your marketing performance across all channels.",
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  )
                },
                {
                  title: "Conversational No-Code Builder",
                  description: "Create marketing agents using natural language - no coding required. Our AI understands and implements your vision.",
                  icon: (
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  )
                }
              ].map((feature, index) => (
                <div 
                  key={index}
                  className="group relative bg-base-200 rounded-2xl p-8 hover:bg-gradient-to-br from-primary/10 to-secondary/10 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors duration-300 text-primary">
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                    <p className="text-black dark:text-black">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'how-it-works' && (
            <div className="relative">
              <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-primary/20 transform -translate-x-1/2 md:block hidden"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {[
                  {
                    step: "01",
                    title: "Define Marketing Requirements",
                    description: "Describe your marketing goals and target audience in natural language. Our AI understands your requirements and creates a tailored strategy."
                  },
                  {
                    step: "02",
                    title: "AI Marketing Generation",
                    description: "Our advanced AI analyzes your requirements and generates optimized marketing agents with built-in best practices and security measures."
                  },
                  {
                    step: "03",
                    title: "Deploy & Monitor",
                    description: "Launch your marketing campaigns with one click and track performance in real-time. Our AI continuously optimizes for better results."
                  }
                ].map((step, index) => (
                  <div 
                    key={index}
                    className="relative bg-base-200 rounded-2xl p-8 hover:bg-gradient-to-br from-primary/10 to-secondary/10 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full bg-primary text-primary-content flex items-center justify-center text-xl font-bold z-10">
                      {step.step}
                    </div>
                    <div className="pt-8">
                      <h3 className="text-xl font-bold mb-4 text-center">{step.title}</h3>
                      <p className="text-black dark:text-black text-center">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Testimonials */}
      <div id="testimonials" className="relative py-24 bg-gradient-to-b from-base-200 to-base-300">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center my-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            What Our Users Say
          </h2>
          
          <div className="max-w-4xl mt-20 mx-auto">
            <div className="relative bg-base-100 rounded-3xl p-8 md:p-12 shadow-2xl">
              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2">
                <div className="relative">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden ring-4 ring-primary">
                    <Image 
                      src="/ines.jpeg" 
                      alt="Dr. Ines O'Donovan" 
                      width={128} 
                      height={128} 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-primary text-primary-content rounded-full p-2">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z"/>
                    </svg>
                  </div>
                </div>
              </div>
              
              <div className="mt-12 text-center">
                <blockquote className="text-xl md:text-2xl italic mb-8 leading-relaxed">
                  &quot;Since integrating Myth.OS into our platform at Jeunessima Magazine, we&apos;ve seen early signs of improved engagement. With AI-powered agents optimizing ad targeting and placement, we expect to see a 25% boost in interaction rates over the coming months.&quot;
                </blockquote>
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-primary">Dr. Ines O&apos;Donovan, PhD</h3>
                  <p className="text-xl font-semibold text-secondary">The Ageless Futurist</p>
                  <p className="text-lg text-accent">CEO, Jeunessima Magazine</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-primary/20 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-secondary/20 rounded-full filter blur-3xl"></div>
        </div>
      </div>

      {/* FAQ Section */}
      <div id="faq" className="relative py-24 bg-base-100">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-center mb-16 max-w-2xl mx-auto text-black dark:text-black">
            Everything you need to know about our AI-powered autonomous agents platform
          </p>
          
          <div className="max-w-3xl mx-auto space-y-6">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className="group bg-base-200 rounded-2xl overflow-hidden hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 transition-all duration-300"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-8 py-6 flex items-center justify-between text-left"
                >
                  <span className="text-xl font-semibold">{faq.question}</span>
                  <span className={`transform transition-transform duration-300 ${activeFaq === index ? 'rotate-180' : ''}`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>
                <div 
                  className={`px-8 transition-all duration-300 ease-in-out overflow-hidden ${
                    activeFaq === index ? 'max-h-96 pb-6' : 'max-h-0'
                  }`}
                >
                  <p className="text-black dark:text-black">{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Background Elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/10 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-secondary/10 rounded-full filter blur-3xl"></div>
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