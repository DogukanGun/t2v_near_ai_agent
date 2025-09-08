'use client'

import { useState } from 'react'
import { WalletBar } from './components/wallet'
import { ChatHistory } from './components/chat'
import { useProfile } from '../lib/hooks/useProfile'
import { authService } from '../lib/services/auth'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

interface ChatSession {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
}

export default function MythOSApp() {
  const { profile } = useProfile()
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sessions] = useState<ChatSession[]>([
    {
      id: '1',
      title: 'Getting Started with NEAR',
      lastMessage: 'How can I create a NEAR wallet...',
      timestamp: new Date('2024-03-10')
    },
    {
      id: '2',
      title: 'Token Swap Guide',
      lastMessage: 'What is the current exchange ...',
      timestamp: new Date('2024-03-11')
    }
  ])

  const handleSendMessage = async (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newMessage])
    setIsLoading(true)

    try {
      const response = await authService.sendMessage(content)
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response.data ? JSON.stringify(response.data, null, 2) : 'No response data',
        role: 'assistant',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`,
        role: 'assistant',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-white dark:bg-base-100">
      {/* Chat History Drawer */}
      <div className={`fixed inset-y-0 left-0 transform ${
        isHistoryOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 ease-in-out z-30 md:relative md:translate-x-0`}>
        <ChatHistory
          sessions={sessions}
          activeSessionId="1"
          onSessionSelect={() => {}}
          onNewChat={() => {
            setMessages([])
            setIsHistoryOpen(false)
          }}
          onClearHistory={() => {}}
        />
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="p-4 flex items-center gap-4">
          <button
            className="btn btn-ghost btn-sm md:hidden"
            onClick={() => setIsHistoryOpen(!isHistoryOpen)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <div className="flex-1">
            <WalletBar
              address={profile?.account_id || "Loading..."}
              balance="1,234.56 NEAR"
              onSwap={() => {}}
              onTransfer={() => {}}
            />
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 p-4">
          <div className="bg-white dark:bg-base-100 h-full rounded-xl flex flex-col">
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`chat ${message.role === 'user' ? 'chat-end' : 'chat-start'}`}
                >
                  <div className={`chat-bubble ${
                    message.role === 'user' 
                      ? 'bg-[#82DED9] text-white' 
                      : 'bg-gray-100 dark:bg-base-200'
                  }`}>
                    {message.content}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="chat chat-start">
                  <div className="chat-bubble bg-gray-100 dark:bg-base-200">
                    <span className="loading loading-dots loading-sm"></span>
                  </div>
                </div>
              )}
            </div>
            <div className="border-t border-gray-200 dark:border-base-300 p-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="input input-bordered flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      const target = e.target as HTMLInputElement
                      if (target.value.trim()) {
                        handleSendMessage(target.value.trim())
                        target.value = ''
                      }
                    }
                  }}
                />
                <button className="btn btn-circle">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}