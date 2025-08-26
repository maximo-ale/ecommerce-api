import jwt from 'jsonwebtoken';

const createToken = (payload) => {
    const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '7d'});
    return token;
}

export default createToken;