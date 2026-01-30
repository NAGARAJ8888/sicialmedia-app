import React, { useEffect } from "react";
import { assets } from "../assets/assets";
import Loading from "../components/Loading";
import StoriesBar from "../components/StoriesBar";
import Postcard from "../components/Postcard";
import { ExternalLink, MessageCircle } from "lucide-react";
import moment from "moment";
import { Link } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import { fetchFeedPosts } from "../features/posts/postsSlice";
import { fetchRecentMessages } from "../features/messages/messagesSlice";

const Feed = () => {
  const dispatch = useDispatch();
  const { getToken } = useAuth();
  const posts = useSelector((state) => state.posts.posts || []);
  const recentChats = useSelector((state) => state.messages.recentChats || []);
  const currentUser = useSelector((state) => state.user.value);
  const loading = useSelector((state) => state.posts.loading);

  useEffect(() => {
    const getFeedPosts = async () => {
      try {
        const token = await getToken();
        if (token) {
          dispatch(fetchFeedPosts(token));
        }
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };

    getFeedPosts();
    dispatch(fetchRecentMessages());
  }, [dispatch, getToken]);

  // Get recent unseen messages from other users only (last 5)
  const recentMessages = recentChats
    .filter((chat) => {
      const message = chat?.last_message;
      return (
        message?.from_user_id !== currentUser?._id && message?.seen === false
      );
    })
    .slice(0, 5);

  return !loading ? (
    <div className="h-full overflow-y-scroll no-scrollbar py-10 xl:pr-5 flex items-start justify-center xl:gap-8">
      {/* stories and post list */}
      <div className="w-full max-w-2xl">
        <StoriesBar />
        <div className="space-y-6">
          {posts.map((post) => (
            <Postcard key={post._id} post={post} />
          ))}
        </div>
      </div>

      {/* Right sidebar */}
      <div className="w-full max-w-xs space-y-6 hidden xl:block">
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
                Explore our curated collection of premium products designed to
                enhance your lifestyle.
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
            <h2 className="text-sm font-semibold text-gray-900">
              Recent Messages
            </h2>
            <Link
              to="/app/messages"
              className="text-xs text-purple-600 hover:text-purple-700 font-medium"
            >
              See all
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentMessages.map((chat) => {
              const message = chat?.last_message || {};
              const user = chat?.user || {};
              const unseenCount = chat?.unseenCount || 0;
              const name = user?.full_name || "User";
              const username = user?.username || "user";
              const avatar = user?.profile_picture;

              const messageText = message?.text || "";
              const isSeen = message?.seen !== false;
              const timeAgo = moment(message?.createdAt).fromNow();

              return (
                <Link
                  key={chat._id}
                  to={`/app/messages/${user._id}`}
                  className="flex items-start gap-3 p-4 hover:bg-gray-50"
                >
                <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                    {avatar ? (
                    <img src={avatar} className="w-full h-full object-cover" />
                    ) : (
                    <div className="w-full h-full bg-gray-300" />
                    )}
                </div>

                {/* 🔴 Unseen Count Badge */}
                {unseenCount > 0 && (
                    <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px]
                    px-1 text-[10px] font-semibold text-white bg-purple-600
                    rounded-full flex items-center justify-center">
                    {unseenCount}
                    </span>
                )}
                </div>

                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="font-semibold">{name}</p>
                      <span className="text-xs text-gray-400">{timeAgo}</span>
                    </div>

                    <p className="text-xs text-gray-600 truncate">
                      {messageText || "Media"}
                    </p>
                  </div>
                </Link>
              );
            })}

            {recentMessages.length === 0 && (
              <div className="p-8 text-center">
                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No recent messages</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  ) : (
    <Loading />
  );
};

export default Feed;
