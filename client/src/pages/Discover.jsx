import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { dummyPostsData, dummyConnectionsData, dummyUserData } from '../assets/assets'
import { Search, TrendingUp, Hash, UserPlus, Users, Sparkles } from 'lucide-react'
import Postcard from '../components/Postcard'
import Loading from '../components/Loading'

const Discover = () => {
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [activeFilter, setActiveFilter] = useState('all') // all, posts, people, hashtags
    const [posts, setPosts] = useState([])
    const [suggestedUsers, setSuggestedUsers] = useState([])
    const [trendingHashtags, setTrendingHashtags] = useState([])

    useEffect(() => {
        // Simulate API call
        const fetchDiscoverData = async () => {
            setPosts(dummyPostsData)
            setSuggestedUsers(dummyConnectionsData.filter(user => user._id !== dummyUserData._id))
            
            // Extract hashtags from posts
            const hashtags = new Map()
            dummyPostsData.forEach(post => {
                const content = post.content || ''
                const matches = content.match(/#\w+/g)
                if (matches) {
                    matches.forEach(tag => {
                        const tagLower = tag.toLowerCase()
                        hashtags.set(tagLower, (hashtags.get(tagLower) || 0) + 1)
                    })
                }
            })
            
            const sortedHashtags = Array.from(hashtags.entries())
                .map(([tag, count]) => ({ tag, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10)
            
            setTrendingHashtags(sortedHashtags)
            setLoading(false)
        }
        fetchDiscoverData()
    }, [])

    const filteredPosts = posts.filter((post) => {
        if (!searchQuery) return true
        const searchLower = searchQuery.toLowerCase()
        return (
            post.content?.toLowerCase().includes(searchLower) ||
            post.user?.full_name?.toLowerCase().includes(searchLower) ||
            post.user?.username?.toLowerCase().includes(searchLower)
        )
    })

    const filteredUsers = suggestedUsers.filter((user) => {
        if (!searchQuery) return true
        const searchLower = searchQuery.toLowerCase()
        return (
            user.full_name?.toLowerCase().includes(searchLower) ||
            user.username?.toLowerCase().includes(searchLower) ||
            user.bio?.toLowerCase().includes(searchLower)
        )
    })

    const filteredHashtags = trendingHashtags.filter((item) => {
        if (!searchQuery) return true
        return item.tag.toLowerCase().includes(searchQuery.toLowerCase())
    })

    const handleFollow = (userId) => {
        console.log('Follow user:', userId)
    }

    if (loading) {
        return <Loading />
    }

    return (
        <div className="h-full flex flex-col bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-gray-900">Discover</h1>
                </div>
                
                {/* Search Bar */}
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search posts, people, hashtags..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-900 placeholder-gray-500"
                    />
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                    {[
                        { id: 'all', label: 'All', icon: Sparkles },
                        { id: 'posts', label: 'Posts', icon: TrendingUp },
                        { id: 'people', label: 'People', icon: Users },
                        { id: 'hashtags', label: 'Hashtags', icon: Hash },
                    ].map((filter) => {
                        const Icon = filter.icon
                        const isActive = activeFilter === filter.id
                        return (
                            <button
                                key={filter.id}
                                onClick={() => setActiveFilter(filter.id)}
                                className={`
                                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
                                    ${isActive 
                                        ? 'bg-purple-600 text-white' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }
                                `}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{filter.label}</span>
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-6">
                <div className="max-w-4xl mx-auto space-y-6">
                    {/* Trending Hashtags Section */}
                    {(activeFilter === 'all' || activeFilter === 'hashtags') && (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-4 pb-3 border-b border-gray-100 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-purple-600" />
                                <h2 className="text-sm font-semibold text-gray-900">Trending Hashtags</h2>
                            </div>
                            <div className="p-4">
                                {filteredHashtags.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {filteredHashtags.map((item, index) => (
                                            <Link
                                                key={index}
                                                to={`/app/discover?hashtag=${item.tag}`}
                                                className="flex items-center gap-2 px-3 py-2 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
                                            >
                                                <Hash className="w-4 h-4 text-purple-600" />
                                                <span className="text-sm font-medium text-purple-600 group-hover:text-purple-700">
                                                    {item.tag}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {item.count} {item.count === 1 ? 'post' : 'posts'}
                                                </span>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 text-center py-4">No trending hashtags found</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Suggested Users Section */}
                    {(activeFilter === 'all' || activeFilter === 'people') && (
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="p-4 pb-3 border-b border-gray-100 flex items-center gap-2">
                                <Users className="w-5 h-5 text-purple-600" />
                                <h2 className="text-sm font-semibold text-gray-900">Suggested People</h2>
                            </div>
                            <div className="p-4">
                                {filteredUsers.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {filteredUsers.map((user) => (
                                            <div
                                                key={user._id}
                                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                <Link
                                                    to={`/app/profile/${user._id}`}
                                                    className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 shrink-0"
                                                >
                                                    {user.profile_picture ? (
                                                        <img
                                                            src={user.profile_picture}
                                                            alt={user.full_name || user.username}
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
                                                </Link>
                                                <div className="flex-1 min-w-0">
                                                    <Link
                                                        to={`/app/profile/${user._id}`}
                                                        className="flex items-center gap-1.5 mb-1"
                                                    >
                                                        <p className="text-sm font-semibold text-gray-900 truncate">
                                                            {user.full_name || user.username}
                                                        </p>
                                                        {user.is_verified && (
                                                            <svg className="w-4 h-4 text-blue-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                            </svg>
                                                        )}
                                                    </Link>
                                                    <p className="text-xs text-gray-500 truncate">@{user.username}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleFollow(user._id)}
                                                    className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium rounded-lg transition-colors shrink-0 flex items-center gap-1"
                                                >
                                                    <UserPlus className="w-3.5 h-3.5" />
                                                    Follow
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 text-center py-4">No users found</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Posts Section */}
                    {(activeFilter === 'all' || activeFilter === 'posts') && (
                        <div>
                            {filteredPosts.length > 0 ? (
                                <div className="space-y-6">
                                    {filteredPosts.map((post) => (
                                        <Postcard key={post._id} post={post} />
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12">
                                    <div className="flex flex-col items-center justify-center">
                                        <Search className="w-12 h-12 text-gray-300 mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            {searchQuery ? 'No posts found' : 'No posts to discover'}
                                        </h3>
                                        <p className="text-sm text-gray-500 text-center max-w-sm">
                                            {searchQuery 
                                                ? `Try adjusting your search terms to find what you're looking for.`
                                                : `Check back later for new content to discover.`
                                            }
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Discover