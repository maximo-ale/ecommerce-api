import { ProtectedUserInfo, RegisterUser, User } from './userTypes';
import pool from '../../config/connectDB';

class UserRepository{
    async createUser(data: RegisterUser): Promise<ProtectedUserInfo>{
        const { name, email, password, isAdmin = false } = data;
    
        const newUser = await pool.query(`
            INSERT INTO users (name, email, password, is_admin)
            VALUES ($1, $2, $3, $4)
            RETURNING id, name;
            `, [name, email, password, isAdmin]
        );

        const row = newUser.rows[0];

        const user: ProtectedUserInfo = {
            id: row.id,
            name: row.name,
        } 
        return user;
    }

    async findUserById(userId: string): Promise<User | null>{
        const user = await pool.query(`
            SELECT *
            FROM users
            WHERE id = $1;
        `, [userId]);
        
        const row = user.rows[0];
        if (!row) return null;
        
        return {
            id: row.id,
            name: row.name,
            email: row.email,
            password: row.password,
            isAdmin: row.is_admin,
        }
    }

    async findByNameOrEmail(name?: string, email?: string): Promise<User | null>{
        const user = await pool.query(`
            SELECT *
            FROM users
            WHERE name = $1 OR email = $2
            `, [name, email],
        );

        const row = user.rows[0];

        if (!row){
            return null;
        }
        
        return {
            id: row.id,
            name: row.name,
            email: row.email,
            password: row.password,
            isAdmin: row.is_admin,
        }
    }

    async createTestingUsers(){
        /*await UserModel.deleteMany();

        const defaultUser = new UserModel({
            name: 'defaultUser',
            email: 'defaultUser@gmail.com',
            password: '123456',
        });

        const adminUser = new UserModel({
            name: 'user2',
            email: 'user@gmail.com',
            password: '123456',
            isAdmin: true,
        });

        await defaultUser.save();
        await adminUser.save();
        
        return {defaultUser, adminUser};*/
    }
}

export default new UserRepository();