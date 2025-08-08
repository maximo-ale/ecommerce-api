const jwt = require('jsonwebtoken');

const createToken = (payload) => {
    const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '7d'});
    return token;
}

module.exports = createToken;