import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { dummyUserData } from '../assets/assets'
import { X, Image as ImageIcon, Smile, Hash, XCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const CreatePost = () => {
    const navigate = useNavigate()
    const fileInputRef = useRef(null)
    const textareaRef = useRef(null)
    const emojiPickerRef = useRef(null)
    
    const [content, setContent] = useState('')
    const [images, setImages] = useState([])
    const [imagePreviews, setImagePreviews] = useState([])
    const [isPosting, setIsPosting] = useState(false)
    const [showEmojiPicker, setShowEmojiPicker] = useState(false)

    const maxCharacters = 2000
    const remainingCharacters = maxCharacters - content.length

    // Common emojis organized by category
    const emojiCategories = {
        'Smileys & People': ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '😶‍🌫️', '😵', '😵‍💫', '🤯', '🤠', '🥳', '😎', '🤓', '🧐'],
        'Gestures': ['👋', '🤚', '🖐', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👍', '👎', '✊', '👊', '🤛', '🤜', '👏', '🙌', '👐', '🤲', '🤝', '🙏'],
        'Animals & Nature': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐽', '🐸', '🐵', '🙈', '🙉', '🙊', '🐒', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🦬', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🪶', '🦅', '🦆', '🦢', '🦩', '🦚', '🦜', '🐓', '🦃', '🦤', '🪶', '🦉', '🦅', '🦆', '🦢', '🦩', '🦚', '🦜', '🐓', '🦃', '🦤', '🪶', '🌲', '🌳', '🌴', '🌵', '🌷', '🌹', '🌺', '🌻', '🌼', '🌽', '🌾', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃'],
        'Food & Drink': ['🍇', '🍈', '🍉', '🍊', '🍋', '🍌', '🍍', '🥭', '🍎', '🍏', '🍐', '🍑', '🍒', '🍓', '🫐', '🥝', '🍅', '🫒', '🥥', '🥑', '🍆', '🥔', '🥕', '🌽', '🌶', '🫑', '🥒', '🥬', '🥦', '🧄', '🧅', '🍄', '🥜', '🌰', '🍞', '🥐', '🥖', '🫓', '🥨', '🥯', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🦴', '🌭', '🍔', '🍟', '🍕', '🫔', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘', '🥫', '🍝', '🍜', '🍲', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥠', '🥮', '🍢', '🍡', '🍧', '🍨', '🍦', '🥧', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯', '🥛', '🍼', '🫖', '☕️', '🍵', '🧃', '🥤', '🧋', '🍶', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧉', '🍾', '🧊'],
        'Activities': ['⚽️', '🏀', '🏈', '⚾️', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🥅', '⛳️', '🏹', '🎣', '🤿', '🥊', '🥋', '🎽', '🛹', '🛷', '⛸', '🥌', '🎿', '⛷', '🏂', '🪂', '🏋️', '🤼', '🤸', '🤺', '⛹️', '🤾', '🏌️', '🏇', '🧘', '🏄', '🏊', '🚣', '🧗', '🚵', '🚴', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖', '🏵', '🎗', '🎫', '🎟', '🎪', '🤹', '🎭', '🩰', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🪕', '🎻', '🎲', '♟️', '🎯', '🎳', '🎮', '🎰', '🧩'],
        'Travel & Places': ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🦯', '🦽', '🦼', '🛴', '🚲', '🛵', '🏍', '🛺', '🚨', '🚔', '🚍', '🚘', '🚖', '🚡', '🚠', '🚟', '🚃', '🚋', '🚞', '🚝', '🚄', '🚅', '🚈', '🚂', '🚆', '🚇', '🚊', '🚉', '✈️', '🛫', '🛬', '🛩', '💺', '🚁', '🚟', '🚠', '🚡', '🛰', '🚀', '🛸', '🛎', '🧳', '⌛️', '⏳', '⌚️', '⏰', '⏱', '⏲', '🕰', '🕛', '🕧', '🕐', '🕜', '🕑', '🕝', '🕒', '🕞', '🕓', '🕟', '🕔', '🕠', '🕕', '🕡', '🕖', '🕢', '🕗', '🕣', '🕘', '🕤', '🕙', '🕥', '🕚', '🕦'],
        'Objects': ['💎', '🔪', '⚔️', '🛡', '🚬', '⚰️', '⚱️', '🏺', '🔮', '📿', '💈', '⚗️', '🔭', '🔬', '🕳', '💊', '💉', '🩸', '🧬', '🦠', '🧫', '🧪', '🌡', '🧹', '🪠', '🧺', '🧻', '🚽', '🚿', '🛁', '🛀', '🛎', '🔑', '🗝', '🚪', '🪑', '🛋', '🛏', '🛌', '🧸', '🪆', '🖼', '🪞', '🪟', '🛍', '🛒', '🎁', '🎈', '🎏', '🎀', '🪄', '🪅', '🪆', '🎊', '🎉', '🎎', '🏮', '🎐', '🧧', '✉️', '📩', '📨', '📧', '💌', '📥', '📤', '📦', '🏷', '🪧', '📪', '📫', '📬', '📭', '📮', '📯', '📜', '📃', '📄', '📑', '🧾', '📊', '📈', '📉', '🗒', '🗓', '📆', '📅', '🗑', '📇', '🗃', '🗳', '🗄', '📋', '📁', '📂', '🗂', '🗞', '🗳', '📰', '📓', '📔', '📒', '📕', '📗', '📘', '📙', '📚', '📖', '🔖', '🧷', '🔗', '📎', '🖇', '📐', '📏', '🧮', '📌', '📍', '✂️', '🖊', '🖋', '✒️', '🖌', '🖍', '📝', '✏️', '🔍', '🔎', '🪓', '🛠', '🪛', '🔧', '🔨', '⚒', '🛠', '⛏', '🪚', '🔩', '⚙️', '🪤', '🧰', '🧲', '🪜', '⚗️', '🧪', '🧫', '🦠', '🧬', '🔬', '🔭', '📡', '💉', '🩸', '💊', '🩹', '🩺', '🩻', '🩼', '🩽', '🩾', '🩿', '🪣', '🪤', '🪥', '🪦', '🪧', '🪨', '🪩', '🪪', '🪫', '🪬', '🪭', '🪮', '🪯', '🪰', '🪱', '🪲', '🪳', '🪴', '🪵', '🪶', '🪷', '🪸', '🪹', '🪺'],
        'Symbols': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈️', '♉️', '♊️', '♋️', '♌️', '♍️', '♎️', '♏️', '♐️', '♑️', '♒️', '♓️', '🆔', '⚛️', '🉑', '☢️', '☣️', '📴', '📳', '🈶', '🈚️', '🈸', '🈺', '🈷️', '✴️', '🆚', '💮', '🉐', '㊙️', '㊗️', '🈴', '🈵', '🈹', '🈲', '🅰️', '🅱️', '🆎', '🆑', '🅾️', '🆘', '❌', '⭕️', '🛑', '⛔️', '📛', '🚫', '💯', '💢', '♨️', '🚷', '🚯', '🚳', '🚱', '🔞', '📵', '🚭', '❗️', '❓', '❕', '❔', '‼️', '⁉️', '🔅', '🔆', '〽️', '⚠️', '🚸', '🔱', '⚜️', '🔰', '♻️', '✅', '🈯️', '💹', '❇️', '✳️', '❎', '🌐', '💠', 'Ⓜ️', '🌀', '💤', '🏧', '🚾', '♿️', '🅿️', '🈳', '🈂️', '🛂', '🛃', '🛄', '🛅', '🚹', '🚺', '🚼', '🚻', '🚮', '🎦', '📶', '🈁', '🔣', 'ℹ️', '🔤', '🔡', '🔠', '🆖', '🆗', '🆙', '🆒', '🆕', '🆓', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟', '🔢', '#️⃣', '*️⃣', '▶️', '⏸', '⏯', '⏹', '⏺', '⏭', '⏮', '⏩', '⏪', '⏫', '⏬', '◀️', '🔼', '🔽', '➡️', '⬅️', '⬆️', '⬇️', '↗️', '↘️', '↙️', '↖️', '↕️', '↔️', '🔄', '↪️', '↩️', '⤴️', '⤵️', '🔀', '🔁', '🔂', '⏺', '🔃', '🔄', '🔙', '🔚', '🔛', '🔜', '🔝', '🛐', '⚛️', '🕉', '☮️', '☯️', '☸️', '☪️', '✡️', '✝️', '☦️', '🛐', '⛎', '♈️', '♉️', '♊️', '♋️', '♌️', '♍️', '♎️', '♏️', '♐️', '♑️', '♒️', '♓️']
    }

    // Close emoji picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                // Check if click is not on the emoji button
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

    const handleImageSelect = (e) => {
        const files = Array.from(e.target.files)
        const validFiles = files.filter(file => file.type.startsWith('image/'))
        
        if (validFiles.length === 0) {
            toast.error('Please select valid image files')
            return
        }

        if (images.length + validFiles.length > 4) {
            toast.error('You can upload a maximum of 4 images')
            return
        }

        const newImages = [...images, ...validFiles]
        setImages(newImages)

        // Create previews
        validFiles.forEach(file => {
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreviews(prev => [...prev, reader.result])
            }
            reader.readAsDataURL(file)
        })
    }

    const removeImage = (index) => {
        const newImages = images.filter((_, i) => i !== index)
        const newPreviews = imagePreviews.filter((_, i) => i !== index)
        setImages(newImages)
        setImagePreviews(newPreviews)
    }

    const handlePost = async () => {
        if (!content.trim() && images.length === 0) {
            toast.error('Please add some content or images to your post')
            return
        }

        setIsPosting(true)

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500))

            // Determine post type
            let postType = 'text'
            if (images.length > 0 && content.trim()) {
                postType = 'text_with_image'
            } else if (images.length > 0) {
                postType = 'image'
            }

            // In a real app, you would upload images and create the post here
            const newPost = {
                content: content.trim(),
                image_urls: [], // Would be URLs from uploaded images
                post_type: postType,
                user: dummyUserData,
                createdAt: new Date().toISOString(),
            }

            console.log('Post created:', newPost)
            toast.success('Post created successfully!')
            
            // Reset form
            setContent('')
            setImages([])
            setImagePreviews([])
            
            // Navigate back to feed
            navigate('/app')
        } catch (error) {
            toast.error('Failed to create post. Please try again.')
            console.error('Error creating post:', error)
        } finally {
            setIsPosting(false)
        }
    }

    const handleCancel = () => {
        if (content.trim() || images.length > 0) {
            if (window.confirm('Are you sure you want to discard this post?')) {
                navigate('/app')
            }
        } else {
            navigate('/app')
        }
    }

    const insertHashtag = () => {
        const textarea = textareaRef.current
        if (textarea) {
            const start = textarea.selectionStart
            const end = textarea.selectionEnd
            const text = content.substring(0, start) + '#' + content.substring(end)
            setContent(text)
            setTimeout(() => {
                textarea.focus()
                textarea.setSelectionRange(start + 1, start + 1)
            }, 0)
        }
    }

    const insertEmoji = (emoji) => {
        const textarea = textareaRef.current
        if (textarea) {
            const start = textarea.selectionStart
            const end = textarea.selectionEnd
            const newContent = content.substring(0, start) + emoji + content.substring(end)
            
            if (newContent.length <= maxCharacters) {
                setContent(newContent)
                setTimeout(() => {
                    textarea.focus()
                    const newCursorPos = start + emoji.length
                    textarea.setSelectionRange(newCursorPos, newCursorPos)
                }, 0)
            } else {
                toast.error('Character limit reached')
            }
        } else {
            // Fallback if textarea ref is not available
            if ((content + emoji).length <= maxCharacters) {
                setContent(content + emoji)
            } else {
                toast.error('Character limit reached')
            }
        }
    }

    return (
        <div className="h-full overflow-y-auto no-scrollbar bg-slate-50">
            <div className="max-w-2xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6">
                    <div className="flex items-center justify-between p-4 border-b border-gray-100">
                        <h1 className="text-xl font-bold text-gray-900">Create Post</h1>
                        <button
                            onClick={handleCancel}
                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* User Info */}
                    <div className="flex items-center gap-3 p-4 border-b border-gray-100">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 shrink-0">
                            {dummyUserData.profile_picture ? (
                                <img
                                    src={dummyUserData.profile_picture}
                                    alt={dummyUserData.full_name || dummyUserData.username}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="w-full h-full bg-purple-500 flex items-center justify-center">
                                    <span className="text-white font-semibold text-lg">
                                        {dummyUserData.full_name?.charAt(0)?.toUpperCase() || dummyUserData.username?.charAt(0)?.toUpperCase() || 'U'}
                                    </span>
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-gray-900">
                                {dummyUserData.full_name || dummyUserData.username}
                            </p>
                            <p className="text-xs text-gray-500">@{dummyUserData.username}</p>
                        </div>
                    </div>

                    {/* Text Input */}
                    <div className="p-4">
                        <textarea
                            ref={textareaRef}
                            value={content}
                            onChange={(e) => {
                                if (e.target.value.length <= maxCharacters) {
                                    setContent(e.target.value)
                                }
                            }}
                            placeholder="What's on your mind?"
                            className="w-full min-h-[200px] resize-none border-none outline-none text-gray-900 placeholder-gray-400 text-base"
                            rows={8}
                        />
                        
                        {/* Character Counter */}
                        <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                                    title="Add photos"
                                >
                                    <ImageIcon className="w-5 h-5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={insertHashtag}
                                    className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                                    title="Add hashtag"
                                >
                                    <Hash className="w-5 h-5" />
                                </button>
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        className={`p-2 rounded-lg transition-colors ${
                                            showEmojiPicker 
                                                ? 'bg-purple-100 text-purple-600' 
                                                : 'hover:bg-gray-100 text-gray-600'
                                        }`}
                                        title="Add emoji"
                                    >
                                        <Smile className="w-5 h-5" />
                                    </button>
                                    
                                    {/* Emoji Picker */}
                                    {showEmojiPicker && (
                                        <div
                                            ref={emojiPickerRef}
                                            className="absolute bottom-full left-0 mb-2 w-80 h-96 bg-white rounded-xl border border-gray-200 shadow-lg z-50 flex flex-col overflow-hidden"
                                        >
                                            {/* Header */}
                                            <div className="p-3 border-b border-gray-100 flex items-center justify-between">
                                                <h3 className="text-sm font-semibold text-gray-900">Select Emoji</h3>
                                                <button
                                                    onClick={() => setShowEmojiPicker(false)}
                                                    className="p-1 rounded hover:bg-gray-100 text-gray-600"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                            
                                            {/* Emoji List */}
                                            <div className="flex-1 overflow-y-auto no-scrollbar p-3">
                                                {Object.entries(emojiCategories).map(([category, emojis]) => (
                                                    <div key={category} className="mb-4">
                                                        <h4 className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                                                            {category}
                                                        </h4>
                                                        <div className="grid grid-cols-8 gap-1">
                                                            {emojis.map((emoji, index) => (
                                                                <button
                                                                    key={`${category}-${index}`}
                                                                    onClick={() => {
                                                                        insertEmoji(emoji)
                                                                        setShowEmojiPicker(false)
                                                                    }}
                                                                    className="p-2 text-xl hover:bg-gray-100 rounded-lg transition-colors hover:scale-110"
                                                                    title={emoji}
                                                                >
                                                                    {emoji}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <span className={`text-xs ${
                                remainingCharacters < 50 
                                    ? 'text-red-500 font-medium' 
                                    : 'text-gray-500'
                            }`}>
                                {remainingCharacters} characters remaining
                            </span>
                        </div>

                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageSelect}
                            className="hidden"
                        />
                    </div>

                    {/* Image Previews */}
                    {imagePreviews.length > 0 && (
                        <div className="px-4 pb-4">
                            <div className={`grid gap-3 ${
                                imagePreviews.length === 1 
                                    ? 'grid-cols-1' 
                                    : imagePreviews.length === 2
                                    ? 'grid-cols-2'
                                    : 'grid-cols-2'
                            }`}>
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="relative group">
                                        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                                            <img
                                                src={preview}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <button
                                            onClick={() => removeImage(index)}
                                            className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 rounded-full text-white transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <XCircle className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-100">
                        <button
                            onClick={handleCancel}
                            disabled={isPosting}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handlePost}
                            disabled={isPosting || (!content.trim() && images.length === 0)}
                            className="px-6 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isPosting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Posting...
                                </>
                            ) : (
                                'Post'
                            )}
                        </button>
                    </div>
                </div>

                {/* Preview Section */}
                {(content.trim() || images.length > 0) && (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                        <div className="p-4 border-b border-gray-100">
                            <h2 className="text-sm font-semibold text-gray-900">Preview</h2>
                        </div>
                        <div className="p-4">
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                {/* Preview Header */}
                                <div className="flex items-center justify-between p-4 pb-3">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 shrink-0">
                                            {dummyUserData.profile_picture ? (
                                                <img
                                                    src={dummyUserData.profile_picture}
                                                    alt={dummyUserData.full_name || dummyUserData.username}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-purple-500 flex items-center justify-center">
                                                    <span className="text-white font-semibold text-sm">
                                                        {dummyUserData.full_name?.charAt(0)?.toUpperCase() || dummyUserData.username?.charAt(0)?.toUpperCase() || 'U'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 truncate">
                                                {dummyUserData.full_name || dummyUserData.username}
                                            </p>
                                            <p className="text-xs text-gray-500">@{dummyUserData.username}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Preview Content */}
                                {content.trim() && (
                                    <div className="px-4 pb-3">
                                        <p className="text-sm text-gray-900 whitespace-pre-wrap">
                                            {content}
                                        </p>
                                    </div>
                                )}

                                {/* Preview Images */}
                                {imagePreviews.length > 0 && (
                                    <div className="w-full">
                                        {imagePreviews.length === 1 ? (
                                            <div className="w-full bg-gray-100">
                                                <img
                                                    src={imagePreviews[0]}
                                                    alt="Preview"
                                                    className="w-full h-auto object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-0.5 bg-gray-100 p-0.5">
                                                {imagePreviews.slice(0, 4).map((preview, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={`${
                                                            imagePreviews.length === 3 && idx === 2 ? "col-span-2" : ""
                                                        } bg-gray-200 aspect-square overflow-hidden`}
                                                    >
                                                        <img
                                                            src={preview}
                                                            alt={`Preview ${idx + 1}`}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CreatePost