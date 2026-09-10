'use client'

import { useState, useRef, useEffect } from 'react'
import { CloseIcon, AttachmentIcon, EmojiIcon, SendIcon } from '../icons/ChatIcons'

interface ChatMessageInputProps {
  onSendMessage: (content: string, type: 'TEXT' | 'IMAGE' | 'FILE', parentId?: string) => void
  onTyping: (isTyping: boolean) => void
  selectedMessage: any | null
  onClearReply: () => void
  isTeacher: boolean
}

export function ChatMessageInput({
  onSendMessage,
  onTyping,
  selectedMessage,
  onClearReply,
  isTeacher,
}: ChatMessageInputProps) {
  const [message, setMessage] = useState('')
  const [isComposing, setIsComposing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const typingTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [message])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
    
    // Typing indicator
    if (!isComposing) {
      onTyping(true)
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false)
      }, 1000)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleSubmit = () => {
    if (message.trim()) {
      onSendMessage(message.trim(), 'TEXT', selectedMessage?.id)
      setMessage('')
      onTyping(false)
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current)
      }
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // For images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        onSendMessage(event.target?.result as string, 'IMAGE', selectedMessage?.id)
      }
      reader.readAsDataURL(file)
    } else {
      // For other files (upload to server)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('sessionId', 'current-session-id') // Replace with actual
      
      const response = await fetch('/api/chat/upload', {
        method: 'POST',
        body: formData,
      })
      
      const data = await response.json()
      onSendMessage(data.fileUrl, 'FILE', selectedMessage?.id)
    }
  }

  return (
    <div className="border-t border-gray-800 p-4 bg-gray-900">
      {/* Reply Preview */}
      {selectedMessage && (
        <div className="mb-3 p-3 bg-gray-800 rounded-lg border-l-4 border-blue-500 text-left">
          <div className="flex items-center justify-between mb-1">
            <span className="text-blue-400 text-xs font-semibold">
              Replying to {selectedMessage.senderName}
            </span>
            <button
              onClick={onClearReply}
              className="text-gray-550 hover:text-gray-300 cursor-pointer"
            >
              <CloseIcon className="w-4 h-4" />
            </button>
          </div>
          <p className="text-gray-400 text-sm line-clamp-2">
            {selectedMessage.content}
          </p>
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end gap-2">
        {/* File Upload */}
        <label className="p-3 hover:bg-gray-800 rounded-xl cursor-pointer transition">
          <input
            type="file"
            accept="image/*,.pdf,.doc,.docx"
            className="hidden"
            onChange={handleFileUpload}
          />
          <AttachmentIcon className="w-5 h-5 text-gray-400" />
        </label>

        {/* Text Input */}
        <div className="flex-1 bg-gray-800 rounded-2xl flex items-end">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={() => setIsComposing(false)}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 bg-transparent text-white placeholder-gray-500 px-4 py-3 resize-none focus:outline-none max-h-32 text-sm"
          />
          
          {/* Emoji Picker */}
          <button className="p-3 hover:bg-gray-700 rounded-xl transition cursor-pointer">
            <EmojiIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Send Button */}
        <button
          onClick={handleSubmit}
          disabled={!message.trim()}
          className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-xl transition cursor-pointer"
        >
          <SendIcon className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Quick Actions for Teacher */}
      {isTeacher && (
        <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
          <button
            onClick={() => onSendMessage('👋 Welcome everyone!', 'TEXT')}
            className="text-[10px] px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full transition whitespace-nowrap cursor-pointer"
          >
            Welcome
          </button>
          <button
            onClick={() => onSendMessage('⏰ Class starting in 5 minutes', 'TEXT')}
            className="text-[10px] px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full transition whitespace-nowrap cursor-pointer"
          >
            Starting Soon
          </button>
          <button
            onClick={() => onSendMessage('📝 Quiz time! Check your dashboard', 'TEXT')}
            className="text-[10px] px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full transition whitespace-nowrap cursor-pointer"
          >
            Quiz Alert
          </button>
        </div>
      )}
    </div>
  )
}
