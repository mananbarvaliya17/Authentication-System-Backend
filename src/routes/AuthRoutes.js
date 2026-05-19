const express = require('express');
const AuthRouter = express.Router();
const authController = require('../controllers/AuthController');

AuthRouter.post('/register', authController.registerUser);

AuthRouter.post('/login', authController.loginUser); 

AuthRouter.get('/get-me',  authController.getMe);

AuthRouter.get('/refresh-token',  authController.getRefreshToken);

AuthRouter.get('/logout',  authController.logoutUser);

AuthRouter.get('/logoutAll',  authController.logoutAllUser);

AuthRouter.post('/verify-email',  authController.verifyEmail);

module.exports = AuthRouter;    