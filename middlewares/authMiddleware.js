const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token){
        return res.status(401).json({message: 'No token'});
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        req.userId = decoded.userId;

        // Only users from the app
        const userInDB = await User.findById(decoded.userId);
        if (!userInDB){
            return res.status(403).json({message: 'Invalid token'});
        }

        next(); 
    } catch {
        return res.status(403).json({message: 'Invalid token'});
    }
}

const adminOnly = async (req, res, next) => {
    try {
        const user = await User.findById(req.userId);

        if (!user){
            return res.status(404).json({message: 'User not found'});
        }

        if (!user.isAdmin){
            return res.status(403).json({message: 'Not authorized'});
        }

        next();
    } catch (err) {
        console.error(err);
        return res.status(500).json({message: 'Internal server error'});
    }
}
module.exports = { auth, adminOnly };