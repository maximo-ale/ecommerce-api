const User = require('../models/User');
const bcrypt = require('bcrypt');
const createToken = require('../utils/createToken');

exports.register = async (req, res) => {
    try {
        const {name, email, password, isAdmin} = req.body;

        // Hash password to protect info
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            isAdmin,
        });
        await newUser.save();

        // Prepare user response without providing sensitive info
        const userResponse = {
            _id: newUser._id,
            name,
            email,
            isAdmin,
        }
        
        // Generate token
        const token = createToken({userId: newUser._id});
        res.status(201).json({
            message: 'User created successfully',
            user: userResponse,
            token,
        });
    } catch (err) {
        if (err.code === 11000){
            return res.status(400).json({message: 'Email already in use'});
        }
        console.error(err);
        return res.status(500).json({message: 'Internal server error'});
    }
}

exports.login = async (req, res) => {
    try {
        const {name, email, password} = req.body;

        if (!name && !email){
            return res.status(400).json({message: 'At least name or email must be provided'});
        }

        const user = await User.findOne({
            $or: [
                {name},
                {email},
            ],
        });
        
        if (!user){
            return res.status(404).json({message: 'User not found'});
        }

        // Compare given password with the hashed one
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch){
            return res.status(400).json({message: 'Wrong password'});
        }

        // Generate token
        const token = createToken({userId: user._id});
        
        res.status(200).json({token});

    } catch (err){
        console.error(err);
        return res.status(500).json({message: 'Internal server error'});
    }
}