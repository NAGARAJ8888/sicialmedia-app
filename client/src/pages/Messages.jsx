import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, MessageCircle, Image as ImageIcon, Video, FileText, MoreVertical, Send } from 'lucide-react'
import moment from 'moment'
import Loading from '../components/Loading'
import { useSelector } from 'react-redux'

const Messages = () => {
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedMessage, setSelectedMessage] = useState(null)

    const messages = useSelector((state) => state.messages.messages || [])
    const connections = useSelector((state) => state.connections.connections || [])
    const currentUser = useSelector((state) => state.user.value)
    const loading = useSelector((state) => state.messages.loading)

    // Group messages by conversation (by user)
    const groupMessagesByUser = (messagesList) => {
        const conversations = {}
        const currentUserId = currentUser?._id

        messagesList.forEach((message) => {
            // Determine the other user in the conversation
            let otherUser
            if (message.from_user_id?._id === currentUserId) {
                otherUser = message.to_user_id
            } else if (message.to_user_id?._id === currentUserId) {
                otherUser = message.from_user_id
            } else {
                // If current user is not in the conversation, use from_user_id
                otherUser = message.from_user_id
            }
            
            // Skip if we can't determine the other user
            if (!otherUser || !otherUser._id) return
            
            if (!conversations[otherUser._id]) {
                conversations[otherUser._id] = {
                    user: otherUser,
                    lastMessage: message,
                    unreadCount: 0,
                    messages: []
                }
            }
            
            conversations[otherUser._id].messages.push(message)
            
            // Update last message if this one is newer
            const lastMsgDate = new Date(conversations[otherUser._id].lastMessage.createdAt || 0)
            const currentMsgDate = new Date(message.createdAt || 0)
            if (currentMsgDate > lastMsgDate) {
                conversations[otherUser._id].lastMessage = message
            }
            
            // Count unread messages (only from other users)
            if (message.from_user_id?._id !== currentUserId && !message.seen) {
                conversations[otherUser._id].unreadCount++
            }
        })

        return Object.values(conversations).sort((a, b) => {
            const dateA = new Date(a.lastMessage.createdAt || 0)
            const dateB = new Date(b.lastMessage.createdAt || 0)
            return dateB - dateA
        })
    }

    const conversations = groupMessagesByUser(messages)

    // Merge connections with conversations
    // Add connected users who don't have any messages yet
    const conversationsMap = new Map(conversations.map(c => [c.user._id, c]))
    connections.forEach((connection) => {
        if (!conversationsMap.has(connection._id)) {
            conversationsMap.set(connection._id, {
                user: connection,
                lastMessage: null,
                unreadCount: 0,
                messages: []
            })
        }
    })
    const mergedConversations = Array.from(conversationsMap.values()).sort((a, b) => {
        const dateA = new Date(a.lastMessage?.createdAt || 0)
        const dateB = new Date(b.lastMessage?.createdAt || 0)
        return dateB - dateA
    })

    // Filter conversations based on search
    const filteredConversations = mergedConversations.filter((conv) => {
        if (!searchQuery) return true
        const searchLower = searchQuery.toLowerCase()
        return (
            conv.user.full_name?.toLowerCase().includes(searchLower) ||
            conv.user.username?.toLowerCase().includes(searchLower) ||
            conv.lastMessage?.text?.toLowerCase().includes(searchLower)
        )
    })

    const getMessageIcon = (messageType) => {
        switch (messageType) {
            case 'image':
                return <ImageIcon className="w-3.5 h-3.5 text-gray-400" />
            case 'video':
                return <Video className="w-3.5 h-3.5 text-gray-400" />
            case 'file':
                return <FileText className="w-3.5 h-3.5 text-gray-400" />
            default:
                return null
        }
    }

    const formatTime = (dateString) => {
        if (!dateString) return ''
        const date = moment(dateString)
        const now = moment()
        
        if (now.diff(date, 'days') === 0) {
            return date.format('h:mm A')
        } else if (now.diff(date, 'days') === 1) {
            return 'Yesterday'
        } else if (now.diff(date, 'days') < 7) {
            return date.format('ddd')
        } else {
            return date.format('MMM D')
        }
    }

    if (loading) {
        return <Loading />
    }

    return (
        <div className="h-full flex flex-col bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
                    <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
                        <MoreVertical className="w-5 h-5" />
                    </button>
                </div>
                
                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search messages..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-900 placeholder-gray-500"
                    />
                </div>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-6">
                {filteredConversations.length > 0 ? (
                    <div className="space-y-3">
                        {filteredConversations.map((conversation) => {
                            const { user, lastMessage, unreadCount } = conversation
                            const isUnread = lastMessage && (unreadCount > 0 || !lastMessage.seen)
                            const currentUserId = currentUser?._id
                            const isFromCurrentUser = lastMessage?.from_user_id?._id === currentUserId
                            
                            return (
                                <Link
                                    key={user._id}
                                    to={`/app/messages/${user._id}`}
                                    className="flex items-start gap-4 px-4 py-4 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all group"
                                    onClick={() => setSelectedMessage(conversation)}
                                >
                                    {/* Avatar */}
                                    <div className="relative shrink-0">
                                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                                            {user.profile_picture ? (
                                                <img
                                                    src={user.profile_picture}
                                                    alt={user.full_name || user.username || 'User'}
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = "none"
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-purple-500 flex items-center justify-center">
                                                    <span className="text-white font-semibold text-lg">
                                                        {user.full_name?.charAt(0)?.toUpperCase() || user.username?.charAt(0)?.toUpperCase() || 'U'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        {isUnread && (
                                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 rounded-full border-2 border-white flex items-center justify-center">
                                                {unreadCount > 0 && (
                                                    <span className="text-[10px] font-semibold text-white">
                                                        {unreadCount > 9 ? '9+' : unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Message Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <p className={`text-sm font-semibold truncate ${
                                                    isUnread ? "text-gray-900" : "text-gray-700"
                                                }`}>
                                                    {user.full_name || user.username}
                                                </p>
                                                {user.is_verified && (
                                                    <svg className="w-4 h-4 text-blue-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </div>
                                            <span className={`text-xs shrink-0 ml-2 ${
                                                isUnread ? "text-gray-900 font-medium" : "text-gray-500"
                                            }`}>
                                                {lastMessage ? formatTime(lastMessage.createdAt) : ''}
                                            </span>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            {lastMessage && isFromCurrentUser && (
                                                <Send className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                            )}
                                            {lastMessage && getMessageIcon(lastMessage.message_type)}
                                            <p className={`text-sm truncate flex-1 ${
                                                isUnread 
                                                    ? "text-gray-900 font-medium" 
                                                    : "text-gray-600"
                                            }`}>
                                                {!lastMessage
                                                    ? 'Start a conversation'
                                                    : lastMessage.message_type !== 'text' 
                                                        ? lastMessage.message_type === 'image' 
                                                            ? '📷 Photo' 
                                                            : lastMessage.message_type === 'video'
                                                            ? '🎥 Video'
                                                            : '📎 File'
                                                        : lastMessage.text || 'Media'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full py-12">
                        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                            <MessageCircle className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {searchQuery ? 'No conversations found' : 'No messages yet'}
                        </h3>
                        <p className="text-sm text-gray-500 text-center max-w-sm">
                            {searchQuery 
                                ? `Try adjusting your search terms to find what you're looking for.`
                                : `Start a conversation with someone to see your messages here.`
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Messages