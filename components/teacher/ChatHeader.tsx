'use client'

import { useState } from 'react'
import { SettingsIcon, CloseIcon, MuteIcon, ClearIcon, ExportIcon, SlowModeIcon } from '../icons/ChatIcons'

interface ChatHeaderProps {
  onClose: () => void
  unreadCount: number
  isTeacher: boolean
}

export function ChatHeader({ onClose, unreadCount, isTeacher }: ChatHeaderProps) {
  const [showMenu, setShowMenu] = useState(false)

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
      <div className="flex items-center gap-3">
        <h2 className="text-white font-semibold text-lg select-none">Chat</h2>
        {unreadCount > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full select-none">
            {unreadCount}
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {isTeacher && (
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 hover:bg-gray-700 rounded-lg transition cursor-pointer"
            title="Chat Settings"
          >
            <SettingsIcon className="w-5 h-5 text-gray-400" />
          </button>
        )}
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-700 rounded-lg transition cursor-pointer"
        >
          <CloseIcon className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Dropdown Menu */}
      {showMenu && isTeacher && (
        <div className="absolute right-4 top-14 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-2 z-50 min-w-[200px]">
          <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2 cursor-pointer">
            <MuteIcon className="w-4 h-4" />
            Mute All Participants
          </button>
          <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2 cursor-pointer">
            <ClearIcon className="w-4 h-4" />
            Clear Chat History
          </button>
          <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2 cursor-pointer">
            <ExportIcon className="w-4 h-4" />
            Export Chat
          </button>
          <hr className="my-2 border-gray-700" />
          <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2 cursor-pointer">
            <SlowModeIcon className="w-4 h-4" />
            Enable Slow Mode
          </button>
        </div>
      )}
    </div>
  )
}
