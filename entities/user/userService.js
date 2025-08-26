import repository from './userRepository.js';
import {  NotFoundError, BadRequestError } from '../../utils/errors.js';
import createToken from '../../utils/createToken.js';
import bcrypt from 'bcrypt';

class UserService{
    async register(data){
        const {name, email, password, isAdmin} = data;
        
        // Hash password to protect info
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = await repository.createUser({name, email, password: hashedPassword, isAdmin});
        
        // Prepare user response without providing sensitive info
        const userResponse = {
            _id: newUser._id,
            name,
            email,
            isAdmin,
        }
                
        // Generate token
        const token = createToken({userId: newUser._id});

        return { userResponse, token };
    }

    async login(data){
        const {name, email, password} = data;

        if (!name && !email){
            throw new BadRequestError('At least name or email must be provided');
        }

        const user = await repository.findByNameOrEmail(name, email);
        
        if (!user){
            throw new NotFoundError('User not found');
        }

        // Compare given password with the hashed one
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch){
            throw new BadRequestError('Wrong password');
        }

        // Generate token
        return createToken({userId: user.id});
    }
}

export default new UserService();