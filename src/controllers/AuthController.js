const userModel = require('../models/UserModel');
const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const cookieParser = require('cookie-parser');
const SessionModel = require('../models/SessionModel');
const { convertProcessSignalToExitCode } = require('util');
const sendEmail = require('../services/EmailService').sendEmail;
const OtpModel = require('../models/OtpModel');
const { generateOtp, getotpHtml } = require('../utils/utils');

exports.registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await userModel.findOne({
            $or: [
                { email },
                { name }
            ]
        });

        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

        const newUser = new userModel({
            name,
            email,
            password: hashedPassword,
        });

        await newUser.save();

        const otp = generateOtp();
        const html = getotpHtml(otp);


        const otpHash = crypto.createHash('sha256').update(otp.toString()).digest('hex');

        await OtpModel.create({
            email,
            user: newUser._id,
            otpHash
        });


        await sendEmail(email, "OTP for Email Verification", `Your OTP is ${otp}`, html);

        res.status(201).json({
            message: "User registered successfully",
            user: {
                username: newUser.name,
                email: newUser.email,
                verified: newUser.verified
            },
        });


        // const RefreshToken = jwt.sign(
        //     { id: newUser._id },
        //     config.JWT_SECRET,
        //     { expiresIn: '7d' }
        // );

        // const refreshTokenHash = crypto.createHash('sha256').update(RefreshToken).digest('hex');

        // const session = new SessionModel({
        //     user: newUser._id,
        //     refreshToken: refreshTokenHash,
        //     ipAddress: req.ip,
        //     userAgent: req.headers['user-agent']
        // });

        // await session.save();

        // const AccessToken = jwt.sign(
        //     {
        //         id: newUser._id,
        //         sessionId: session._id
        //     },
        //     config.JWT_SECRET,
        //     { expiresIn: '15m' }
        // );


        // res.cookie('refreshToken', RefreshToken, {
        //     httpOnly: true,
        //     secure: process.env.NODE_ENV === 'production',
        //     sameSite: 'strict',
        //     maxAge: 7 * 24 * 60 * 60 * 1000
        // });

        // console.log(AccessToken);

        // res.status(201).json({
        //     message: "User registered successfully",
        //     user: newUser,
        //     token: AccessToken
        // });

    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }

}

exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!user.verified) {
            return res.status(403).json({ message: "Email not verified. Please verify your email to login." });
        }

        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

        if (hashedPassword !== user.password) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const ispassword = hashedPassword === user.password;

        if (!ispassword) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const RefreshToken = jwt.sign(
            { id: user._id },
            config.JWT_SECRET,
            { expiresIn: '7d' }
        );

        const refreshTokenHash = crypto.createHash('sha256').update(RefreshToken).digest('hex');

        const session = new SessionModel({
            user: user._id,
            refreshToken: refreshTokenHash,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent']
        });

        const accessToken = jwt.sign(
            {
                id: user._id,
                sessionId: session._id
            },
            config.JWT_SECRET,
            { expiresIn: '15m' }
        );

        res.status(200).cookie('refreshToken', RefreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        await session.save();

        res.status(200).json({
            message: "Login successful",
            user,
            token: accessToken
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

exports.getMe = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "No token provided. Unauthorized" });
        }

        const decoded = jwt.verify(token, config.JWT_SECRET);

        console.log(decoded);

        const user = await userModel.findById(decoded.id)

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "User retrieved successfully",
            user
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
};

exports.getRefreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ message: "No refresh token provided. Unauthorized" });
        }

        const decoded = jwt.verify(refreshToken, config.JWT_SECRET);

        const accessToken = jwt.sign(
            { id: decoded.id },
            config.JWT_SECRET,
            { expiresIn: '15m' }
        );

        const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

        const session = await SessionModel.findOne({
            refreshToken: refreshTokenHash,
            revoked: false
        });

        if (!session) {
            return res.status(401).json({ message: "Invalid refresh token. Unauthorized" });
        }

        const newRefreshToken = jwt.sign(
            { id: decoded.id },
            config.JWT_SECRET,
            { expiresIn: '7d' }
        );

        const newRefreshTokenHash = crypto.createHash('sha256').update(newRefreshToken).digest('hex');

        session.refreshToken = newRefreshTokenHash;
        await session.save();

        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            message: "Access token refreshed successfully",
            token: accessToken
        });

    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
    }
}

exports.logoutUser = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(400).json({ message: "No refresh token provided" });
        }

        const refreshTokenHash = crypto
            .createHash('sha256')
            .update(refreshToken)
            .digest('hex');

        // log
        console.log("Refresh Token Hash:", refreshTokenHash);

        const session = await SessionModel.findOne({
            refreshToken: refreshTokenHash,
        });

        // log
        console.log("Session Found:", session);

        if (!session) {
            return res.status(400).json({ message: "Invalid refresh token" });
        }

        session.revoked = true;
        await session.save();

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });

        return res.status(200).json({ message: "Logout successful" });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server Error" });
    }
};

exports.logoutAllUser = async (req, res) => {

    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(400).json({ message: "No refresh token provided" });
        }
        const refreshTokenHash = crypto
            .createHash('sha256')
            .update(refreshToken)
            .digest('hex');

        const decoded = jwt.verify(refreshToken, config.JWT_SECRET);

        await SessionModel.updateMany(
            {
                user: decoded.id,
                revoked: false
            },
            {
                revoked: true
            }
        );

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
        });

        return res.status(200).json({
            message: "All sessions logged out successfully"
        });

    }
    catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server Error" });
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const { email, otp } = req.body;

        console.log("Email:", email);
        console.log("OTP:", otp);

        const otpHash = crypto.createHash('sha256').update(otp.toString()).digest('hex');

        const otpRecord = await OtpModel.findOne({ email, otpHash });

        if (!otpRecord) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        const user = await userModel.findByIdAndUpdate(otpRecord.user, { verified: true });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        await OtpModel.deleteMany({ _id: otpRecord.user});

        return res.status(200).json({ message: "Email verified successfully" });

        // const user = await userModel.findByIdAndUpdate(otpRecord.user,{ verified: true });

        // if (!user) {
        //     return res.status(404).json({ message: "User not found" });
        // }

        // user.verified = true;
        // await user.save();

        // return res.status(200).json({ message: "Email verified successfully" });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server Error" });
    }
}




