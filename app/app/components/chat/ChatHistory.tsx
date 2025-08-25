'use client'

interface ChatSession {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
}

interface ChatHistoryProps {
  sessions: ChatSession[]
  activeSessionId?: string
  onSessionSelect: (sessionId: string) => void
  onNewChat: () => void
  onClearHistory: () => void
}

export default function ChatHistory({
  sessions,
  activeSessionId,
  onSessionSelect,
  onNewChat,
  onClearHistory
}: ChatHistoryProps) {
  return (
    <div className="bg-[#F8F9FB] dark:bg-base-200 w-80 h-full flex flex-col">
      {/* New Chat Button */}
      <div className="p-4">
        <button
          onClick={onNewChat}
          className="btn w-full bg-[#82DED9] hover:bg-[#6BC4BF] text-white border-none gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Chat
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {sessions.map((session) => (
          <button
            key={session.id}
            onClick={() => onSessionSelect(session.id)}
            className={`w-full p-4 text-left transition-colors hover:bg-gray-100 dark:hover:bg-base-300 ${
              activeSessionId === session.id ? 'bg-gray-100 dark:bg-base-300' : ''
            }`}
          >
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-sm">{session.title}</h3>
                <span className="text-xs text-gray-500">{new Date(session.timestamp).toLocaleDateString()}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{session.lastMessage}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-base-300">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {sessions.length} conversations
          </span>
          <button 
            onClick={onClearHistory}
            className="btn btn-ghost btn-sm text-sm normal-case gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
            Clear History
          </button>
        </div>
      </div>
    </div>
  )
} 