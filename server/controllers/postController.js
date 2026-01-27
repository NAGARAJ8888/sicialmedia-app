import Post from '../models/post.js'
import imagekit from '../config/imagekit.js';
import User from '../models/user.js';

// Add post
export const addPost = async (req, res) => {

    console.log("req.body:", req.body);
    console.log("req.files:", req.files);
    console.log("files length:", req.files?.length);


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
  
      const { content, post_type } = req.body;
  
      if (!content && (!req.files || !req.files.length)) {
        return res.status(400).json({ message: "Post content or image is required" });
      }
  
      let image_urls = [];
  
      // Handle image uploads (multiple)
      if (req.files && req.files.length > 0) {
        image_urls = await Promise.all(
          req.files.map(async (file) => {
            try {
              const buffer = file.buffer;
              const base64File = buffer.toString("base64");
  
              const response = await imagekit.files.upload({
                file: `data:${file.mimetype};base64,${base64File}`,
                fileName: file.originalname,
                folder: `/posts/${userId}`,
              });

              console.log("ImageKit response:", response.filePath);
  
              // Generate optimized URL
              return imagekit.helper.buildSrc({
                urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
                src: response.filePath,
                transformation: [
                  { quality: "auto" },
                  { format: "webp" },
                  { width: 1080 }
                ],
              });
            } catch (err) {
              console.error("Image upload failed:", err);
              throw new Error("Failed to upload post image");
            }
          })
        );
      }

      console.log("Final image_urls:", image_urls);
  
      // Create post
      const post = await Post.create({
        user: userId,
        content,
        post_type: post_type || "text",
        images: image_urls,
      });
  
      res.status(201).json({
        message: "Post created successfully",
        post,
      });
  
    } catch (error) {
      console.error("Add post error:", error);
      res.status(500).json({ message: error.message });
    }
};

export const getFeedPosts = async (req, res) =>{
    try {
        const {userId} = req.auth()
        const user = await User.findById(userId)

        //user connections and followings
        const userIds = [userId, ...user.connections, ...user.following]
        const posts = await Post.find({user: {$in: userIds}}).populate('user').sort({createdAt: -1});
        res.json({success: true, posts})

    } catch (error) {
        res.json({success: false, message: error.message})
    }
}
 
export const likePost = async (req, res) =>{
    try {
        const {userId} = req.auth()
        const {postId} = req.body;

        const post = await Post.findById(postId)

        if(post.likes_count.includes(userId)){
            post.likes_count = post.likes_count.filter(user => user !== userId)
            await post.save()
            res.json({success: true, message: 'Post unliked'})
        }else{
            post.likes_count.push(userId)
            await post.save()
            res.json({success: true, message: 'Post liked'})
        }

    } catch (error) {
        res.json({success: false, message: error.message})
    }
}