import React, { useMemo, useState, useEffect } from "react";
import { Plus } from "lucide-react";
import moment from "moment";
import StoryModel from "./StoryModel";
import StoryViewer from "./StoryViewer";
import { useSelector, useDispatch } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import { fetchStories } from "../features/stories/storiesSlice";

const StoriesBar = () => {
  const dispatch = useDispatch();
  const { getToken } = useAuth();
  const [storyModelOpen, setStoryModelOpen] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const stories = useSelector((state) => state.stories.stories || []);

  useEffect(() => {
    const getStories = async () => {
      try {
        const token = await getToken();
        if (token) {
          dispatch(fetchStories(token));
        }
      } catch (error) {
        console.error('Error fetching stories:', error);
      }
    };

    getStories();
  }, [dispatch, getToken]);

  const items = useMemo(() => (Array.isArray(stories) ? stories : []), [stories]);

  return (
    <div className="w-full no-scrollbar scrollbar-none overflow-x-auto px-4">
      <div className="flex gap-4 pb-5">
        {/* Add story */}
        <button
          type="button"
          className="group flex flex-col items-center gap-2 shrink-0"
          onClick={() => setStoryModelOpen(true)}
        >
          <div className="relative w-[120px] h-[160px] rounded-2xl bg-linear-to-br from-purple-600 to-indigo-600 p-[2px] shadow-sm">
            <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center">
              <span className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                <Plus className="w-6 h-6" />
              </span>
            </div>
          </div>
          <p className="text-xs font-medium text-gray-700">Add story</p>
        </button>

        {/* Stories */}
        {items.map((story) => {
          const name = story?.user?.full_name || "User";
          const username = story?.user?.username || "user";
          const avatar = story?.user?.profile_picture;
          const createdAt = story?.createdAt;
          const timeAgo = createdAt ? moment(createdAt).fromNow() : "";
          const isText = story?.media_type === "text";
          const isVideo = story?.media_type === "video";
          const isImage = story?.media_type === "image";

          const previewStyle = isText
            ? { backgroundColor: story?.background_color || "#4f46e5" }
            : undefined;

          return (
            <button
              key={story?._id || `${username}-${Math.random()}`}
              type="button"
              className="group flex flex-col items-center gap-2 shrink-0"
              onClick={() => {
                const idx = items.findIndex((s) => s?._id === story?._id);
                setViewerIndex(idx >= 0 ? idx : 0);
                setViewerOpen(true);
              }}
              title={name}
            >
              <div className="relative w-[120px] h-[160px] rounded-2xl bg-linear-to-br from-fuchsia-500 via-purple-500 to-indigo-500 p-[2px] shadow-sm">
                <div className="w-full h-full rounded-2xl bg-white p-[2px] overflow-hidden">
                  <div className="w-full h-full rounded-[14px] overflow-hidden bg-gray-100 relative">
                    {isText && (
                      <div
                        className="absolute inset-0 flex items-center justify-center p-2"
                        style={previewStyle}
                      >
                        <p className="text-[10px] leading-snug font-semibold text-white line-clamp-3 text-center drop-shadow-sm">
                          {story?.content || "Story"}
                        </p>
                      </div>
                    )}

                    {(isImage || isVideo) && (
                      <div className="absolute inset-0 w-full h-full bg-gray-100">
                        {isVideo ? (
                          <video
                            src={story?.media_url}
                            alt={`${name} story`}
                            className="absolute inset-0 w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        ) : (
                          <img
                            src={story?.media_url}
                            alt={`${name} story`}
                            className="absolute inset-0 w-full h-full object-cover"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />
                        )}
                      </div>
                    )}

                    {/* avatar chip (top-left) */}
                    <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm p-[2px] shadow-sm">
                      <div className="w-full h-full rounded-full bg-gray-200 overflow-hidden">
                        {avatar ? (
                          <img
                            src={avatar}
                            alt={name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-linear-to-br from-gray-200 to-gray-300" />
                        )}
                      </div>
                    </div>

                    {/* time ago (bottom-right) */}
                    {!!timeAgo && (
                      <div className="absolute bottom-2 right-2">
                        <span className="px-2 py-1 text-[10px] font-medium text-white bg-black/55 rounded-md backdrop-blur-sm">
                          {timeAgo}
                        </span>
                      </div>
                    )}

                    {/* subtle hover */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                  </div>
                </div>
              </div>

              <p className="text-xs font-medium text-gray-700 max-w-[120px] truncate">
                {name}
              </p>
            </button>
          );
        })}
      </div>

      <StoryModel open={storyModelOpen} onClose={() => setStoryModelOpen(false)} />
      <StoryViewer
        open={viewerOpen}
        stories={items}
        initialIndex={viewerIndex}
        onClose={() => setViewerOpen(false)}
      />
    </div>
  );
};

export default StoriesBar;