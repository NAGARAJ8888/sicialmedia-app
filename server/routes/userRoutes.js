import express from "express";
import multer from "multer";
import { getUserData, updateUserData, deleteUserData, discoverUsers, followUser, unfollowUser, sendConnectionRequest, acceptConnectionRequest, getUserConnections, getUserProfiles } from "../controllers/userController.js";
import { protect } from "../middlewares/auth.js";
import { upload } from "../config/multer.js";

const userRouter = express.Router()

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
        // Handle file filter errors
        if (err.message === 'Invalid file type. Only images (JPEG, PNG, GIF, WebP) are allowed.') {
            return res.status(400).json({ message: err.message });
        }
        return res.status(400).json({ message: err.message });
    }
    next();
};

userRouter.get('/data', protect, getUserData);
userRouter.post('/update', 
    protect, 
    upload.fields([
        {name: 'profile', maxCount: 1},
        {name: 'cover', maxCount: 1}
    ]),
    handleMulterError,
    updateUserData
);
userRouter.post('/discover', protect, discoverUsers);
userRouter.post('/follow', protect, followUser);
userRouter.post('/unfollow', protect, unfollowUser);
userRouter.post('/connect', protect, sendConnectionRequest);
userRouter.post('/accept', protect, acceptConnectionRequest);
userRouter.get('/connections', protect, getUserConnections);

userRouter.post('/profiles', getUserProfiles);

export default userRouter