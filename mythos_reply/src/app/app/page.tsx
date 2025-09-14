'use client';

import { useState, useEffect } from 'react';

export default function AppPage() {
  const [tweetText, setTweetText] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [message, setMessage] = useState('');
  const [replyJobs, setReplyJobs] = useState<any[]>([]);
  const [targetingPrompt, setTargetingPrompt] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any>(null);

  useEffect(() => {
    fetchReplyJobs();
  }, []);

  const fetchReplyJobs = async () => {
    try {
      const response = await fetch('/api/reply-jobs');
      if (response.ok) {
        const jobs = await response.json();
        setReplyJobs(jobs);
      }
    } catch (error) {
      console.error('Failed to fetch reply jobs:', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const postTweet = async () => {
    if (!tweetText.trim()) return;
    
    setIsPosting(true);
    setMessage('');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setMessage('Tweet posted successfully! (Demo mode)');
      setTweetText('');
    } catch (error) {
      setMessage(`Error posting tweet: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsPosting(false);
    }
  };

  const analyzeAndSearch = async () => {
    if (!targetingPrompt.trim()) return;
    
    setIsAnalyzing(true);
    setAnalysisResults(null);
    
    try {
      const targetingResponse = await fetch('/api/analytics/targeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: targetingPrompt }),
      });
      
      if (!targetingResponse.ok) {
        throw new Error('Failed to generate targeting strategy');
      }
      
      const targetingData = await targetingResponse.json();
      
      const searchResponse = await fetch('/api/analytics/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: targetingData.strategy.keywords.join(' OR ') }),
      });
      
      if (!searchResponse.ok) {
        throw new Error('Failed to search tweets');
      }
      
      const searchData = await searchResponse.json();
      
      setAnalysisResults({
        strategy: targetingData.strategy,
        tweets: searchData.data.tweets,
        analysis: searchData.analysis,
        searchQuery: targetingData.strategy.keywords.join(' OR ')
      });
      
      setMessage('Analysis complete! Found relevant opportunities.');
      
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">MythosReply Dashboard</h1>
              <p className="text-gray-600">Manage your Twitter automation and replies</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
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
                placeholder="e.g., I want to find startup founders who are talking about AI tools, productivity, or recent funding..."
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
            </div>

            <div>
              <h4 className="font-medium text-gray-900 mb-4">
                🐦 Found Opportunities ({analysisResults.tweets?.length || 0} results)
              </h4>
              <p className="text-gray-600">Analysis complete! Ready for engagement opportunities.</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Tweet</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="tweet" className="block text-sm font-medium text-gray-700 mb-2">
                    Compose Tweet
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
                      {isPosting ? 'Posting...' : 'Post Tweet'}
                    </button>
                  </div>
                </div>
                
                {message && (
                  <div className={`p-4 rounded-lg ${
                    message.includes('Error') 
                      ? 'bg-red-50 text-red-700 border border-red-200' 
                      : 'bg-green-50 text-green-700 border border-green-200'
                  }`}>
                    <p className="font-medium">{message}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Features</h3>
              <div className="space-y-3">
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}