import React, { useEffect, useRef, useState } from 'react'
import { X, MessageCircle, UserPlus, UserCheck, MapPin, Calendar, Edit, Camera, Save, Loader2 } from 'lucide-react'
import moment from 'moment'
import toast from 'react-hot-toast'
import { useSelector, useDispatch } from 'react-redux'
import { useAuth } from '@clerk/clerk-react'
import api from '../api/axios'
import { fetchUserData } from '../features/user/userSlice'

/**
 * ProfileModal
 *
 * Props:
 * - isOpen: boolean
 * - onClose: () => void
 * - user: user object (expects _id, full_name, username, bio, profile_picture, cover_photo, location, createdAt, is_verified)
 * - isCurrentUser?: boolean
 * - isFollowing?: boolean
 * - onFollowToggle?: (userId: string) => void
 * - onMessage?: (userId: string) => void
 * - onSave?: (updatedUser: object) => void - callback when profile is saved
 */
const ProfileModal = ({
  isOpen,
  onClose,
  user,
  isCurrentUser = false,
  isFollowing = false,
  onFollowToggle,
  onMessage,
  onSave,
}) => {
  const currentUser = useSelector((state) => state?.user?.value)
  const dispatch = useDispatch()
  const { getToken } = useAuth()
  const profileUser = user ?? currentUser

  const panelRef = useRef(null)
  const coverInputRef = useRef(null)
  const profileInputRef = useRef(null)
  
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    bio: '',
    location: '',
    profile_picture: null,
    cover_photo: null,
  })
  const [profilePreview, setProfilePreview] = useState(null)
  const [coverPreview, setCoverPreview] = useState(null)

  useEffect(() => {
    if (!isOpen) return

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (isEditing) {
          handleCancel()
        } else {
          onClose?.()
        }
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose, isEditing])

  // Initialize form data when modal opens or user changes
  useEffect(() => {
    if (isOpen && profileUser) {
      setFormData({
        full_name: profileUser?.full_name || '',
        username: profileUser?.username || '',
        bio: profileUser?.bio || '',
        location: profileUser?.location || '',
        profile_picture: null,
        cover_photo: null,
      })
      setProfilePreview(profileUser?.profile_picture || null)
      setCoverPreview(profileUser?.cover_photo || null)
      setIsEditing(false)
    }
  }, [isOpen, profileUser])

  if (!isOpen || !profileUser) return null

  const name = profileUser?.full_name || profileUser?.username || 'User'
  const username = profileUser?.username || 'user'
  const avatar = isEditing && profilePreview ? profilePreview : (profileUser?.profile_picture || null)
  const cover = isEditing && coverPreview ? coverPreview : (profileUser?.cover_photo || null)
  const joinedText = profileUser?.createdAt ? `Joined ${moment(profileUser.createdAt).format('MMMM YYYY')}` : null

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleProfilePictureChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Profile picture must be less than 5MB')
        return
      }
      setFormData(prev => ({ ...prev, profile_picture: file }))
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfilePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCoverPhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Cover photo must be less than 10MB')
        return
      }
      setFormData(prev => ({ ...prev, cover_photo: file }))
      const reader = new FileReader()
      reader.onloadend = () => {
        setCoverPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCancel = () => {
    setFormData({
      full_name: profileUser?.full_name || '',
      username: profileUser?.username || '',
      bio: profileUser?.bio || '',
      location: profileUser?.location || '',
      profile_picture: null,
      cover_photo: null,
    })
    setProfilePreview(profileUser?.profile_picture || null)
    setCoverPreview(profileUser?.cover_photo || null)
    setIsEditing(false)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const token = await getToken()
      if (!token) {
        toast.error('Authentication required. Please login again.')
        return
      }

      const formDataToSend = new FormData()
      formDataToSend.append('full_name', formData.full_name)
      formDataToSend.append('username', formData.username)
      formDataToSend.append('bio', formData.bio)
      formDataToSend.append('location', formData.location)

      if (formData.profile_picture) {
        formDataToSend.append('profile', formData.profile_picture)
      }

      if (formData.cover_photo) {
        formDataToSend.append('cover', formData.cover_photo)
      }

      const response = await api.post('/api/user/update', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      })

      
      // Refetch user data to update Redux state
      dispatch(fetchUserData(token))
      
      if (onSave) {
        onSave(response.data.user || response.data)
      }
      
      toast.success('Profile updated successfully!')
      setIsEditing(false)
      onClose?.()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile')
      console.error('Error updating profile:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={() => !isEditing && onClose?.()}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          className="w-full max-w-2xl bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-xl font-bold text-gray-900">
              {isCurrentUser && isEditing ? 'Edit Profile' : 'Profile'}
            </h2>
            <div className="flex items-center gap-2">
              {isCurrentUser && !isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
              )}
              {isCurrentUser && isEditing && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save
                      </>
                    )}
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() => isEditing ? handleCancel() : onClose?.()}
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cover */}
          <div className="relative h-48 bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400">
            {cover ? (
              <img
                src={cover}
                alt="Cover"
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            ) : null}

            {isCurrentUser && isEditing && (
              <>
                <input
                  type="file"
                  ref={coverInputRef}
                  accept="image/*"
                  onChange={handleCoverPhotoChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => coverInputRef.current?.click()}
                  className="absolute top-4 right-4 p-2 rounded-lg bg-black/50 hover:bg-black/70 text-white transition-colors"
                  aria-label="Change cover photo"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Profile Content */}
          <div className="px-6 pb-6">
            {/* Profile Picture and Info */}
            <div className="flex items-end gap-4 -mt-16 mb-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-purple-500 flex items-center justify-center">
                      <span className="text-white font-semibold text-4xl">
                        {name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                  )}
                </div>
                {isCurrentUser && isEditing && (
                  <>
                    <input
                      type="file"
                      ref={profileInputRef}
                      accept="image/*"
                      onChange={handleProfilePictureChange}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => profileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 p-2 rounded-full bg-purple-600 hover:bg-purple-700 text-white shadow-lg transition-colors"
                      aria-label="Change profile picture"
                    >
                      <Camera className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Form Fields */}
            {isCurrentUser && isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    placeholder="Enter your username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    placeholder="Enter your location"
                  />
                </div>
              </div>
            ) : (
              <>
                {/* Display Mode */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold text-gray-900">
                        {name}
                      </h3>
                      {profileUser?.is_verified && (
                        <svg className="w-5 h-5 text-blue-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">@{username}</p>
                  </div>

                  {profileUser?.bio && (
                    <div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{profileUser.bio}</p>
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    {profileUser?.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        <span>{profileUser.location}</span>
                      </div>
                    )}
                    {joinedText && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>{joinedText}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions for non-current user */}
                {!isCurrentUser && (
                  <div className="mt-6 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onMessage?.(profileUser?._id)}
                      className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Message
                    </button>

                    <button
                      type="button"
                      onClick={() => onFollowToggle?.(profileUser?._id)}
                      className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 ${
                        isFollowing ? 'bg-gray-100 hover:bg-gray-200 text-gray-700' : 'bg-purple-50 hover:bg-purple-100 text-purple-700'
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
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfileModal