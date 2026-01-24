import React, { useState } from "react";
import { Heart, MessageCircle, Share2, MoreVertical, Bookmark } from "lucide-react";
import moment from "moment";

const Postcard = ({ post }) => {
  if (!post) return null;

  const user = post?.user || {};
  const name = user?.full_name || "User";
  const username = user?.username || "user";
  const avatar = user?.profile_picture;
  const isVerified = user?.is_verified || false;
  const content = post?.content || "";
  const imageUrls = post?.image_urls || [];
  const postType = post?.post_type || "text";
  const likesCount = Array.isArray(post?.likes_count) ? post.likes_count.length : 0;
  const createdAt = post?.createdAt;
  const timeAgo = createdAt ? moment(createdAt).fromNow() : "";

  const [isLiked, setIsLiked] = useState(likesCount > 0);
  const [currentLikes, setCurrentLikes] = useState(likesCount);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setCurrentLikes((prev) => (isLiked ? prev - 1 : prev + 1));
  };

  // Extract hashtags from content
  const renderContent = (text) => {
    if (!text) return null;
    const parts = text.split(/(#\w+)/g);
    return parts.map((part, idx) => {
      if (part.startsWith("#")) {
        return (
          <span key={idx} className="text-purple-600 font-medium hover:underline cursor-pointer">
            {part}
          </span>
        );
      }
      return <span key={idx}>{part}</span>;
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 pb-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 shrink-0">
            {avatar ? (
              <img
                src={avatar}
                alt={name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full bg-gray-300" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
              {isVerified && (
                <svg
                  className="w-4 h-4 text-blue-500 shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <span>@{username}</span>
              {timeAgo && (
                <>
                  <span>·</span>
                  <span>{timeAgo}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <button
          type="button"
          className="p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors shrink-0"
          aria-label="More options"
        >
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      {content && (
        <div className="px-4 pb-3">
          <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap wrap-break-word">
            {renderContent(content)}
          </p>
        </div>
      )}

      {/* Images */}
      {imageUrls.length > 0 && (
        <div className="w-full">
          {imageUrls.length === 1 ? (
            <div className="w-full bg-gray-100">
              <img
                src={imageUrls[0]}
                alt="Post content"
                className="w-full h-auto object-cover"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-0.5 bg-gray-100 p-0.5">
              {imageUrls.slice(0, 4).map((url, idx) => (
                <div
                  key={idx}
                  className={`${
                    imageUrls.length === 3 && idx === 2 ? "col-span-2" : ""
                  } bg-gray-200 aspect-square overflow-hidden`}
                >
                  <img
                    src={url}
                    alt={`Post content ${idx + 1}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-100">
        {/* Action Buttons */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleLike}
              className={`flex items-center gap-2 transition-colors ${
                isLiked ? "text-red-500" : "text-gray-600 hover:text-red-500"
              }`}
              aria-label="Like"
            >
              <Heart className={`w-5 h-5 ${isLiked ? "fill-current" : ""}`} />
            </button>
            <button
              type="button"
              className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
              aria-label="Comment"
            >
              <MessageCircle className="w-5 h-5" />
            </button>
            <button
              type="button"
              className="flex items-center gap-2 text-gray-600 hover:text-purple-600 transition-colors"
              aria-label="Share"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
          <button
            type="button"
            className="text-gray-600 hover:text-purple-600 transition-colors"
            aria-label="Save"
          >
            <Bookmark className="w-5 h-5" />
          </button>
        </div>

        {/* Likes Count */}
        {currentLikes > 0 && (
          <div className="mb-1">
            <p className="text-sm font-semibold text-gray-900">{currentLikes} likes</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Postcard;
