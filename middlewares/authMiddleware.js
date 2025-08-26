import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import User from '../entities/user/User.js';
import { NotAuthorizedError, NotFoundError, NoTokenError } from '../utils/errors.js';
import userRepository from '../entities/user/userRepository.js';

dotenv.config({debug: false});

export const auth = async (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token || token === 'null' || token === 'undefined'){
        throw new NoTokenError('No token');
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        req.userId = decoded.userId;
        
        // Only users from the DB
        const userInDB = await userRepository.findUserById(decoded.userId);
        if (!userInDB){
            throw new NotAuthorizedError('Invalid token. Not in DB');
        }
        next(); 
    } catch {
        throw new NotAuthorizedError('Invalid token');
    }
}

export const adminOnly = async (req, res, next) => {
    const user = await User.findById(req.userId);

    if (!user){
        throw new NotFoundError('User not found');
    }

    if (!user.isAdmin){
        throw new NotAuthorizedError('Not authorized');
    }

    next();
}