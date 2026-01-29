import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Send, Image as ImageIcon, Smile, MoreVertical, Phone, Video, X } from 'lucide-react'
import moment from 'moment'
import Loading from '../components/Loading'
import toast from 'react-hot-toast'
import { useSelector, useDispatch } from 'react-redux'
import { sendMessage, addMessageRealtime, fetchChatMessages, markMessagesAsSeen } from '../features/messages/messagesSlice'

const Chatbox = () => {
    const { userId } = useParams()
    const navigate = useNavigate()
    const messagesEndRef = useRef(null)
    const fileInputRef = useRef(null)
    const textareaRef = useRef(null)
    const emojiPickerRef = useRef(null)
    
    const [messages, setMessages] = useState([])
    const [otherUser, setOtherUser] = useState(null)
    const [messageText, setMessageText] = useState('')
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)
    const [imagePreview, setImagePreview] = useState(null)
    const [selectedImage, setSelectedImage] = useState(null)

    const allMessages = useSelector((state) => state.messages.messages || [])
    const connections = useSelector((state) => state.connections.connections || [])
    const currentUser = useSelector((state) => state.user.value)
    const loading = useSelector((state) => state.messages.loading)
    const dispatch = useDispatch()

    useEffect(() => {
        if (!userId || !currentUser) return

        // Find the other user
        const user = connections.find(u => u._id === userId) || currentUser
        setOtherUser(user)
        
        // Filter messages for this conversation
        const currentUserId = currentUser._id
        const conversationMessages = allMessages.filter(msg => 
            (msg.from_user_id === currentUserId && msg.to_user_id === userId) ||
            (msg.from_user_id === userId && msg.to_user_id === currentUserId)
        ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        
        setMessages(conversationMessages)
    }, [userId, currentUser, connections, allMessages])

    // Fetch messages from server when opening a conversation and mark as seen
    useEffect(() => {
        if (!userId || !currentUser) return
        dispatch(fetchChatMessages({ to_user_id: userId }))
        // Mark messages from the other user as seen
        dispatch(markMessagesAsSeen({ from_user_id: userId }))
    }, [userId, currentUser, dispatch])

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    // SSE: listen for incoming messages for this logged-in user
    useEffect(() => {
        if (!currentUser?._id) return

        const src = new EventSource(`/api/message/sse/${currentUser._id}`)

        const onNewMessage = (e) => {
            try {
                const msg = JSON.parse(e.data)
                // Add to global redux store
                dispatch(addMessageRealtime(msg))

                // If the incoming message belongs to the open conversation, append locally
                const currentUserId = currentUser._id
                if (
                    (msg.from_user_id === userId && msg.to_user_id === currentUserId) ||
                    (msg.from_user_id === currentUserId && msg.to_user_id === userId)
                ) {
                    setMessages(prev => [...prev, msg])
                }
            } catch (err) {
                // ignore parse errors
            }
        }

        src.addEventListener('new_message', onNewMessage)

        src.onmessage = (e) => {
            try {
                const msg = JSON.parse(e.data)
                dispatch(addMessageRealtime(msg))
                const currentUserId = currentUser._id
                if (
                    (msg.from_user_id === userId && msg.to_user_id === currentUserId) ||
                    (msg.from_user_id === currentUserId && msg.to_user_id === userId)
                ) {
                    setMessages(prev => [...prev, msg])
                }
            } catch (err) {}
        }

        src.onerror = () => {
            // Could add reconnect logic here if needed
        }

        return () => {
            src.removeEventListener('new_message', onNewMessage)
            src.close()
        }
    }, [currentUser, userId, dispatch])

    // Common emojis for quick access
    const quickEmojis = ['😀', '😂', '😍', '😊', '👍', '❤️', '🎉', '🔥', '💯', '✨', '🙌', '👏']

    const handleSendMessage = async () => {
        if (!messageText.trim() && !selectedImage) {
            return
        }

        setMessageText('')
        setSelectedImage(null)
        setImagePreview(null)
        setShowEmojiPicker(false)

        // Send to server (multipart form to support images)
        try {
            const formData = new FormData()
            formData.append('to_user_id', userId)
            formData.append('text', messageText.trim())
            if (selectedImage) formData.append('image', selectedImage)

            dispatch(sendMessage(formData))
        } catch (err) {
            console.error('Send message error', err)
        }

        toast.success('Message sent')
    }

    const handleImageSelect = (e) => {
        const file = e.target.files?.[0]
        if (file && file.type.startsWith('image/')) {
            setSelectedImage(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const insertEmoji = (emoji) => {
        setMessageText(prev => prev + emoji)
        setShowEmojiPicker(false)
    }

    const formatTime = (dateString) => {
        if (!dateString) return ''
        const date = moment(dateString)
        const now = moment()
        
        if (now.diff(date, 'days') === 0) {
            return date.format('h:mm A')
        } else if (now.diff(date, 'days') === 1) {
            return 'Yesterday'
        } else {
            return date.format('MMM D, h:mm A')
        }
    }

    const isSameDay = (date1, date2) => {
        return moment(date1).isSame(moment(date2), 'day')
    }

    const shouldShowDateSeparator = (currentMsg, previousMsg) => {
        if (!previousMsg) return true
        return !isSameDay(currentMsg.createdAt, previousMsg.createdAt)
    }

    // Close emoji picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                if (!event.target.closest('button[title="Add emoji"]')) {
                    setShowEmojiPicker(false)
                }
            }
        }

        if (showEmojiPicker) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [showEmojiPicker])

    if (loading || !otherUser) {
        return <Loading />
    }

    return (
        <div className="h-full flex flex-col bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-4 py-3">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate('/app/messages')}
                        className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors lg:hidden"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    
                    <Link
                        to={`/app/profile/${otherUser._id}`}
                        className="flex items-center gap-3 flex-1 min-w-0"
                    >
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 shrink-0">
                            {otherUser.profile_picture ? (
                                <img
                                    src={otherUser.profile_picture}
                                    alt={otherUser.full_name || otherUser.username}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="w-full h-full bg-purple-500 flex items-center justify-center">
                                    <span className="text-white font-semibold text-lg">
                                        {otherUser.full_name?.charAt(0)?.toUpperCase() || otherUser.username?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                    {otherUser.full_name || otherUser.username}
                                </p>
                                {otherUser.is_verified && (
                                    <svg className="w-4 h-4 text-blue-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 truncate">@{otherUser.username}</p>
                        </div>
                    </Link>

                    <div className="flex items-center gap-1">
                        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
                            <Phone className="w-5 h-5" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
                            <Video className="w-5 h-5" />
                        </button>
                        <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors">
                            <MoreVertical className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Messages List */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-4">
                <div className="max-w-3xl mx-auto space-y-4">
                    {messages.length > 0 ? (
                        messages.map((message, index) => {
                            const isCurrentUser = message.from_user_id === currentUser?._id
                            const previousMessage = index > 0 ? messages[index - 1] : null
                            const showDateSeparator = shouldShowDateSeparator(message, previousMessage)

                            return (
                                <React.Fragment key={message._id}>
                                    {showDateSeparator && (
                                        <div className="flex items-center justify-center my-4">
                                            <span className="px-3 py-1 bg-gray-200 rounded-full text-xs text-gray-600">
                                                {moment(message.createdAt).format('MMMM D, YYYY')}
                                            </span>
                                        </div>
                                    )}
                                    
                                    <div className={`flex items-end gap-2 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                                        {!isCurrentUser && (
                                            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 shrink-0">
                                                {otherUser.profile_picture ? (
                                                    <img
                                                        src={otherUser.profile_picture}
                                                        alt={otherUser.full_name || otherUser.username}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-purple-500 flex items-center justify-center">
                                                        <span className="text-white font-semibold text-xs">
                                                            {otherUser.full_name?.charAt(0)?.toUpperCase() || otherUser.username?.charAt(0)?.toUpperCase() || 'U'}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        
                                        <div className={`flex flex-col max-w-[70%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                                            {message.message_type === 'image' ? (
                                                <div className={`rounded-2xl overflow-hidden ${
                                                    isCurrentUser 
                                                        ? 'bg-purple-600' 
                                                        : 'bg-white border border-gray-200'
                                                }`}>
                                                    <img
                                                        src={message.media_url}
                                                        alt="Message"
                                                        className="max-w-full h-auto"
                                                        loading="lazy"
                                                    />
                                                    {message.text && (
                                                        <div className={`p-3 ${
                                                            isCurrentUser ? 'text-white' : 'text-gray-900'
                                                        }`}>
                                                            {message.text}
                                                        </div>
                                                    )}
                                                </div>
                                            ) : (
                                                <div className={`px-4 py-2 rounded-2xl ${
                                                    isCurrentUser
                                                        ? 'bg-purple-600 text-white'
                                                        : 'bg-white border border-gray-200 text-gray-900'
                                                }`}>
                                                    <p className="text-sm whitespace-pre-wrap break-words">
                                                        {message.text}
                                                    </p>
                                                </div>
                                            )}
                                            
                                            <span className={`text-xs text-gray-500 mt-1 px-1 ${
                                                isCurrentUser ? 'text-right' : 'text-left'
                                            }`}>
                                                {formatTime(message.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                </React.Fragment>
                            )
                        })
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full py-12">
                            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                <Send className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
                            <p className="text-sm text-gray-500 text-center max-w-sm">
                                Start a conversation with {otherUser.full_name || otherUser.username}
                            </p>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Image Preview */}
            {imagePreview && (
                <div className="px-4 py-2 bg-white border-t border-gray-200">
                    <div className="max-w-3xl mx-auto flex items-center gap-3">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                            <img
                                src={imagePreview}
                                alt="Preview"
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-900 font-medium">Image selected</p>
                            <p className="text-xs text-gray-500">Ready to send</p>
                        </div>
                        <button
                            onClick={() => {
                                setImagePreview(null)
                                setSelectedImage(null)
                            }}
                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="bg-white border-t border-gray-200 p-4">
                <div className="max-w-3xl mx-auto">
                    <div className="flex items-end gap-2">
                        <div className="flex-1 relative">
                            <textarea
                                ref={textareaRef}
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault()
                                        handleSendMessage()
                                    }
                                }}
                                placeholder="Type a message..."
                                rows={1}
                                className="w-full px-4 py-2.5 pr-12 bg-gray-50 border border-gray-200 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-900 placeholder-gray-500 max-h-32"
                                style={{ minHeight: '44px' }}
                            />
                            
                            <div className="absolute right-2 bottom-3 flex items-center gap-1">
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        className={`p-1.5 rounded-lg transition-colors ${
                                            showEmojiPicker 
                                                ? 'bg-purple-100 text-purple-600' 
                                                : 'hover:bg-gray-100 text-gray-500'
                                        }`}
                                        title="Add emoji"
                                    >
                                        <Smile className="w-5 h-5" />
                                    </button>
                                    
                                    {/* Emoji Picker */}
                                    {showEmojiPicker && (
                                        <div
                                            ref={emojiPickerRef}
                                            className="absolute bottom-full right-0 mb-2 w-64 bg-white rounded-xl border border-gray-200 shadow-lg z-50 p-3"
                                        >
                                            <div className="grid grid-cols-6 gap-1">
                                                {quickEmojis.map((emoji, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => insertEmoji(emoji)}
                                                        className="p-2 text-xl hover:bg-gray-100 rounded-lg transition-colors"
                                                    >
                                                        {emoji}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
                                    title="Add image"
                                >
                                    <ImageIcon className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleImageSelect}
                                className="hidden"
                            />
                        </div>
                        
                        <button
                            onClick={handleSendMessage}
                            disabled={!messageText.trim() && !selectedImage}
                            className="p-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 mb-2"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Chatbox
