import express from "express";
import multer from "multer";
import { protect } from "../middlewares/auth.js";
import { sendMessage, getChatMessages, getUserRecentMessages, sseController, markMessagesAsSeen } from "../controllers/messageController.js";
import { upload } from "../config/multer.js";

const messageRouter = express.Router();

// Multer error handling middleware
const handleMulterError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ message: 'File too large. Maximum size is 5MB.' });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({ message: 'Too many files.' });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({ message: 'Unexpected file field.' });
        }
        return res.status(400).json({ message: err.message });
    }
    if (err) {
        return res.status(400).json({ message: err.message });
    }
    next();
};

// Specific API routes
messageRouter.post('/send', upload.single('image'), handleMulterError, protect, sendMessage);
messageRouter.post('/chat', protect, getChatMessages);
messageRouter.get('/recent', protect, getUserRecentMessages);
messageRouter.post('/mark-seen', protect, markMessagesAsSeen);

// SSE connection for server-sent events (separate path to avoid route conflicts)
messageRouter.get('/sse/:userId', sseController);

export default messageRouter;