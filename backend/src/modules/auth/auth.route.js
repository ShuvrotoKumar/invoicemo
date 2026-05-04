const express = require('express');
const authController = require('./auth.controller');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { validate, registerSchema, loginSchema } = require('../../middleware/validation.middleware');

const router = express.Router();

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh-token', authController.refreshToken);
router.post('/logout', authMiddleware, authController.logout);
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;
