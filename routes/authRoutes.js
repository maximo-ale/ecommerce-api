const express = require('express');
const {register, login} = require('../controllers/authController');
const router = express.Router();

const { body, param, query} = require('express-validator');
const { validateRequest } = require('../middlewares/validateRequest');

router.post('/register',
    body('name').isString().withMessage('Name must be a string').bail().trim().notEmpty().withMessage('Invalid name'),
    body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
    body('password').isString().withMessage('Password must be a string').bail().trim().isLength({min: 4}).withMessage('Password must be at least 4 characters long'),
    body('isAdmin').optional().isBoolean().withMessage('Invalid admin value'),
    validateRequest , register);

router.post('/login',
    body('name').optional().trim().notEmpty().withMessage('Invalid name'),
    body('email').optional().isEmail().withMessage('Invalid email'),
    body('password').trim().notEmpty().withMessage('Invalid password'),
    validateRequest, login);

module.exports = router;