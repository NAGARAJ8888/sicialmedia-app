import express from "express";
import { protect } from "../middlewares/auth.js";
import { sendMessage, getChatMessages, getUserRecentMessages, sseController, markMessagesAsSeen } from "../controllers/messageController.js";
import { upload } from "../config/multer.js";

const messageRouter = express.Router();

// Specific API routes
messageRouter.post('/send', upload.single('image'), protect, sendMessage);
messageRouter.post('/chat', protect, getChatMessages);
messageRouter.get('/recent', protect, getUserRecentMessages);
messageRouter.post('/mark-seen', protect, markMessagesAsSeen);

// SSE connection for server-sent events (separate path to avoid route conflicts)
messageRouter.get('/sse/:userId', sseController);

export default messageRouter;