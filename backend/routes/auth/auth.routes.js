import express from "express";
import authController from "../../controller/auth/auth.controller.js";

const authRouter = express.Router();

const {
    signup,
    verifyEmail,
    login,
    logout,
    refreshAccessToken,
    forgetPassword,
    resetPassword
} = authController;

authRouter.post('/signup',signup);
authRouter.post('/verify-email/:token',verifyEmail);
authRouter.post('/login',login)
authRouter.delete('/logout',logout)
authRouter.post('/refresh-token',refreshAccessToken)
authRouter.post('/forget-password',forgetPassword)
authRouter.put('/reset-password/:resetToken',resetPassword)

export default authRouter
