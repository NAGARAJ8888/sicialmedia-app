import React, { useEffect, useState } from 'react'
import { dummyPostsData, dummyRecentMessagesData, assets } from '../assets/assets';
import Loading from "../components/Loading"
import StoriesBar from '../components/StoriesBar';
import Postcard from '../components/Postcard';
import { ExternalLink, MessageCircle } from 'lucide-react';
import moment from 'moment';
import { Link } from 'react-router-dom';

const Feed = () => {

    const [feeds, setfeeds] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchFeeds = async () => {
        setfeeds(dummyPostsData)
        setLoading(false)
    }

    useEffect(()=>{
        fetchFeeds()
    }, [])

    return !loading ? (
        <div className='h-full overflow-y-scroll no-scrollbar py-10 xl:pr-5 flex items-start justify-center xl:gap-8'>
            {/* stories and post list */}
            <div className="w-full max-w-2xl">
                <StoriesBar/>
                <div className='space-y-6'>
                    {feeds.map((post) => (
                        <Postcard key={post._id} post={post} />
                    ))}
                </div>
            </div>

            {/* Right sidebar */}
            <div className="w-full max-w-xs space-y-6">
                {/* Sponsored Section */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 pb-3 border-b border-gray-100">
                        <h2 className="text-sm font-semibold text-gray-900">Sponsored</h2>
                    </div>
                    <div className="p-4">
                        <div className="relative w-full aspect-4/3 rounded-lg overflow-hidden bg-gray-100 mb-3">
                            <img
                                src={assets.sponsored_img}
                                alt="Sponsored content"
                                className="w-full h-full object-cover"
                                loading="lazy"
                                onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                }}
                            />
                            <div className="absolute top-2 right-2">
                                <span className="px-2 py-1 text-[10px] font-medium text-white bg-black/60 rounded-md backdrop-blur-sm">
                                    Ad
                                </span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-sm font-semibold text-gray-900 leading-tight">
                                Discover Amazing Products
                            </h3>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                Explore our curated collection of premium products designed to enhance your lifestyle.
                            </p>
                            <button
                                type="button"
                                className="w-full mt-3 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                Learn More
                                <ExternalLink className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Recent Messages Section */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-4 pb-3 border-b border-gray-100 flex items-center justify-between">
                        <h2 className="text-sm font-semibold text-gray-900">Recent Messages</h2>
                        <Link
                            to="/app/messages"
                            className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                        >
                            See all
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {dummyRecentMessagesData.slice(0, 5).map((message) => {
                            const user = message?.from_user_id || {};
                            const name = user?.full_name || "User";
                            const username = user?.username || "user";
                            const avatar = user?.profile_picture;
                            const messageText = message?.text || "";
                            const isSeen = message?.seen !== false;
                            const createdAt = message?.createdAt;
                            const timeAgo = createdAt ? moment(createdAt).fromNow() : "";
                            const messagePreview = messageText.length > 50 
                                ? `${messageText.substring(0, 50)}...` 
                                : messageText;

                            return (
                                <Link
                                    key={message?._id}
                                    to={`/app/messages/${user?._id || ""}`}
                                    className="flex items-start gap-3 p-4 hover:bg-gray-50 transition-colors group"
                                >
                                    <div className="relative shrink-0">
                                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
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
                                        {!isSeen && (
                                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-600 rounded-full border-2 border-white" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className={`text-sm font-medium truncate ${
                                                !isSeen ? "text-gray-900 font-semibold" : "text-gray-700"
                                            }`}>
                                                {name}
                                            </p>
                                            {timeAgo && (
                                                <span className="text-xs text-gray-500 shrink-0 ml-2">
                                                    {timeAgo}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {message?.message_type === "image" && (
                                                <MessageCircle className="w-3 h-3 text-gray-400 shrink-0" />
                                            )}
                                            <p className={`text-xs truncate ${
                                                !isSeen ? "text-gray-900 font-medium" : "text-gray-600"
                                            }`}>
                                                {messagePreview || "Media"}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                        {dummyRecentMessagesData.length === 0 && (
                            <div className="p-8 text-center">
                                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-sm text-gray-500">No recent messages</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    ): <Loading/>
}

export default Feed;