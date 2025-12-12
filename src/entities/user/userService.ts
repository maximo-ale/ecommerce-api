import repository from './userRepository';
import {  NotFoundError, BadRequestError } from '../../utils/errors';
import createToken from '../../utils/createToken';
import bcrypt from 'bcrypt';
import { LoginUser, ProtectedUserInfo, RegisterUser, User, UserInfoWithToken } from './userTypes';

class UserService{
    async register(data: RegisterUser): Promise<UserInfoWithToken>{
        const {name, email, password, isAdmin} = data;
        
        // Hash password to protect info
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = await repository.createUser({name, email, password: hashedPassword, isAdmin});
        
        // Prepare user response without providing sensitive info
        const userResponse: ProtectedUserInfo = {
            id: newUser.id,
            name,
        }
            
        // Generate token
        const token = createToken({userId: newUser.id});

        return { ...userResponse, token };
    }

    async login(data: LoginUser): Promise<UserInfoWithToken>{
        const { name, email, password } = data;

        const user: User | null = await repository.findByNameOrEmail(name, email);
        
        if (!user){
            throw new NotFoundError('User not found');
        }

        // Compare given password with the hashed one
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch){
            throw new BadRequestError('Wrong password');
        }

        // Generate token
        const token = createToken({userId: user.id});
        return { id: user.id, name: user.name, token };
    }
}

export default new UserService();