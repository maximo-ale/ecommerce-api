import userService from './userService.js';

class UserController{
    async register(req, res){
        const {userResponse, token} = await userService.register(req.body);

        res.status(201).json({
            message: 'User created successfully',
            user: userResponse,
            token,
        });
    }

    async login(req, res){
        const token = await userService.login(req.body);
        res.status(200).json({token});
    }
}

export default new UserController();