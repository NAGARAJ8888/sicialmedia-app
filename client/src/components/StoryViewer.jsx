import React, { useEffect, useMemo, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import moment from "moment";

const StoryViewer = ({ open, stories = [], initialIndex = 0, onClose }) => {
  const safeStories = useMemo(
    () => (Array.isArray(stories) ? stories.filter(Boolean) : []),
    [stories]
  );

  const [index, setIndex] = useState(initialIndex || 0);
  const [progress, setProgress] = useState(0);
  const videoRef = useRef(null);

  const clampedIndex = Math.min(
    Math.max(index, 0),
    safeStories.length > 0 ? safeStories.length - 1 : 0
  );

  const current = safeStories[clampedIndex] || null;

  const total = safeStories.length;
  const name = current?.user?.full_name || "User";
  const username = current?.user?.username || "user";
  const avatar = current?.user?.profile_picture;
  const createdAt = current?.createdAt;
  const timeAgo = createdAt ? moment(createdAt).fromNow() : "";
  const isText = current?.media_type === "text";
  const isVideo = current?.media_type === "video";
  const isImage = current?.media_type === "image";

  const bgStyle = isText
    ? { backgroundColor: current?.background_color || "#4f46e5" }
    : undefined;

  useEffect(() => {
    if (!open) return;
    setIndex(initialIndex || 0);
  }, [open, initialIndex]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose?.();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // auto progress for each story (video uses actual duration, others use fixed time)
  useEffect(() => {
    if (!open || !current) return;

    setProgress(0);

    // If it's a video, progress is tied to video playback
    if (isVideo && videoRef.current) {
      const video = videoRef.current;

      const handleTimeUpdate = () => {
        if (!video.duration || Number.isNaN(video.duration)) return;
        const ratio = Math.min(video.currentTime / video.duration, 1);
        setProgress(ratio);
      };

      const handleEnded = () => {
        if (clampedIndex < safeStories.length - 1) {
          setIndex((prev) => Math.min(prev + 1, safeStories.length - 1));
        } else {
          onClose?.();
        }
      };

      video.addEventListener("timeupdate", handleTimeUpdate);
      video.addEventListener("ended", handleEnded);

      // start playing in case not already
      video.play?.().catch(() => {});

      return () => {
        video.removeEventListener("timeupdate", handleTimeUpdate);
        video.removeEventListener("ended", handleEnded);
      };
    }

    // Non-video: smooth timer-based progress (10s per story)
    const duration = 10000; // 10s per story
    const start = performance.now();

    let frameId;
    const tick = (now) => {
      const elapsed = now - start;
      const ratio = Math.min(elapsed / duration, 1);
      setProgress(ratio);

      if (ratio >= 1) {
        if (clampedIndex < safeStories.length - 1) {
          setIndex((prev) => Math.min(prev + 1, safeStories.length - 1));
        } else {
          onClose?.();
        }
        return;
      }

      frameId = requestAnimationFrame(tick);
    };

    frameId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(frameId);
  }, [open, current, clampedIndex, safeStories.length, onClose, isVideo]);

  if (!open || !current) return null;

  function goNext() {
    if (clampedIndex < total - 1) {
      setIndex((prev) => Math.min(prev + 1, total - 1));
    } else {
      onClose?.();
    }
  }

  function goPrev() {
    if (clampedIndex > 0) {
      setIndex((prev) => Math.max(prev - 1, 0));
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
      {/* backdrop */}
      <button
        type="button"
        className="absolute inset-0 cursor-default z-50"
        onClick={() => onClose?.()}
        aria-label="Close stories"
      />

      <div className="relative w-full h-full max-w-3xl mx-auto px-0 py-0 md:px-4 md:py-6 flex flex-col gap-3 pointer-events-none">
        {/* header */}
        <div className="flex items-center justify-between text-white pointer-events-auto">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/10 overflow-hidden border border-white/20">
              {avatar ? (
                <img
                  src={avatar}
                  alt={name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-white/10" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">{name}</p>
              <p className="text-[11px] text-gray-200">
                @{username}
                {timeAgo ? ` · ${timeAgo}` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {total > 1 && (
              <p className="text-[11px] text-gray-300">
                {clampedIndex + 1} / {total}
              </p>
            )}
            <button
              type="button"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white pointer-events-auto"
              onClick={() => onClose?.()}
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* progress bar */}
        <div className="h-1 w-full bg-white/20 rounded-full overflow-hidden pointer-events-auto">
          <div
            className="h-full bg-white transition-[width] duration-100 linear"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        {/* content */}
        <div className="flex-1 flex items-center justify-center pointer-events-auto relative w-full">
          <div className="relative w-full h-full bg-black">
            {isText && (
              <div
                className="absolute inset-0 flex items-center justify-center p-6"
                style={bgStyle}
              >
                <p className="text-white text-sm font-semibold leading-snug text-center whitespace-pre-wrap wrap-break-word">
                  {current?.content || ""}
                </p>
              </div>
            )}

            {isImage && (
              <img
                src={current?.media_url}
                alt={`${name} story`}
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}

            {isVideo && (
              <video
                ref={videoRef}
                src={current?.media_url}
                className="absolute inset-0 w-full h-full object-cover"
                controls
                autoPlay
              />
            )}
          </div>

          {/* tap zones */}
          <button
            type="button"
            aria-label="Previous story"
            className="absolute inset-y-0 left-0 w-1/3 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
          />
          <button
            type="button"
            aria-label="Next story"
            className="absolute inset-y-0 right-0 w-1/3 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
          />
        </div>

        {/* desktop arrows */}
        {total > 1 && (
          <>
            {clampedIndex > 0 && (
              <button
                type="button"
                aria-label="Previous"
                className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white pointer-events-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  goPrev();
                }}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            {clampedIndex < total - 1 && (
              <button
                type="button"
                aria-label="Next"
                className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white pointer-events-auto"
                onClick={(e) => {
                  e.stopPropagation();
                  goNext();
                }}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StoryViewer;


