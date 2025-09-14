'use client'

import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function Home() {
  console.log('🏠 Landing page loaded - modern Apex-inspired design');

  return (
    <div className="min-h-screen bg-hero-gradient text-gray-900">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="section-container py-20 lg:py-32">
          <div className="text-center relative z-10">
            <div className="animate-fade-in">
              <div className="inline-flex items-center bg-white/70 backdrop-blur-sm border border-gray-300 rounded-full px-4 py-2 mb-8">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                <span className="text-sm text-gray-600">New: Multi-account support now available</span>
              </div>
              
                              {/* Brand Partnership */}
                <div className="mb-12">
                  <div className="flex items-center justify-center space-x-6 bg-white/50 backdrop-blur-sm rounded-2xl px-8 py-4 max-w-md mx-auto border border-gray-200">
                    <div className="text-xl font-bold text-gray-700">
                      Openserv
                    </div>
                    <div className="text-2xl text-gray-400 font-light">×</div>
                    <div className="mythos-logo mythos-logo-small">
                      <span className="mythos-logo-text">myth.os</span>
                      <div className="mythos-logo-icon"></div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 text-center mt-3">Powered by</p>
                </div>

              <h1 className="text-5xl lg:text-7xl font-black mb-6 text-shadow">
                <span className="gradient-text">Build brand</span>
                <br />
                <span className="text-gray-800">in minutes,</span>
                <br />
                <span className="text-gray-600">not hours.</span>
              </h1>
              
              <p className="text-xl lg:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
                The best automation strategies used by the fastest growing accounts on 𝕏.
              </p>
              
              {/* Competitive Edge */}
              <div className="bg-gradient-to-r from-primary-50 to-accent-50 rounded-2xl p-6 mb-12 max-w-4xl mx-auto border border-primary-200">
                <div className="flex items-center justify-center space-x-8 text-sm">
                  <div className="flex items-center space-x-2 text-green-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold">3x faster than competitors</span>
                  </div>
                  <div className="flex items-center space-x-2 text-blue-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold">No rate limits</span>
                  </div>
                  <div className="flex items-center space-x-2 text-purple-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold">Advanced AI replies</span>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                <Link href="/auth/signin" className="btn-primary text-lg px-8 py-4">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  <span>Try My Agent</span>
                </Link>
                <Link href="/docs" className="btn-outline text-lg px-8 py-4">
                  <span>Learn More</span>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              
              <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">P</div>
                  <span>Uneed POTD1 Badge</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">T</div>
                  <span>Featured on TAAFT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-300/20 rounded-full blur-3xl animate-float"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent-300/20 rounded-full blur-3xl animate-float" style={{animationDelay: '2s'}}></div>
          
          {/* Mascot Cat */}
          <div className="absolute top-20 right-20 animate-float" style={{animationDelay: '1s'}}>
            <div className="pixel-cat">
              <div className="cat-body"></div>
              <div className="cat-face"></div>
              <div className="cat-ears"></div>
              <div className="cat-eyes"></div>
              <div className="cat-mouth"></div>
              <div className="cat-legs"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/30">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6 text-gray-800">
              Work <span className="gradient-text">smart</span>, not hard
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The best automation strategies used by the fastest growing accounts on 𝕏
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card group animate-slide-up relative">
              <div className="text-4xl mb-4 group-hover:animate-float">📋</div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">𝕏 List Replies</h3>
              <p className="text-gray-600 text-sm">
                <strong className="text-primary-600">Warm up leads to your offer</strong><br />
                Automatically nurture and prepare potential leads before presenting your main offer.
              </p>
              <div className="absolute -top-2 -right-2 opacity-30">
                <div className="pixel-cat" style={{transform: 'scale(0.5)'}}></div>
              </div>
            </div>
            
            <div className="card group animate-slide-up" style={{animationDelay: '0.1s'}}>
              <div className="text-4xl mb-4 group-hover:animate-float">🎯</div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Keyword Replies</h3>
              <p className="text-gray-600 text-sm">
                <strong className="text-primary-600">Insert your brand into relevant conversations</strong><br />
                Stay on top of important threads by replying to keywords in your niche.
              </p>
            </div>
            
            <div className="card group animate-slide-up" style={{animationDelay: '0.2s'}}>
              <div className="text-4xl mb-4 group-hover:animate-float">⚡</div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Chrome Extension</h3>
              <p className="text-gray-600 text-sm">
                <strong className="text-primary-600">Engage 100x faster</strong><br />
                Boost your engagement speed with our powerful browser extension.
              </p>
            </div>
            
            <div className="card group animate-slide-up" style={{animationDelay: '0.3s'}}>
              <div className="text-4xl mb-4 group-hover:animate-float">📊</div>
              <h3 className="text-xl font-bold mb-3 text-gray-800">Analytics Dashboard</h3>
              <p className="text-gray-600 text-sm">
                <strong className="text-primary-600">Track your growth and performance</strong><br />
                Monitor your engagement metrics, growth trends, and campaign performance in real-time.
              </p>
            </div>
          </div>
          
          {/* Competitive Comparison */}
          <div className="mt-20">
            <div className="text-center mb-12">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Why choose MythosReply over competitors?</h3>
              <p className="text-gray-600 max-w-2xl mx-auto">See how we stack up against other social media automation tools</p>
            </div>
            
            <div className="bg-white/80 rounded-2xl p-8 max-w-5xl mx-auto border border-gray-200 shadow-lg">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="lg:col-span-1">
                  <h4 className="font-semibold text-gray-800 mb-4">Features</h4>
                </div>
                <div className="text-center">
                  <div className="font-bold text-primary-600 mb-2">MythosReply</div>
                  <div className="text-sm text-gray-500">Us</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-gray-600 mb-2">ReplySocial</div>
                  <div className="text-sm text-gray-500">Competitor</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-gray-600 mb-2">Others</div>
                  <div className="text-sm text-gray-500">Market</div>
                </div>
              </div>
              
              <div className="mt-6 space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 py-3 border-b border-gray-100">
                  <div className="font-medium text-gray-700">Multi-account support</div>
                  <div className="text-center text-green-600">✓ Unlimited</div>
                  <div className="text-center text-yellow-600">✓ Limited</div>
                  <div className="text-center text-red-600">✗ Single only</div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 py-3 border-b border-gray-100">
                  <div className="font-medium text-gray-700">AI-powered replies</div>
                  <div className="text-center text-green-600">✓ Advanced GPT</div>
                  <div className="text-center text-yellow-600">✓ Basic</div>
                  <div className="text-center text-red-600">✗ Manual only</div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 py-3 border-b border-gray-100">
                  <div className="font-medium text-gray-700">Real-time analytics</div>
                  <div className="text-center text-green-600">✓ Advanced</div>
                  <div className="text-center text-red-600">✗ None</div>
                  <div className="text-center text-yellow-600">✓ Basic</div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 py-3">
                  <div className="font-medium text-gray-700">Setup time</div>
                  <div className="text-center text-green-600">&lt; 2 minutes</div>
                  <div className="text-center text-yellow-600">10+ minutes</div>
                  <div className="text-center text-red-600">30+ minutes</div>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Testimonials */}
          <div className="mt-20 text-center">
            <div className="grid md:grid-cols-4 gap-6 max-w-6xl mx-auto">
              <div className="card text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-lg">
                  G
                </div>
                <p className="text-gray-600 mb-4">"Switched from ReplySocial. 3x better results!"</p>
                <p className="text-primary-600 font-semibold">Growth</p>
              </div>
              
              <div className="card text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-lg">
                  T
                </div>
                <p className="text-gray-600 mb-4">"Way faster setup than competitors. Love the AI!"</p>
                <p className="text-primary-600 font-semibold">Taylin</p>
              </div>
              
              <div className="card text-center relative">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-lg">
                  T
                </div>
                <p className="text-gray-600 mb-4">"Purr-fect automation! 🐱 Finally, a tool that actually works as promised."</p>
                <p className="text-primary-600 font-semibold">Tommy</p>
                <div className="absolute bottom-2 right-2 opacity-20">
                  <div className="text-green-500 text-xs">🟩🟩</div>
                </div>
              </div>
              
              <div className="card text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-lg">
                  D
                </div>
                <p className="text-gray-600 mb-4">"Best ROI I've seen from any automation tool."</p>
                <p className="text-primary-600 font-semibold">David</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6 text-gray-800">
              Get to know <span className="gradient-text">MythosReply</span>
            </h2>
            <p className="text-xl text-gray-600">
              <strong>Seamless login with official 𝕏 API.</strong>
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="card">
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Automated Replies:</h3>
                <p className="text-gray-600 mb-4">
                  Capture <strong className="text-primary-600">your voice</strong> in profile settings, 
                  reply to <strong className="text-primary-600">X lists</strong>, & comment on posts with 
                  <strong className="text-primary-600"> target keywords</strong>.
                </p>
              </div>
              
              <div className="card">
                <h3 className="text-2xl font-bold mb-4 text-gray-800">Chrome Extension:</h3>
                <p className="text-gray-600 mb-4">
                  Turn engagement into a video game. Augment your engagement flow with 
                  <strong className="text-primary-600"> AI</strong>, 
                  <strong className="text-primary-600"> hotkeys</strong>, and your 
                  <strong className="text-primary-600"> personal touch</strong>.
                </p>
              </div>
            </div>
            
            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center text-white font-bold text-xl">
                S
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Take MythosReply for a spin</h3>
              <p className="text-gray-600 mb-6">
                "Ready to scale your presence with automated engagement?"
              </p>
              <p className="text-primary-600 font-semibold mb-6">Shayan</p>
              <Link href="/auth/signin" className="btn-primary w-full justify-center">
                <span>Get Started Now</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white/30">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-6 text-gray-800">FAQ</h2>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="card">
              <h3 className="text-xl font-bold mb-3 text-gray-800">How does MythosReply work?</h3>
              <p className="text-gray-600">
                MythosReply uses the official X API to automatically engage with accounts and posts you specify. 
                You can set up automatic replies to accounts in your X lists or to posts containing specific keywords.
              </p>
            </div>
            
            <div className="card">
              <h3 className="text-xl font-bold mb-3 text-gray-800">Is it safe to use?</h3>
              <p className="text-gray-600">
                Yes! MythosReply uses official X API endpoints and follows all platform guidelines. 
                Your account credentials are never stored - authentication is handled directly through X.
              </p>
            </div>
            
            <div className="card">
              <h3 className="text-xl font-bold mb-3 text-gray-800">Does it sound robotic?</h3>
              <p className="text-gray-600">
                MythosReply combines automated engagement with your personal voice. You set the tone and style 
                of replies, and MythosReply handles the execution - giving you consistent engagement without losing authenticity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="section-container">
          <div className="card text-center max-w-4xl mx-auto">
            <div className="relative">
              <h2 className="text-3xl lg:text-5xl font-bold mb-6 text-gray-800">
                Take <span className="gradient-text">MythosReply</span> for a spin
              </h2>
              <div className="absolute -top-4 -right-8 opacity-30 hidden lg:block">
                <div className="pixel-cat" style={{transform: 'scale(0.7)'}}></div>
              </div>
            </div>
            <p className="text-xl text-gray-600 mb-8">
              Automate your X/Twitter engagement with AI-powered replies. 
              Grow your audience and build meaningful connections. 🐾
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signin" className="btn-primary text-lg px-8 py-4">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                <span>Start Free Trial</span>
              </Link>
              <Link href="/waitlist" className="btn-secondary text-lg px-8 py-4">
                <span>Join Waitlist</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-300">
        <div className="section-container">
          <div className="flex flex-col md:flex-row justify-between items-start mb-8">
            <div className="mb-6 md:mb-0">
              <h3 className="text-2xl font-bold gradient-text mb-2">MythosReply</h3>
              <p className="text-gray-600 mt-2 max-w-md">
                Automate your X/Twitter engagement with AI-powered replies. Grow your audience and build meaningful connections.
              </p>
              <div className="flex items-center space-x-4 mt-4">
                <svg className="w-5 h-5 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </div>
              <div className="flex items-center space-x-3 mt-4 text-sm text-gray-500">
                <span>Powered by</span>
                <div className="flex items-center space-x-2">
                  <div className="font-semibold text-gray-600">Openserv</div>
                  <div className="text-gray-400">×</div>
                  <div className="mythos-logo mythos-logo-small">
                    <span className="mythos-logo-text">myth.os</span>
                    <div className="mythos-logo-icon"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div>
                <h4 className="text-gray-800 font-semibold mb-4">Navigation</h4>
                <div className="space-y-2">
                  <Link href="/docs" className="block text-gray-600 hover:text-gray-800 transition-colors text-sm">
                    BLOG
                  </Link>
                  <Link href="/waitlist" className="block text-gray-600 hover:text-gray-800 transition-colors text-sm">
                    MCP
                  </Link>
                  <Link href="/dashboard" className="block text-gray-600 hover:text-gray-800 transition-colors text-sm">
                    DASHBOARD
                  </Link>
                </div>
              </div>
              
              <div>
                <h4 className="text-gray-800 font-semibold mb-4">Free Tools</h4>
                <div className="space-y-2">
                  <Link href="#" className="block text-gray-600 hover:text-gray-800 transition-colors text-sm">
                    BIO GENERATOR
                  </Link>
                  <Link href="#" className="block text-gray-600 hover:text-gray-800 transition-colors text-sm">
                    AI TWEET GENERATOR
                  </Link>
                  <Link href="#" className="block text-gray-600 hover:text-gray-800 transition-colors text-sm">
                    AI TWEET REPLY GENERATOR
                  </Link>
                  <Link href="#" className="block text-gray-600 hover:text-gray-800 transition-colors text-sm">
                    VIRAL TWEET TEMPLATES
                  </Link>
                  <Link href="#" className="block text-gray-600 hover:text-gray-800 transition-colors text-sm">
                    FAKE TWEET GENERATOR
                  </Link>
                  <Link href="#" className="block text-gray-600 hover:text-gray-800 transition-colors text-sm">
                    FAKE TWEET WITH REPLY
                  </Link>
                  <Link href="#" className="block text-gray-600 hover:text-gray-800 transition-colors text-sm">
                    TWITTER ID FINDER
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-300 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-600 text-sm mb-4 md:mb-0">
              Developed by Viral Automation Technologies • © 2025
            </p>
            <button className="text-gray-600 hover:text-gray-800 text-sm transition-colors">
              Open feedback form
            </button>
          </div>
        </div>
      </footer>
    </div>
  )
}
