'use client'

import { useState } from 'react'
import { ReplyIcon, EmojiIcon, TrashIcon } from '../icons/ChatIcons'

interface ChatMessageListProps {
  messages: any[]
  typingUsers: string[]
  isTeacher: boolean
  currentUserId: string
  onReply: (message: any) => void
  onReaction: (messageId: string, reaction: string) => void
  onDelete: (messageId: string) => void
  messagesEndRef: React.RefObject<HTMLDivElement | null>
  chatContainerRef: React.RefObject<HTMLDivElement | null>
}

const REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏']

export function ChatMessageList({
  messages,
  typingUsers,
  isTeacher,
  currentUserId,
  onReply,
  onReaction,
  onDelete,
  messagesEndRef,
  chatContainerRef,
}: ChatMessageListProps) {
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null)

  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.timestamp).toLocaleDateString()
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(message)
    return groups
  }, {} as Record<string, any[]>)

  return (
    <div 
      ref={chatContainerRef}
      className="flex-1 overflow-y-auto p-4 space-y-4"
    >
      {Object.entries(groupedMessages).map(([date, dateMessages]) => (
        <div key={date}>
          {/* Date Separator */}
          <div className="flex items-center justify-center my-4">
            <span className="text-gray-500 text-xs bg-gray-800 px-3 py-1 rounded-full select-none">
              {date === new Date().toLocaleDateString() ? 'Today' : date}
            </span>
          </div>

          {/* Messages */}
          {dateMessages.map((message, index) => {
            const isOwn = message.senderId === currentUserId
            const showAvatar = index === 0 || dateMessages[index - 1].senderId !== message.senderId

            return (
              <div
                key={message.id}
                className={`flex gap-3 mb-4 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                {showAvatar && !isOwn ? (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 select-none">
                    {message.senderName.charAt(0).toUpperCase()}
                  </div>
                ) : !isOwn ? (
                  <div className="w-8 flex-shrink-0" />
                ) : null}

                {/* Message Content */}
                <div className={`group max-w-[75%] ${isOwn ? 'items-end' : 'items-start'}`}>
                  {!isOwn && showAvatar && (
                    <span className="text-gray-400 text-xs ml-1 mb-1 block select-none">
                      {message.senderName}
                    </span>
                  )}

                  <div
                    className={`relative px-4 py-2 rounded-2xl ${
                      isOwn
                        ? 'bg-blue-600 text-white rounded-br-md'
                        : 'bg-gray-850 text-gray-100 rounded-bl-md'
                    } ${message.isDeleted ? 'opacity-50 italic' : ''}`}
                    onContextMenu={(e) => {
                      e.preventDefault()
                      setShowReactionPicker(message.id)
                    }}
                  >
                    {message.messageType === 'IMAGE' ? (
                      <img src={message.content} alt="Shared image" className="rounded-lg max-w-full" />
                    ) : (
                      <p className="text-sm leading-relaxed break-words">{message.content}</p>
                    )}

                    {/* Timestamp */}
                    <span className={`text-[10px] mt-1 block select-none ${isOwn ? 'text-blue-200' : 'text-gray-500'}`}>
                      {new Date(message.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                      {message.isEdited && ' • edited'}
                    </span>

                    {/* Message Actions */}
                    <div className={`absolute ${isOwn ? 'left-0 -translate-x-full pr-2' : 'right-0 translate-x-full pl-2'} top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 z-10`}>
                      <div className="bg-gray-900 border border-gray-700 rounded-lg shadow-lg p-1 flex items-center">
                        <button
                          onClick={() => onReply(message)}
                          className="p-1.5 hover:bg-gray-805 rounded cursor-pointer"
                          title="Reply"
                        >
                          <ReplyIcon className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                        <button
                          onClick={() => setShowReactionPicker(showReactionPicker === message.id ? null : message.id)}
                          className="p-1.5 hover:bg-gray-850 rounded cursor-pointer"
                          title="React"
                        >
                          <EmojiIcon className="w-3.5 h-3.5 text-gray-400" />
                        </button>
                        {(isTeacher || isOwn) && (
                          <button
                            onClick={() => onDelete(message.id)}
                            className="p-1.5 hover:bg-gray-850 rounded cursor-pointer"
                            title="Delete"
                          >
                            <TrashIcon className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Reaction Picker */}
                    {showReactionPicker === message.id && (
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 border border-gray-700 rounded-full shadow-xl p-2 flex gap-1.5 z-50">
                        {REACTIONS.map(reaction => (
                          <button
                            key={reaction}
                            onClick={() => {
                              onReaction(message.id, reaction)
                              setShowReactionPicker(null)
                            }}
                            className="hover:scale-125 transition-transform text-lg cursor-pointer"
                          >
                            {reaction}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Reactions Display */}
                  {message.reactions && Object.keys(message.reactions).length > 0 && (
                    <div className={`flex gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      {Object.entries(message.reactions).map(([reaction, users]) => (
                        <button
                          key={reaction}
                          className="flex items-center gap-1 bg-gray-800 hover:bg-gray-700 rounded-full px-2 py-0.5 text-xs select-none"
                        >
                          <span>{reaction}</span>
                          <span className="text-gray-400">{(users as string[]).length}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ))}

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <div className="flex items-center gap-2 text-gray-500 text-sm select-none">
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
          <span>{typingUsers.join(', ')} typing...</span>
        </div>
      )}

      <div ref={messagesEndRef} />
    </div>
  )
}
