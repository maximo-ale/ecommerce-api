import userService from './userService';
import type { Request, Response } from 'express';

class UserController{
    async register(req: Request, res: Response){
        const result = await userService.register(req.body);

        res.status(201).json({
            message: 'User created successfully',
            result,
        });
    }

    async login(req: Request, res: Response){
        const token = await userService.login(req.body);
        res.status(200).json({token});
    }
}

export default new UserController();