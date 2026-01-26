import User from '../models/user.js';

export const protect = async (req, res, next) => {
    try {
    const { userId } = await req.auth();
    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    req.user = await User.findById(userId);
    next();
    } catch (error) {
        return res.status(401).json({ message: error.message });
    }
}