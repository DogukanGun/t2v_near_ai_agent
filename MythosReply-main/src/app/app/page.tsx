"use client";
import { useSession } from "next-auth/react";
import { useState } from "react";
import TwitterConnectButton from "@/components/TwitterConnectButton";
import TwitterProfileTracker from "@/components/TwitterProfileTracker";

export default function AppPage() {
  const { data: session, status } = useSession();
  const [tweetText, setTweetText] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [message, setMessage] = useState("");
  const [lastTweetUrl, setLastTweetUrl] = useState<string | null>(null);
  
  // Analytics and targeting states
  const [targetingPrompt, setTargetingPrompt] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);

  // Add comprehensive logging
  console.log('🔍 App Page - Session status:', status);
  console.log('📍 App Page - Full session:', session);
  console.log('🎯 App Page - Twitter ID:', session?.user?.twitterId);
  console.log('📝 App Page - Username:', session?.user?.username);
  console.log('👤 App Page - User ID:', session?.user?.id);

  const postTweet = async () => {
    if (!tweetText.trim()) return;
    
    console.log('🚀 Starting tweet post process...');
    console.log('📝 Tweet text:', tweetText);
    console.log('👤 Current user Twitter ID:', session?.user?.twitterId);
    
    setIsPosting(true);
    setMessage("");
    
    try {
      console.log('📡 Making API request to /api/twitter/post');
      const response = await fetch("/api/twitter/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: tweetText }),
      });
      
      console.log('📨 API Response status:', response.status);
      console.log('📨 API Response ok:', response.ok);
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('✅ Tweet post response:', responseData);
        
        if (responseData.success && responseData.tweetUrl) {
          setLastTweetUrl(responseData.tweetUrl);
          setMessage(responseData.message || `Tweet posted successfully!`);
        } else if (responseData.success) {
          setMessage(responseData.message || `Tweet posted successfully!`);
        } else {
          setMessage(`Tweet posted successfully! Response: ${JSON.stringify(responseData)}`);
        }
        setTweetText("");
      } else {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.error || 'Unknown error';
        console.log('❌ Tweet post error:', errorData);
        setMessage(`Error: ${errorMessage}`);
        setLastTweetUrl(null);
      }
    } catch (error) {
      console.log('💥 Tweet post exception:', error);
      setMessage(`Error: ${error}`);
      setLastTweetUrl(null);
    } finally {
      setIsPosting(false);
      console.log('🏁 Tweet post process completed');
    }
  };

  const analyzeAndSearch = async () => {
    if (!targetingPrompt.trim()) return;
    
    console.log('🎯 Starting AI analysis and automatic search...');
    setIsAnalyzing(true);
    setAnalysisResults(null);
    
    try {
      // Step 1: Generate targeting strategy
      console.log('📋 Step 1: Generating targeting strategy...');
      const targetingResponse = await fetch("/api/analytics/targeting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          prompt: targetingPrompt,
          generateSearches: false
        }),
      });
      
      if (!targetingResponse.ok) {
        throw new Error('Failed to generate targeting strategy');
      }
      
      const targetingData = await targetingResponse.json();
      console.log('✅ Targeting strategy generated:', targetingData.strategy);
      
      // Step 2: Automatically search using generated strategy
      console.log('🔍 Step 2: Searching tweets with generated strategy...');
      
      // Use the first generated search query
      const searchQuery = targetingData.strategy.searchQueries[0] || targetingData.strategy.keywords.join(' OR ');
      
      const searchResponse = await fetch("/api/analytics/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query: searchQuery,
          queryType: 'Latest'
        }),
      });
      
      if (!searchResponse.ok) {
        throw new Error('Failed to search tweets');
      }
      
      const searchData = await searchResponse.json();
      console.log('✅ Search completed:', searchData);
      
      // Combine results
      setAnalysisResults({
        strategy: targetingData.strategy,
        tweets: searchData.data.tweets,
        analysis: searchData.analysis,
        searchQuery: searchQuery
      });
      
      setMessage(`Analysis complete! Found ${searchData.data.tweets.length} relevant tweets.`);
      
    } catch (error) {
      console.log('💥 Analysis exception:', error);
      setMessage(`Error: ${error}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Render loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Render unauthenticated state
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Protected App Route</h1>
          <p>You need to be signed in to access this page.</p>
          <TwitterConnectButton />
        </div>
      </div>
    );
  }

  // Render authenticated dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">MythosReply Dashboard</h1>
              <p className="text-gray-600">Manage your Twitter automation and replies</p>
            </div>
            <TwitterConnectButton />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Account Status Card */}
        {session.user.twitterId && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">X Account Connected</h2>
                  <div className="flex items-center space-x-2">
                    <p className="text-2xl font-bold text-blue-600">
                      @{session.user.username || session.user.twitterId}
                    </p>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Display Name: {session.user.name || 'Not available'}</span>
                    <span>User ID: {session.user.id}</span>
                  </div>
                  <p className="text-sm text-green-600 font-medium mt-1">✅ Ready for posting and analytics</p>
                </div>
              </div>
              <div className="text-right">
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-2">
                  Active
                </div>
                <TwitterConnectButton />
              </div>
            </div>
          </div>
        )}

        {/* AI-Powered Audience Discovery */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🤖 AI-Powered Audience Discovery</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="targeting" className="block text-sm font-medium text-gray-700 mb-2">
                Describe what kind of audience you want to find and engage with
              </label>
              <textarea
                id="targeting"
                value={targetingPrompt}
                onChange={(e) => setTargetingPrompt(e.target.value)}
                placeholder="e.g., I want to find startup founders who are talking about AI tools, productivity, or recent funding. I want to engage with people discussing new product launches or seeking business advice..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={4}
              />
            </div>
            <button
              onClick={analyzeAndSearch}
              disabled={!targetingPrompt.trim() || isAnalyzing}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg transition-all duration-200 font-medium flex items-center justify-center space-x-2"
            >
              {isAnalyzing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>AI is analyzing and finding tweets...</span>
                </>
              ) : (
                <>
                  <span>🔍</span>
                  <span>Find Relevant Tweets with AI</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* AI Analysis Results */}
        {analysisResults && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">🎯 AI Analysis Results</h3>
            
            {/* Strategy Summary */}
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 mb-6">
              <h4 className="font-medium text-gray-900 mb-3">📋 AI-Generated Strategy</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-purple-700">Target Keywords:</span>
                  <div className="mt-1">
                    {analysisResults.strategy.keywords?.map((keyword: string, idx: number) => (
                      <span key={idx} className="inline-block bg-purple-100 text-purple-800 px-2 py-1 rounded mr-1 mb-1 text-xs">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-blue-700">Hashtags:</span>
                  <div className="mt-1">
                    {analysisResults.strategy.hashtags?.map((tag: string, idx: number) => (
                      <span key={idx} className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded mr-1 mb-1 text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-3 text-sm text-gray-700">
                <span className="font-medium">Search Query Used:</span> 
                <code className="bg-gray-100 px-2 py-1 rounded ml-2 text-xs">{analysisResults.searchQuery}</code>
              </div>
            </div>

            {/* Found Tweets */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4">
                🐦 Found Tweets ({analysisResults.tweets?.length || 0} results)
              </h4>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {analysisResults.tweets?.slice(0, 8).map((tweet: any, idx: number) => (
                  <div key={idx} className="border border-gray-200 hover:border-blue-300 rounded-lg p-4 transition-colors">
                    <div className="flex items-start space-x-3">
                      <img 
                        src={tweet.author.profilePicture} 
                        alt={tweet.author.name}
                        className="w-12 h-12 rounded-full flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-semibold text-gray-900 truncate">{tweet.author.name}</span>
                          <span className="text-gray-500">@{tweet.author.userName}</span>
                          {tweet.author.isBlueVerified && (
                            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                          <span className="text-gray-400 text-sm">{tweet.author.followers.toLocaleString()} followers</span>
                        </div>
                        
                        <p className="text-gray-900 mb-3 leading-relaxed">{tweet.text}</p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-6 text-sm text-gray-500">
                            <span className="flex items-center space-x-1">
                              <span>❤️</span>
                              <span>{tweet.likeCount.toLocaleString()}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <span>🔄</span>
                              <span>{tweet.retweetCount.toLocaleString()}</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <span>💬</span>
                              <span>{tweet.replyCount.toLocaleString()}</span>
                            </span>
                            <span className="text-gray-400 text-xs">
                              {new Date(tweet.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <a 
                              href={tweet.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline"
                            >
                              View Tweet →
                            </a>
                            <button className="bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1 rounded text-xs font-medium transition-colors">
                              Reply Opportunity
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {analysisResults.tweets?.length > 8 && (
                <div className="text-center mt-4">
                  <span className="text-gray-500 text-sm">
                    Showing top 8 of {analysisResults.tweets.length} results
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Twitter Profile Tracker */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <TwitterProfileTracker />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick Actions Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Tweet</h3>
              {session.user.twitterId ? (
                <div className="space-y-4">
                  <div>
                    <label htmlFor="tweet" className="block text-sm font-medium text-gray-700 mb-2">
                      Post as @{session.user.username || session.user.twitterId}
                    </label>
                    <textarea
                      id="tweet"
                      value={tweetText}
                      onChange={(e) => setTweetText(e.target.value)}
                      placeholder="What's happening?"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={4}
                      maxLength={280}
                    />
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-sm text-gray-500">
                        {tweetText.length}/280 characters
                      </div>
                      <button
                        onClick={postTweet}
                        disabled={!tweetText.trim() || isPosting}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors duration-200 font-medium"
                      >
                        {isPosting ? "Posting..." : "Post Tweet"}
                      </button>
                    </div>
                  </div>
                  
                  {message && (
                    <div className={`p-4 rounded-lg ${
                      message.includes("Error") 
                        ? "bg-red-50 text-red-700 border border-red-200" 
                        : "bg-green-50 text-green-700 border border-green-200"
                    }`}>
                      <div className="flex items-start space-x-2">
                        <div className="flex-shrink-0">
                          {message.includes("Error") ? (
                            <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{message}</p>
                          {lastTweetUrl && (
                            <div className="mt-3">
                              <a 
                                href={lastTweetUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                              >
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                                </svg>
                                <span>View Tweet</span>
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Connect Your X Account</h4>
                  <p className="text-gray-600 mb-4">Connect your X account to start posting and managing automation</p>
                  <TwitterConnectButton />
                </div>
              )}
            </div>
          </div>

          {/* Features Sidebar */}
          <div className="space-y-6">
            {/* Features Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Live Tweet Posting</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Tweet Link Generation</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">AI-Powered Audience Targeting</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Advanced Tweet Analytics</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Smart Keyword Generation</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Reply Automation (Coming Soon)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Multi-Account Support (Coming Soon)</span>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
              <div className="space-y-2">
                <a href="/docs" className="block text-sm text-blue-600 hover:text-blue-700 transition-colors">
                  📚 Documentation
                </a>
                <a href="/waitlist" className="block text-sm text-blue-600 hover:text-blue-700 transition-colors">
                  📝 Join Waitlist
                </a>
                <a href="/debug-env" className="block text-sm text-blue-600 hover:text-blue-700 transition-colors">
                  🔧 Debug Environment
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}