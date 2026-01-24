import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { dummyConnectionsData, dummyFollowersData, dummyFollowingData, dummyPendingConnectionsData, dummyUserData } from '../assets/assets'
import { Search, MessageCircle, UserPlus, UserCheck, UserX, Check, X, Users } from 'lucide-react'
import Loading from '../components/Loading'

const Connections = () => {
    const navigate = useNavigate()
    const [activeTab, setActiveTab] = useState('all')
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [connections, setConnections] = useState([])
    const [followers, setFollowers] = useState([])
    const [following, setFollowing] = useState([])
    const [pending, setPending] = useState([])

    useEffect(() => {
        // Simulate API call
        const fetchConnections = async () => {
            setConnections(dummyConnectionsData)
            setFollowers(dummyFollowersData)
            setFollowing(dummyFollowingData)
            setPending(dummyPendingConnectionsData)
            setLoading(false)
        }
        fetchConnections()
    }, [])

    const getCurrentData = () => {
        switch (activeTab) {
            case 'followers':
                return followers
            case 'following':
                return following
            case 'pending':
                return pending
            default:
                return connections
        }
    }

    const filteredData = getCurrentData().filter((user) => {
        if (!searchQuery) return true
        const searchLower = searchQuery.toLowerCase()
        return (
            user.full_name?.toLowerCase().includes(searchLower) ||
            user.username?.toLowerCase().includes(searchLower) ||
            user.bio?.toLowerCase().includes(searchLower) ||
            user.location?.toLowerCase().includes(searchLower)
        )
    })

    const handleFollow = (userId) => {
        // Handle follow action
        console.log('Follow user:', userId)
    }

    const handleUnfollow = (userId) => {
        // Handle unfollow action
        console.log('Unfollow user:', userId)
    }

    const handleAccept = (userId) => {
        // Handle accept connection request
        console.log('Accept connection:', userId)
    }

    const handleReject = (userId) => {
        // Handle reject connection request
        console.log('Reject connection:', userId)
    }

    const handleMessage = (userId) => {
        // Navigate to messages
        navigate(`/app/messages/${userId}`)
    }

    const tabs = [
        { id: 'all', label: 'All Connections', icon: Users, count: connections.length },
        { id: 'followers', label: 'Followers', icon: UserCheck, count: followers.length },
        { id: 'following', label: 'Following', icon: UserPlus, count: following.length },
        { id: 'pending', label: 'Pending', icon: UserX, count: pending.length },
    ]

    if (loading) {
        return <Loading />
    }

    return (
        <div className="h-full flex flex-col bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold text-gray-900">Connections</h1>
                </div>
                
                {/* Search Bar */}
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search connections..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm text-gray-900 placeholder-gray-500"
                    />
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                    {tabs.map((tab) => {
                        const Icon = tab.icon
                        const isActive = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
                                    ${isActive 
                                        ? 'bg-purple-600 text-white' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }
                                `}
                            >
                                <Icon className="w-4 h-4" />
                                <span>{tab.label}</span>
                                {tab.count > 0 && (
                                    <span className={`
                                        px-2 py-0.5 rounded-full text-xs font-semibold
                                        ${isActive ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'}
                                    `}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* Connections List */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-6">
                {filteredData.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredData.map((user) => {
                            const isCurrentUser = user._id === dummyUserData._id
                            const isFollowing = dummyUserData.following?.includes(user._id)
                            const isFollower = dummyUserData.followers?.includes(user._id)
                            
                            return (
                                <div
                                    key={user._id}
                                    className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden"
                                >
                                    {/* Cover Photo */}
                                    {user.cover_photo && (
                                        <div className="w-full h-24 overflow-hidden bg-gray-100">
                                            <img
                                                src={user.cover_photo}
                                                alt="Cover"
                                                className="w-full h-full object-cover"
                                                loading="lazy"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = "none"
                                                }}
                                            />
                                        </div>
                                    )}
                                    
                                    <div className="p-4">
                                        {/* Profile Section */}
                                        <div className="flex flex-col items-center -mt-12 mb-4">
                                            {/* Avatar */}
                                            <div className="relative mb-3">
                                                <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-md">
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
                                                            <span className="text-white font-semibold text-2xl">
                                                                {user.full_name?.charAt(0)?.toUpperCase() || user.username?.charAt(0)?.toUpperCase() || 'U'}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Name and Username */}
                                            <div className="text-center mb-2">
                                                <div className="flex items-center justify-center gap-2 mb-1">
                                                    <Link
                                                        to={`/app/profile/${user._id}`}
                                                        className="text-base font-semibold text-gray-900 hover:text-purple-600 transition-colors"
                                                    >
                                                        {user.full_name || user.username}
                                                    </Link>
                                                    {user.is_verified && (
                                                        <svg className="w-4 h-4 text-blue-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500">@{user.username}</p>
                                                {user.location && (
                                                    <p className="text-xs text-gray-400 mt-1">{user.location}</p>
                                                )}
                                            </div>

                                            {/* Bio */}
                                            {user.bio && (
                                                <p className="text-xs text-gray-600 text-center mb-4 line-clamp-2">
                                                    {user.bio}
                                                </p>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        {!isCurrentUser && (
                                            <div className="flex gap-2">
                                                {activeTab === 'pending' ? (
                                                    <>
                                                        <button
                                                            onClick={() => handleAccept(user._id)}
                                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                            Accept
                                                        </button>
                                                        <button
                                                            onClick={() => handleReject(user._id)}
                                                            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => handleMessage(user._id)}
                                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
                                                        >
                                                            <MessageCircle className="w-4 h-4" />
                                                            Message
                                                        </button>
                                                        {isFollowing ? (
                                                            <button
                                                                onClick={() => handleUnfollow(user._id)}
                                                                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                                                            >
                                                                <UserX className="w-4 h-4" />
                                                            </button>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleFollow(user._id)}
                                                                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                                                            >
                                                                <UserPlus className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full py-12">
                        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                            <Users className="w-10 h-10 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {searchQuery ? 'No connections found' : `No ${activeTab === 'all' ? 'connections' : activeTab} yet`}
                        </h3>
                        <p className="text-sm text-gray-500 text-center max-w-sm">
                            {searchQuery 
                                ? `Try adjusting your search terms to find what you're looking for.`
                                : activeTab === 'pending'
                                ? `You don't have any pending connection requests.`
                                : `Start connecting with people to see them here.`
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Connections