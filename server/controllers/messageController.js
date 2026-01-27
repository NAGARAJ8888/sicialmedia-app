import imagekit from '../config/imagekit.js';
import Message from '../models/message.js';

// Create an empty object to store SS Event Connections
const connections = {};

export const sseController = async (req, res) => {
    const { userId } = req.params;
    console.log(`SSE connection established for user: ${userId}`);

    //set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');

    //add the clients response to the connections object
    connections[userId] = res;

    //send an initial event to the client
    res.write(`log: Connected to SSE stream \n\n`);

    //Handle client disconnection
    req.on('close', () => {
        console.log(`SSE connection closed for user: ${userId}`);
        delete connections[userId];
    });
}

// Send message to a user
export const sendMessage = async (req, res) => {
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
  
      const { to_user_id, text } = req.body;
      const image = req.file; // single image
  
      if (!to_user_id) {
        return res.status(400).json({ message: "Receiver user id is required" });
      }
  
      if (!text && !image) {
        return res.status(400).json({ message: "Message text or image is required" });
      }
  
      let media_url = "";
      let message_type = image ? "image" : "text";
  
      // Handle image upload
      if (image) {
        try {
          const buffer = image.buffer;
          const base64File = buffer.toString("base64");
  
          const response = await imagekit.files.upload({
            file: `data:${image.mimetype};base64,${base64File}`,
            fileName: image.originalname,
            folder: `/messages/${userId}`,
          });
  
          console.log("Message image uploaded:", response.filePath);
  
          media_url = imagekit.helper.buildSrc({
            urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
            src: response.filePath,
            transformation: [
              { quality: "auto" },
              { format: "webp" },
              { width: 720 },
            ],
          });
        } catch (uploadError) {
          console.error("Message image upload failed:", uploadError);
          return res.status(500).json({ message: "Failed to upload message image" });
        }
      }
  
      // Create message
      const message = await Message.create({
        from_user_id: userId,
        to_user_id,
        text: text || "",
        media_url,
        message_type,
        is_read: false,
      });
  
      res.status(201).json({
        message: "Message sent successfully",
        data: message,
      });
  
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: error.message });
    }
};
  
// Get messages between two users
export const getChatMessages = async (req, res) => {
    try {
      // Auth safety
      const auth = req.auth?.();
      const userId = auth?.userId;
  
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
  
      // Parse body if multipart or stringified JSON
      if (typeof req.body === "string") {
        req.body = JSON.parse(req.body);
      }
  
      const { to_user_id } = req.body;
  
      if (!to_user_id) {
        return res.status(400).json({ message: "Receiver user id is required" });
      }
  
      // Fetch messages between both users
      const messages = await Message.find({
        $or: [
          { from_user_id: userId, to_user_id },
          { from_user_id: to_user_id, to_user_id: userId },
        ],
      }).sort({ createdAt: 1 }); // oldest → newest
  
      res.status(200).json({
        message: "Messages fetched successfully",
        messages,
      });
  
    } catch (error) {
      console.error("Error getting messages:", error);
      res.status(500).json({ message: error.message });
    }
};

// Get recent messages (conversation list)
export const getUserRecentMessages = async (req, res) => {
    try {
      // Auth safety
      const auth = req.auth?.();
      const userId = auth?.userId;
  
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }
  
      // Aggregate to get last message per conversation
      const conversations = await Message.aggregate([
        {
          $match: {
            $or: [
              { from_user_id: userId },
              { to_user_id: userId },
            ],
          },
        },
        {
          $addFields: {
            chat_user: {
              $cond: [
                { $eq: ["$from_user_id", userId] },
                "$to_user_id",
                "$from_user_id",
              ],
            },
          },
        },
        { $sort: { createdAt: -1 } },
        {
          $group: {
            _id: "$chat_user",
            last_message: { $first: "$$ROOT" },
          },
        },
        { $sort: { "last_message.createdAt": -1 } },
      ]);
  
      res.status(200).json({
        message: "Recent conversations fetched successfully",
        conversations,
      });
  
    } catch (error) {
      console.error("Error getting recent messages:", error);
      res.status(500).json({ message: error.message });
    }
};
  
  