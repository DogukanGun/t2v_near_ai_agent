'use client'

import { useState } from 'react'
import { UserGroupIcon, ChatBubbleLeftRightIcon, SparklesIcon } from '@heroicons/react/24/outline'

export default function MultipleProfileDemo() {
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([])
  
  const demoProfiles = [
    'elonmusk',
    'naval',
    'balajis',
    'sama',
    'vitalikbuterin'
  ]

  const toggleProfile = (profile: string) => {
    if (selectedProfiles.includes(profile)) {
      setSelectedProfiles(selectedProfiles.filter(p => p !== profile))
    } else {
      setSelectedProfiles([...selectedProfiles, profile])
    }
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
      <div className="flex items-center mb-4">
        <UserGroupIcon className="h-6 w-6 text-indigo-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">Multiple Profile Monitoring</h3>
        <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
          NEW
        </span>
      </div>
      
      <p className="text-gray-600 mb-4">
        Now you can monitor and reply to tweets from multiple Twitter profiles in a single job!
      </p>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Select profiles to monitor:</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {demoProfiles.map((profile) => (
              <button
                key={profile}
                onClick={() => toggleProfile(profile)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedProfiles.includes(profile)
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                @{profile}
              </button>
            ))}
          </div>
        </div>

        {selectedProfiles.length > 0 && (
          <div className="bg-white rounded-lg p-4 border border-indigo-200">
            <div className="flex items-center mb-2">
              <ChatBubbleLeftRightIcon className="h-5 w-5 text-indigo-600 mr-2" />
              <span className="text-sm font-medium text-gray-700">
                Monitoring {selectedProfiles.length} profiles:
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedProfiles.map((profile) => (
                <span
                  key={profile}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800"
                >
                  @{profile}
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div className="flex items-start">
            <SparklesIcon className="h-5 w-5 text-purple-600 mr-2 mt-0.5" />
            <div>
              <h5 className="text-sm font-medium text-purple-900 mb-1">How it works:</h5>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Monitor tweets from multiple profiles simultaneously</li>
                <li>• AI generates contextual replies for each profile</li>
                <li>• Set different reply limits and tones</li>
                <li>• Automatic deduplication prevents duplicate replies</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
