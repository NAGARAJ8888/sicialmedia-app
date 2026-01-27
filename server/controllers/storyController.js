import imagekit from "../config/imagekit.js";
import { inngest } from "../inngest/index.js";
import Story from "../models/story.js";

// Add user story
export const addUserStory = async (req, res) => {
    try {
      // Auth safety
      const auth = req.auth?.();
      const userId = auth?.userId;
  
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
  
      // Parse body if multipart sends stringified JSON
      if (typeof req.body === "string") {
        req.body = JSON.parse(req.body);
      }
  
      const { content, media_type, background_color } = req.body;
      const media = req.file; // single file
  
      // Validation
      if (!content && !media) {
        return res.status(400).json({ message: "Story content or media is required" });
      }
  
      let media_url = null;
  
      // Handle media upload (image / video)
      if (media) {
        try {
          const buffer = media.buffer;
          const base64File = buffer.toString("base64");
  
          const response = await imagekit.files.upload({
            file: `data:${media.mimetype};base64,${base64File}`,
            fileName: media.originalname,
            folder: `/stories/${userId}`,
          });
  
          console.log("Story media uploaded:", response.filePath);
  
          media_url = imagekit.helper.buildSrc({
            urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
            src: response.filePath,
            transformation:
              media.mimetype.startsWith("image/")
                ? [{ quality: "auto" }, { format: "webp" }, { width: 720 }]
                : undefined, // no transformation for videos
          });
        } catch (uploadError) {
          console.error("Story media upload failed:", uploadError);
          return res.status(500).json({ message: "Failed to upload story media" });
        }
      }
  
      // Create story
      const story = await Story.create({
        user: userId,
        content,
        media_url,
        media_type: media_type || (media ? "image" : "text"),
        background_color,
        views_count: [],
      });

      //schedule story deletion after 24 hours
      await inngest.send({
        name: 'app/story.delete',
        data: {storyId: story._id}
      })
  
      res.status(201).json({
        message: "Story added successfully",
        story,
      });
  
    } catch (error) {
      console.error("Add story error:", error);
      res.status(500).json({ message: error.message });
    }
};
  
// Get stories grouped by user
export const getStories = async (req, res) => {
    try {
      const stories = await Story.aggregate([
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: "$user",
            stories: { $push: "$$ROOT" },
          },
        },
        { $sort: { "stories.createdAt": -1 } },
      ]);
  
      res.status(200).json({
        message: "Stories fetched successfully",
        stories,
      });
    } catch (error) {
      console.error("Get stories error:", error);
      res.status(500).json({ message: error.message });
    }
};
  