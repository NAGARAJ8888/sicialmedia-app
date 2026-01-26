import User from '../models/user.js';
import imagekit from '../config/imagekit.js';
import Connection from '../models/connection.js';
import { connect } from 'http2';

//get user data
export const getUserData = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

//update user data
export const updateUserData = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { full_name, username, email, bio, location } = req.body;

        // Debug logging
        console.log('Request body:', req.body);
        console.log('Request files:', req.files);
        console.log('Files keys:', req.files ? Object.keys(req.files) : 'No files');

        let profile_picture = undefined;
        let cover_photo = undefined;

        // Handle profile picture upload if present
        if (req.files && req.files.profile && req.files.profile.length > 0) {
            const file = req.files.profile[0];
            console.log('Processing profile picture:', file.originalname, file.mimetype);
            const fs = await import('fs/promises');
            
            try {
                const buffer = file.buffer;
                const base64File = buffer.toString("base64");

                const response = await imagekit.files.upload({
                file: `data:${file.mimetype};base64,${base64File}`,
                fileName: file.originalname,
                });


                console.log('ImageKit upload successful:', response.filePath);

                profile_picture = imagekit.helper.buildSrc({
                    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
                    src: response.filePath,
                    transformation: [
                        { quality: 'auto' },
                        { format: 'webp' },
                        { width: 150 }
                    ]
                });
                console.log('Profile picture URL generated:', profile_picture);

                // Clean up temp file after successful upload
                try {
                    await fs.unlink(file.path);
                } catch (unlinkError) {
                    console.error('Error deleting temp file:', unlinkError);
                }
            } catch (uploadError) {
                console.error('Error uploading profile picture to ImageKit:', uploadError);
                // Clean up temp file even on error
                try {
                    await fs.unlink(file.path);
                } catch (unlinkError) {
                    console.error('Error deleting temp file after upload error:', unlinkError);
                }
                throw new Error(`Failed to upload profile picture: ${uploadError.message}`);
            }
        }

        // Handle cover photo upload if present
        if (req.files && req.files.cover && req.files.cover.length > 0) {
            const file = req.files.cover[0];
            console.log('Processing cover photo:', file.originalname, file.mimetype);
            const fs = await import('fs/promises');
            
            try {
                const buffer = file.buffer;
                const base64File = buffer.toString("base64");

                const response = await imagekit.files.upload({
                file: `data:${file.mimetype};base64,${base64File}`,
                fileName: file.originalname,
                });


                console.log('ImageKit upload successful:', response.filePath);

                cover_photo = imagekit.helper.buildSrc({
                    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
                    src: response.filePath,
                    transformation: [
                        { quality: 'auto' },
                        { format: 'webp' },
                        { width: 1280 }
                    ]
                });
                console.log('Cover photo URL generated:', cover_photo);

                // Clean up temp file after successful upload
                try {
                    await fs.unlink(file.path);
                } catch (unlinkError) {
                    console.error('Error deleting temp file:', unlinkError);
                }
            } catch (uploadError) {
                console.error('Error uploading cover photo to ImageKit:', uploadError);
                // Clean up temp file even on error
                try {
                    await fs.unlink(file.path);
                } catch (unlinkError) {
                    console.error('Error deleting temp file after upload error:', unlinkError);
                }
                throw new Error(`Failed to upload cover photo: ${uploadError.message}`);
            }
        }

        // Prepare the update object only with values provided
        const update = {};
        if (full_name) update.full_name = full_name;
        if (username) update.username = username;
        if (email) update.email = email;
        if (bio) update.bio = bio;
        if (location) update.location = location;
        if (profile_picture) update.profile_picture = profile_picture;
        if (cover_photo) update.cover_photo = cover_photo;

        const user = await User.findByIdAndUpdate(
            userId,
            update,
            { new: true }
        );
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

