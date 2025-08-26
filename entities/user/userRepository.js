import User from "./User.js";

class UserRepository{
    async createUser(data){
        const newUser = new User(data);
        return await newUser.save();
    }

    async findUserById(id){
        return await User.findById(id);
    }

    async findByNameOrEmail(name, email){
        const user = await User.findOne({
            $or: [
                {name},
                {email},
            ],
        });

        if (!user){
            return null;
        }
        
        return {
            id: user._id.toString(),
            name,
            email,
            password: user.password,
        }
    }

    async createTestingUsers(){
        await User.deleteMany();

        const defaultUser = new User({
            name: 'defaultUser',
            email: 'defaultUser@gmail.com',
            password: '123456',
        });

        const adminUser = new User({
            name: 'user2',
            email: 'user@gmail.com',
            password: '123456',
            isAdmin: true,
        });

        await defaultUser.save();
        await adminUser.save();
        
        return {defaultUser, adminUser};
    }
}

export default new UserRepository();