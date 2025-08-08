const { validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()){
        const messages = errors.array().map(err => err.msg);
        return res.status(400).json({errors: messages});
    }
    next();
}

module.exports = { validateRequest }