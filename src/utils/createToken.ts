import jwt from 'jsonwebtoken';

interface Payload{
    userId?: string,
}

const createToken = (payload: Payload) => {
    const token = jwt.sign(payload, process.env.JWT_SECRET!, {expiresIn: '7d'});
    return token;
}

export default createToken;