//delete user data
export const deleteUserData = async (req, res) => {
    try {
        const { userId } = await req.auth();
        await User.findByIdAndDelete(userId);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

//find users using fullname, email, username, location
export const discoverUsers = async (req, res) => {
    try {
        const {userId} = await req.auth();
        const {input} = req.body;

        const allUsers = await User.find({
            $or: [
                { username: new RegExp(input, 'i') },
                { full_name: new RegExp(input, 'i') },
                { email: new RegExp(input, 'i') },
                { location: new RegExp(input, 'i') },
            ]
        })

        const filteredUsers = allUsers.filter(user => user._id !== userId);
        res.status(200).json({ success: true, users: filteredUsers });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

//follow users
export const followUser = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { followId } = req.body;

        if (userId === followId) {
            return res.status(400).json({ message: "You can't follow yourself" });
        }

        const userToFollow = await User.findById(followId);
        if (!userToFollow) {
            return res.status(404).json({ message: "User to follow not found" });
        }

        // Add followId to user's following list if not already
        const user = await User.findById(userId);
        if (!user.following.includes(followId)) {
            user.following.push(followId);
            await user.save();
        }

        // Add userId to followId's followers list if not already
        if (!userToFollow.followers.includes(userId)) {
            userToFollow.followers.push(userId);
            await userToFollow.save();
        }

        res.status(200).json({ success: true, message: "Followed user successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

//unfollow users
export const unfollowUser = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { unfollowId } = req.body;

        if (userId === unfollowId) {
            return res.status(400).json({ message: "You can't unfollow yourself" });
        }

        const userToUnfollow = await User.findById(unfollowId);
        if (!userToUnfollow) {
            return res.status(404).json({ message: "User to unfollow not found" });
        }

        // Remove unfollowId from user's following list if present
        const user = await User.findById(userId);
        if (user.following.includes(unfollowId)) {
            user.following = user.following.filter(id => id.toString() !== unfollowId);
            await user.save();
        }

        // Remove userId from unfollowId's followers list if present
        if (userToUnfollow.followers.includes(userId)) {
            userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== userId);
            await userToUnfollow.save();
        }

        res.status(200).json({ success: true, message: "Unfollowed user successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

//send connection request
export const sendConnectionRequest = async (req, res) => {
    try {
        const {userId} = req.auth()
        const {id} = req.body;

        const last24Hours = new Date(Date.now - 24 * 60 * 60 * 1000)
        const connectionRequests = await Connection.find({from_user_id: userId,
            created_at: {$gt: last24Hours}
         })
         if(connectionRequests.length >= 20){
            return res.json({success: false, message: 'You have sent more than 20 connection requests in the last 24 hours'})
         }

         //check if users are already connected
         const connection = await Connection.findOne({
            $or: [
                {rom_user_id: userId, to_user_id: id},
                {rom_user_id: id, to_user_id: userId},
            ]
         })

         if(!connection){
            await Connection.create({
                from_user_id: userId,
                to_user_id: id
            })
            return res.json({success: true, message: 'Connection request sent successfully'})
         }else if(connection && connection.status === 'accepted'){
                return res.json({success: false, message: 'You are already connected with the user'})
         }
         return res.json({success: false, message: 'Connection request pending'})

    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message });
    }
}

//get user connections
export const getUserConnections = async (req, res) => {
    try {
        const { userId } = req.auth();

        // Find connections where the user is either the sender or receiver and status is accepted
        const user = await User.findById(userId).populate('connections followers following')

        const connections = user.connections
        const followers = user.followers
        const following = user.following

        const pendingConnections = (await Connection.find({to_user_id: userId,
            status: 'pending'
        }).populate('from_user_id')).map(connection => connection.from_user_id)

        res.json({success: true, connections, followers, following, pendingConnections})

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
}

//accept connection requests
export const acceptConnectionRequest = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { Id } = req.body;

        if (!Id) {
            return res.status(400).json({ success: false, message: "Missing Id in request body." });
        }

        // Find the connection where the current user is the recipient and the request is pending
        const connection = await Connection.findOne({
            from_user_id: id,
            to_user_id: userId,
        });

        if (!connection) {
            return res.status(404).json({ success: false, message: "Connection request not found." });
        }

        const user = await User.findById(userId);
        user.connections.push(id);
        await connection.save();

        const toUser = await User.findById(id);
        toUser.connections.push(userId);
        await toUser.save();

        connection.status = 'accepted';
        await connection.save();

        // Optionally, add references in User model for connections if not already handled elsewhere.

        res.json({ success: true, message: "Connection accepted successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message });
    }
};


