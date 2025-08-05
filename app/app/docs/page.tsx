'use client'

import React, { useState } from 'react'

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState('getting-started')

  const sections = [
    { id: 'getting-started', title: 'Getting Started', icon: '🚀' },
    { id: 'platform-overview', title: 'Platform Overview', icon: '🔍' },
    { id: 'agent-creation', title: 'Agent Creation', icon: '🤖' },
    { id: 'deployment', title: 'Deployment', icon: '📦' },
    { id: 'web3-integration', title: 'Web3 Integration', icon: '⛓️' },
    { id: 'web2-platforms', title: 'Web2 Platforms', icon: '🌐' },
    { id: 'ai-features', title: 'AI Features', icon: '🧠' },
    { id: 'monitoring', title: 'Monitoring & Analytics', icon: '📊' },
    { id: 'api-reference', title: 'API Reference', icon: '📚' },
    { id: 'troubleshooting', title: 'Troubleshooting', icon: '🔧' }
  ]

  const renderContent = () => {
    switch (activeSection) {
      case 'getting-started':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-primary mb-4">🚀 Getting Started with Myth.OS</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-lg mb-6">Welcome to Myth.OS! This guide will help you create your first intelligent marketing agent in minutes.</p>
              
              <div className="steps steps-vertical lg:steps-horizontal w-full mb-8">
                <div className="step step-primary">Sign Up</div>
                <div className="step step-primary">Create Agent</div>
                <div className="step step-primary">Configure</div>
                <div className="step step-primary">Deploy</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <h3 className="card-title text-secondary">📋 Prerequisites</h3>
                    <ul className="list-disc list-inside space-y-2">
                      <li>Basic understanding of marketing concepts</li>
                      <li>Wallet setup (for Web3 features)</li>
                      <li>API keys for target platforms</li>
                    </ul>
                  </div>
                </div>
                
                <div className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <h3 className="card-title text-accent">⚡ Quick Start</h3>
                    <div className="space-y-2">
                      <div className="badge badge-outline">5 min setup</div>
                      <div className="badge badge-outline">No coding required</div>
                      <div className="badge badge-outline">AI-powered</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="alert alert-info">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span>New to blockchain marketing? Check out our <strong>Platform Overview</strong> section first!</span>
              </div>
            </div>
          </div>
        );
      
      case 'platform-overview':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-primary mb-4">🔍 Platform Overview</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-lg mb-6">Myth.OS is a comprehensive platform that bridges Web3 and Web2 marketing through intelligent AI agents.</p>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="card bg-gradient-to-br from-primary to-secondary text-primary-content shadow-xl">
                  <div className="card-body text-center">
                    <h3 className="card-title justify-center text-2xl mb-4">🤖 AI Agents</h3>
                    <p>Autonomous marketing agents powered by advanced machine learning algorithms</p>
                  </div>
                </div>
                
                <div className="card bg-gradient-to-br from-secondary to-accent text-secondary-content shadow-xl">
                  <div className="card-body text-center">
                    <h3 className="card-title justify-center text-2xl mb-4">⛓️ Web3 Native</h3>
                    <p>Built-in support for all major blockchain networks and DeFi protocols</p>
                  </div>
                </div>
                
                <div className="card bg-gradient-to-br from-accent to-primary text-accent-content shadow-xl">
                  <div className="card-body text-center">
                    <h3 className="card-title justify-center text-2xl mb-4">🌐 Cross-Platform</h3>
                    <p>Seamless integration with traditional Web2 marketing platforms</p>
                  </div>
                </div>
              </div>

              <h3 className="text-2xl font-semibold mb-4">Core Features</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="badge badge-primary badge-lg">✓</div>
                  <span>Intelligent content generation</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="badge badge-primary badge-lg">✓</div>
                  <span>Automated campaign optimization</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="badge badge-primary badge-lg">✓</div>
                  <span>Real-time performance analytics</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="badge badge-primary badge-lg">✓</div>
                  <span>Multi-chain deployment</span>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'agent-creation':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-primary mb-4">🤖 Agent Creation</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-lg mb-6">Learn how to create and configure intelligent marketing agents tailored to your specific needs.</p>
              
              <div className="tabs tabs-boxed mb-6">
                <a className="tab tab-active">Visual Builder</a>
                <a className="tab">Code Editor</a>
                <a className="tab">Templates</a>
              </div>

              <div className="mockup-code mb-6">
                <pre data-prefix="1"><code>// Example: Creating a Twitter marketing agent</code></pre>
                <pre data-prefix="3"><code>  platform: 'twitter',</code></pre>
                <pre data-prefix="4"><code>  strategy: 'engagement',</code></pre>
                <pre data-prefix="5"><code>  target: 'crypto-enthusiasts'</code></pre>
              </div>

              <div className="alert alert-success">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span>Pro Tip: Use our pre-built templates to get started quickly!</span>
              </div>
            </div>
          </div>
        );
      
      case 'deployment':
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-primary mb-4">📦 Deployment</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-lg mb-6">Deploy your marketing agents across multiple platforms with one-click deployment.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="stat bg-base-100 shadow">
                  <div className="stat-figure text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                  </div>
                  <div className="stat-title">Deployment Time</div>
                  <div className="stat-value text-primary">&lt; 30s</div>
                </div>
                
                <div className="stat bg-base-100 shadow">
                  <div className="stat-figure text-secondary">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"></path></svg>
                  </div>
                  <div className="stat-title">Success Rate</div>
                  <div className="stat-value text-secondary">99.9%</div>
                </div>
                
                <div className="stat bg-base-100 shadow">
                  <div className="stat-figure text-accent">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
                  </div>
                  <div className="stat-title">Platforms</div>
                  <div className="stat-value text-accent">15+</div>
                </div>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-primary mb-4">📚 Documentation Section</h2>
            <p className="text-lg">Select a section from the sidebar to view detailed documentation.</p>
          </div>
        );
    }
  }

  return (
    <div className="min-h-screen bg-base-200">
      {/* Header */}
      <div className="bg-primary text-primary-content py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">📚 Myth.OS Documentation</h1>
          <p className="text-xl opacity-90">Complete guide to building intelligent marketing agents</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="card bg-base-100 shadow-xl sticky top-8">
              <div className="card-body p-4">
                <h3 className="card-title text-lg mb-4">📖 Table of Contents</h3>
                <ul className="menu menu-compact">
                  {sections.map((section) => (
                    <li key={section.id}>
                      <a
                        className={`${activeSection === section.id ? 'active' : ''}`}
                        onClick={() => setActiveSection(section.id)}
                      >
                        <span className="mr-2">{section.icon}</span>
                        {section.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body p-8">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-neutral text-neutral-content py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-4">Need help? Contact our support team or join our community.</p>
          <div className="flex justify-center space-x-4">
            <button className="btn btn-outline btn-sm">💬 Discord</button>
            <button className="btn btn-outline btn-sm">📧 Support</button>
            <button className="btn btn-outline btn-sm">📖 GitHub</button>
          </div>
        </div>
      </footer>
    </div>
  )
}