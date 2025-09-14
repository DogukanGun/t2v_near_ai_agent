'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function DashboardPage() {
  const [replyJobs, setReplyJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      console.error('Failed to fetch reply jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Stats Cards */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-indigo-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-semibold">J</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Active Jobs
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {replyJobs.filter(job => job.isActive).length}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-semibold">R</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Replies
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {replyJobs.reduce((sum, job) => sum + (job.currentReplies || 0), 0)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white font-semibold">A</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Accounts
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        1
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reply Jobs List */}
          <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Recent Reply Jobs
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Your automated reply configurations
              </p>
            </div>
            <ul className="divide-y divide-gray-200">
              {isLoading ? (
                <li className="px-4 py-4">
                  <div className="text-center text-gray-500">Loading...</div>
                </li>
              ) : replyJobs.length === 0 ? (
                <li className="px-4 py-4">
                  <div className="text-center text-gray-500">
                    No reply jobs found. 
                    <Link href="/app" className="text-indigo-600 hover:text-indigo-500 ml-1">
                      Create your first one
                    </Link>
                  </div>
                </li>
              ) : (
                replyJobs.map((job) => (
                  <li key={job.id} className="px-4 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className={`w-3 h-3 rounded-full ${job.isActive ? 'bg-green-400' : 'bg-gray-400'}`}></div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {job.targetUsername ? `@${job.targetUsername}` : 'Keywords: ' + (job.keywords ? JSON.parse(job.keywords).join(', ') : '')}
                          </div>
                          <div className="text-sm text-gray-500">
                            {job.replyText.substring(0, 100)}...
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {job.currentReplies || 0}/{job.maxReplies || 10}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          job.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {job.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-white shadow sm:rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Quick Actions
              </h3>
              <div className="mt-5">
                <div className="rounded-md bg-gray-50 px-6 py-5 sm:flex sm:items-start sm:justify-between">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 sm:mt-0 sm:ml-0">
                      <div className="text-sm font-medium text-gray-900">
                        Ready to automate your Twitter engagement?
                      </div>
                      <div className="mt-1 text-sm text-gray-600">
                        Create reply jobs, connect accounts, and start engaging with your audience automatically.
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 sm:mt-0 sm:ml-6 sm:flex-shrink-0">
                    <Link
                      href="/app"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                    >
                      Get Started
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}