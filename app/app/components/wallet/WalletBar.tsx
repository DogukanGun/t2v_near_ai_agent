'use client'

interface WalletBarProps {
  address?: string
  balance?: string
  onSwap?: () => void
  onTransfer?: () => void
}

export default function WalletBar({ 
  address, 
  balance = '0 NEAR',
  onSwap,
  onTransfer 
}: WalletBarProps) {
  return (
    <div className="flex items-center justify-between bg-white dark:bg-base-100 rounded-xl p-3 shadow-sm">
      <div className="flex items-center gap-2">
        <div>
          <p className="font-medium">{address}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{balance}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={onSwap}
          className="btn btn-sm bg-[#82DED9] hover:bg-[#6BC4BF] text-white border-none gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
          </svg>
          Swap
        </button>
        <button 
          onClick={onTransfer}
          className="btn btn-sm bg-[#F391B0] hover:bg-[#E07A98] text-white border-none gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          Transfer
        </button>
        <button className="btn btn-sm btn-ghost btn-circle">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z" />
          </svg>
        </button>
      </div>
    </div>
  )
} 