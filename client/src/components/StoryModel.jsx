import React, { useEffect, useMemo, useState } from "react";
import { X, Image as ImageIcon, Type as TypeIcon, Upload } from "lucide-react";
import moment from "moment";

const BG_COLORS = [
  "#4f46e5",
  "#7c3aed",
  "#db2777",
  "#0ea5e9",
  "#10b981",
  "#111827",
];

const StoryModel = ({ open, onClose }) => {
  const [mode, setMode] = useState("media"); // 'media' | 'text'
  const [text, setText] = useState("");
  const [bg, setBg] = useState(BG_COLORS[0]);
  const [file, setFile] = useState(null);

  const previewUrl = useMemo(() => {
    if (!file) return "";
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!open) return;
    // reset when opened (simple UX)
    setMode("media");
    setText("");
    setBg(BG_COLORS[0]);
    setFile(null);
  }, [open]);

  if (!open) return null;

  const nowLabel = moment().fromNow();

  return (
    <div className="fixed inset-0 z-50">
      {/* backdrop */}
      <button
        type="button"
        aria-label="Close create story"
        className="absolute inset-0 bg-black/50"
        onClick={() => onClose?.()}
      />

      {/* dialog */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* header */}
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Create story</h2>
              <p className="text-xs text-gray-500">Post to your story · {nowLabel}</p>
            </div>
            <button
              type="button"
              className="p-2 rounded-lg hover:bg-gray-50 text-gray-600"
              onClick={() => onClose?.()}
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* body */}
          <div className="grid grid-cols-1 md:grid-cols-[1fr_360px] gap-0">
            {/* left: editor */}
            <div className="p-5">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setMode("media")}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors flex items-center gap-2 ${
                    mode === "media"
                      ? "bg-purple-50 border-purple-200 text-purple-700"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <ImageIcon className="w-4 h-4" />
                  Media
                </button>
                <button
                  type="button"
                  onClick={() => setMode("text")}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors flex items-center gap-2 ${
                    mode === "text"
                      ? "bg-purple-50 border-purple-200 text-purple-700"
                      : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <TypeIcon className="w-4 h-4" />
                  Text
                </button>
              </div>

              {mode === "media" ? (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-800">
                    Upload photo/video
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Recommended: vertical 9:16 (1080×1920)
                  </p>

                  <div className="mt-3">
                    <label className="w-full cursor-pointer border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors">
                      <Upload className="w-6 h-6 text-gray-500" />
                      <p className="mt-2 text-sm font-medium text-gray-800">
                        Click to choose a file
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        PNG, JPG, MP4 (max size depends on your browser)
                      </p>
                      <input
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-800">
                    Your story text
                  </label>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={6}
                    placeholder="Type something…"
                    className="mt-2 w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-200 focus:border-purple-300"
                  />

                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-800">Background</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {BG_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setBg(c)}
                          className={`w-8 h-8 rounded-full border ${
                            bg === c ? "border-gray-900" : "border-gray-200"
                          }`}
                          style={{ backgroundColor: c }}
                          aria-label={`Background ${c}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* footer actions */}
              <div className="mt-6 flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-medium"
                  onClick={() => onClose?.()}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold"
                  onClick={() => onClose?.()}
                >
                  Share
                </button>
              </div>
            </div>

            {/* right: preview */}
            <div className="border-t md:border-t-0 md:border-l border-gray-200 p-5">
              <p className="text-sm font-medium text-gray-900">Preview</p>
              <div className="mt-3 mx-auto w-[240px] h-[420px] rounded-2xl overflow-hidden bg-gray-100 relative shadow-sm">
                {mode === "text" ? (
                  <div
                    className="absolute inset-0 flex items-center justify-center p-5"
                    style={{ backgroundColor: bg }}
                  >
                    <p className="text-white text-sm font-semibold leading-snug text-center whitespace-pre-wrap wrap-break-word">
                      {text || "Your text will appear here"}
                    </p>
                  </div>
                ) : file && previewUrl ? (
                  file.type.startsWith("video/") ? (
                    <video
                      className="absolute inset-0 w-full h-full object-cover"
                      src={previewUrl}
                      controls
                    />
                  ) : (
                    <img
                      className="absolute inset-0 w-full h-full object-cover"
                      src={previewUrl}
                      alt="Story preview"
                    />
                  )
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p className="text-xs text-gray-500">Nothing to preview yet</p>
                  </div>
                )}
              </div>
              <p className="mt-3 text-xs text-gray-500">
                This is only a preview. Final appearance may vary slightly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryModel;





