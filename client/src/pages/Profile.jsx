import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { dummyUserData, dummyPostsData, dummyConnectionsData } from '../assets/assets'
import { MessageCircle, UserPlus, UserCheck, Settings, Grid3x3, User, MapPin, Calendar, Edit } from 'lucide-react'
import Postcard from '../components/Postcard'
import Loading from '../components/Loading'
import ProfileModal from '../components/ProfileModal'
import moment from 'moment'

const Profile = () => {
    const { profileId } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('posts')
    const [profileUser, setProfileUser] = useState(null)
    const [userPosts, setUserPosts] = useState([])
    const [isFollowing, setIsFollowing] = useState(false)
    const [followersCount, setFollowersCount] = useState(0)
    const [followingCount, setFollowingCount] = useState(0)
    const [showDropdown, setShowDropdown] = useState(false)
    const [showProfileModal, setShowProfileModal] = useState(false)
    const dropdownRef = useRef(null)

    useEffect(() => {
        const fetchProfileData = async () => {
            // Simulate API call - in real app, fetch by profileId
            const targetUserId = profileId || dummyUserData._id
            const user = targetUserId === dummyUserData._id 
                ? dummyUserData 
                : dummyConnectionsData.find(u => u._id === targetUserId) || dummyUserData
            
            setProfileUser(user)
            
            // Filter posts by user
            const posts = dummyPostsData.filter(post => post.user._id === user._id)
            setUserPosts(posts)
            
            // Set followers/following counts
            setFollowersCount(user.followers?.length || 0)
            setFollowingCount(user.following?.length || 0)
            
            // Check if current user is following this profile
            setIsFollowing(dummyUserData.following?.includes(user._id) || false)
            
            setLoading(false)
        }
        fetchProfileData()
    }, [profileId])

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false)
            }
        }

        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside)
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [showDropdown])

    const isCurrentUser = !profileId || profileId === dummyUserData._id

    const handleFollow = () => {
        setIsFollowing(!isFollowing)
        setFollowersCount(prev => isFollowing ? prev - 1 : prev + 1)
    }

    const handleMessage = () => {
        navigate(`/app/messages/${profileUser._id}`)
    }

    const handleEditProfile = () => {
        setShowDropdown(false)
        setShowProfileModal(true)
    }

    if (loading || !profileUser) {
        return <Loading />
    }

    return (
        <div className="h-full overflow-y-auto no-scrollbar bg-slate-50">
            {/* Profile Content */}
            <div className="max-w-4xl mx-auto px-6 py-8">
                {/* Profile Header */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
                    {/* Cover Photo */}
                    <div className="relative w-full h-64 bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400">
                        {profileUser.cover_photo ? (
                            <img
                                src={profileUser.cover_photo}
                                alt="Cover"
                                className="w-full h-full object-cover"
                                loading="lazy"
                                onError={(e) => {
                                    e.currentTarget.style.display = "none"
                                }}
                            />
                        ) : null}
                    </div>

                    {/* Profile Picture and Info */}
                    <div className="px-6 pt-6 pb-4">
                        <div className="flex flex-col md:flex-row md:items-end gap-4">
                            {/* Avatar */}
                            <div className="relative -mt-20 md:-mt-20">
                                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
                                    {profileUser.profile_picture ? (
                                        <img
                                            src={profileUser.profile_picture}
                                            alt={profileUser.full_name || profileUser.username}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                            onError={(e) => {
                                                e.currentTarget.style.display = "none"
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-purple-500 flex items-center justify-center">
                                            <span className="text-white font-semibold text-4xl">
                                                {profileUser.full_name?.charAt(0)?.toUpperCase() || profileUser.username?.charAt(0)?.toUpperCase() || 'U'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* User Info */}
                            <div className="flex-1 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h1 className="text-2xl font-bold text-gray-900">
                                            {profileUser.full_name || profileUser.username}
                                        </h1>
                                        {profileUser.is_verified && (
                                            <svg className="w-5 h-5 text-blue-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </div>
                                    <p className="text-gray-600 mb-2">@{profileUser.username}</p>
                                    
                                    {/* Bio */}
                                    {profileUser.bio && (
                                        <p className="text-sm text-gray-700 mb-3 whitespace-pre-wrap">
                                            {profileUser.bio}
                                        </p>
                                    )}

                                    {/* Location and Join Date */}
                                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                        {profileUser.location && (
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="w-4 h-4" />
                                                <span>{profileUser.location}</span>
                                            </div>
                                        )}
                                        {profileUser.createdAt && (
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-4 h-4" />
                                                <span>Joined {moment(profileUser.createdAt).format('MMMM YYYY')}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-2">
                                    {isCurrentUser ? (
                                        <>
                                            <Link
                                                to="/app/create-post"
                                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
                                            >
                                                Create Post
                                            </Link>
                                            <div className="relative" ref={dropdownRef}>
                                                <button 
                                                    onClick={() => setShowDropdown(!showDropdown)}
                                                    className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                                                >
                                                    <Settings className="w-5 h-5" />
                                                </button>
                                                {showDropdown && (
                                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                                        <button
                                                            onClick={handleEditProfile}
                                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                            Edit Profile
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={handleMessage}
                                                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                                            >
                                                <MessageCircle className="w-4 h-4" />
                                                Message
                                            </button>
                                            <button
                                                onClick={handleFollow}
                                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 ${
                                                    isFollowing
                                                        ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                                                        : 'bg-purple-600 hover:bg-purple-700 text-white'
                                                }`}
                                            >
                                                {isFollowing ? (
                                                    <>
                                                        <UserCheck className="w-4 h-4" />
                                                        Following
                                                    </>
                                                ) : (
                                                    <>
                                                        <UserPlus className="w-4 h-4" />
                                                        Follow
                                                    </>
                                                )}
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-6 mt-6 pt-6 border-t border-gray-100">
                            <Link
                                to={isCurrentUser ? "/app/connections?tab=followers" : "#"}
                                className="flex items-center gap-2 hover:text-purple-600 transition-colors"
                            >
                                <span className="text-lg font-bold text-gray-900">{followersCount}</span>
                                <span className="text-sm text-gray-600">Followers</span>
                            </Link>
                            <Link
                                to={isCurrentUser ? "/app/connections?tab=following" : "#"}
                                className="flex items-center gap-2 hover:text-purple-600 transition-colors"
                            >
                                <span className="text-lg font-bold text-gray-900">{followingCount}</span>
                                <span className="text-sm text-gray-600">Following</span>
                            </Link>
                            <div className="flex items-center gap-2">
                                <span className="text-lg font-bold text-gray-900">{userPosts.length}</span>
                                <span className="text-sm text-gray-600">Posts</span>
                            </div>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="border-t border-gray-100">
                        <div className="flex items-center gap-1 px-6">
                            {[
                                { id: 'posts', label: 'Posts', icon: Grid3x3 },
                                { id: 'about', label: 'About', icon: User },
                            ].map((tab) => {
                                const Icon = tab.icon
                                const isActive = activeTab === tab.id
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`
                                            flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2
                                            ${isActive 
                                                ? 'border-purple-600 text-purple-600' 
                                                : 'border-transparent text-gray-600 hover:text-gray-900'
                                            }
                                        `}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span>{tab.label}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'posts' ? (
                    <div>
                        {userPosts.length > 0 ? (
                            <div className="space-y-6">
                                {userPosts.map((post) => (
                                    <Postcard key={post._id} post={post} />
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12">
                                <div className="flex flex-col items-center justify-center">
                                    <Grid3x3 className="w-12 h-12 text-gray-300 mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
                                    <p className="text-sm text-gray-500 text-center max-w-sm">
                                        {isCurrentUser 
                                            ? "Start sharing your thoughts and moments with the world!"
                                            : `${profileUser.full_name || profileUser.username} hasn't shared any posts yet.`
                                        }
                                    </p>
                                    {isCurrentUser && (
                                        <Link
                                            to="/app/create-post"
                                            className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
                                        >
                                            Create Your First Post
                                        </Link>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 mb-2">Bio</h3>
                                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                    {profileUser.bio || 'No bio available.'}
                                </p>
                            </div>
                            {profileUser.location && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Location</h3>
                                    <p className="text-sm text-gray-700">{profileUser.location}</p>
                                </div>
                            )}
                            {profileUser.createdAt && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 mb-2">Joined</h3>
                                    <p className="text-sm text-gray-700">
                                        {moment(profileUser.createdAt).format('MMMM DD, YYYY')}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Profile Modal */}
            {isCurrentUser && (
                <ProfileModal
                    isOpen={showProfileModal}
                    onClose={() => setShowProfileModal(false)}
                    user={profileUser}
                    isCurrentUser={true}
                />
            )}
        </div>
    )
}

export default Profile