import imagekit from "../config/imagekit.js";
import { inngest } from "../inngest/index.js";
import Story from "../models/story.js";

// Add user story
export const addUserStory = async (req, res) => {
  try {
    console.log(req.file?.mimetype, req.file?.size);
    const auth = req.auth?.();
    const userId = auth?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { content, media_type, background_color } = req.body;
    const media = req.file;

    if (!content && !media) {
      return res.status(400).json({ message: "Story content or media is required" });
    }

    let media_url = null;
    let finalMediaType = media_type;

    if (media) {
      if (media.mimetype.startsWith("video/")) finalMediaType = "video";
      else if (media.mimetype.startsWith("image/")) finalMediaType = "image";
      else return res.status(400).json({ message: "Unsupported media type" });

      const base64File = media.buffer.toString("base64");

      const response = await imagekit.files.upload({
        file: `data:${media.mimetype};base64,${base64File}`,
        fileName: media.originalname,
        folder: `/stories/${userId}`,
        useUniqueFileName: true,
      });

      media_url = imagekit.helper.buildSrc({
        urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
        src: response.filePath,
      });
    }

    const story = await Story.create({
      user: userId,
      content,
      media_url,
      media_type: finalMediaType || "text",
      background_color,
      views_count: [],
    });

    await inngest.send({
      name: "app/story.delete",
      data: { storyId: story._id },
    });

    res.status(201).json({ message: "Story added successfully", story });

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
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $unwind: {
            path: '$user',
            preserveNullAndEmptyArrays: true
          }
        }
      ]);
  
      res.status(200).json({
        success: true,
        message: "Stories fetched successfully",
        stories,
      });
    } catch (error) {
      console.error("Get stories error:", error);
      res.status(500).json({ message: error.message });
    }
};
  