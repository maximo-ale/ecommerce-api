import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { NotAuthorizedError, NotFoundError, NoTokenError } from '../utils/errors';
import userRepository from '../entities/user/userRepository';
import type { Request, Response, NextFunction } from 'express';
import { User } from '../entities/user/userTypes';
dotenv.config({debug: false});

interface JWT {
    userId?: string,
}
export const auth = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token || token === 'null' || token === 'undefined'){
        throw new NoTokenError('No token');
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWT;
        req.userId = decoded.userId;
        
        // Only users from the DB

        const userInDB: User | null = await userRepository.findUserById(decoded.userId!);
        if (!userInDB){
            throw new NotAuthorizedError('Invalid token. Not in DB');
        }
        next(); 
    } catch (err){
        throw new NotAuthorizedError('Invalid token');
    }
}

export const adminOnly = async (req: Request, res: Response, next: NextFunction) => {
    const user: User | null = await userRepository.findUserById(req.userId!);

    if (!user){
        throw new NotFoundError('User not found');
    }

    if (!user.isAdmin){
        throw new NotAuthorizedError('Not authorized');
    }

    next();
}