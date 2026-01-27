import express from "express";
import { protect } from "../middlewares/auth.js";
import { sendMessage, getChatMessages, getUserRecentMessages, sseController } from "../controllers/messageController.js";
import { upload } from "../config/multer.js";

const messageRouter = express.Router();

messageRouter.get('/:userId', sseController);
messageRouter.post('/send', upload.single('image'), protect, sendMessage);
messageRouter.get('/chat', protect, getChatMessages);
messageRouter.get('/recent', protect, getUserRecentMessages);

export default messageRouter;