// import cloudinary from "../lib/cloudinary.js";
// import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js"
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import { v2 as cloudinary } from "cloudinary";


import speakeasy from "speakeasy";
import qrcode from "qrcode";
import nodemailer from "nodemailer";

// Configure Nodemailer (You should move credentials to .env)
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER, // Add these to .env
        pass: process.env.EMAIL_PASS,
    },
});

export const signup = async (req, res) => {
    const { fullName, email, password } = req.body;
    try {

        if (!fullName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" })
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 charactors" })
        }

        const user = await User.findOne({ email })

        if (user) return res.status(400).json({ message: "Email already exist" })

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        const newUser = new User({
            fullName,
            email,
            password: hashedPassword,
        })

        if (newUser) {
            generateToken(newUser._id, res)
            await newUser.save()

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic
            })
        } else {
            res.status(400).json("Invalid user data")
        }

    } catch (error) {
        console.log("Error is signup controller", error.message)
        res.status(500).json({ message: "Internal server error" })
    }
}

export const login = async (req, res) => {
    const { email, password, twoFactorToken } = req.body
    try {
        const user = await User.findOne({ email })

        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" })
        }

        const isPasswordCurrect = await bcrypt.compare(password, user.password)

        if (!isPasswordCurrect) {
            return res.status(400).json({ message: "Invalid credentials" })
        }

        // 2FA Logic
        if (user.is2FAEnabled) {
            if (!twoFactorToken) {
                return res.status(200).json({
                    message: "2FA required",
                    is2FARequired: true,
                    userId: user._id
                });
            }

            const verified = speakeasy.totp.verify({
                secret: user.twoFactorSecret.base32,
                encoding: 'base32',
                token: twoFactorToken
            });

            if (!verified) {
                return res.status(400).json({ message: "Invalid 2FA token" });
            }
        }

        generateToken(user._id, res)

        res.status(201).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic
        })

    } catch (error) {
        console.log("error in login controller", error.message)
        res.status(500).json({ message: "Internal server error" })
    }
}

export const enable2FA = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);

        if (user.is2FAEnabled) {
            return res.status(400).json({ message: "2FA is already enabled" });
        }

        const secret = speakeasy.generateSecret({ name: `ChitChat (${user.email})` });

        user.twoFactorSecret = secret;
        await user.save();

        qrcode.toDataURL(secret.otpauth_url, (err, data_url) => {
            if (err) {
                return res.status(500).json({ message: "Error generating QR code" });
            }
            res.status(200).json({ secret: secret.base32, qrCode: data_url });
        });

    } catch (error) {
        console.log("Error in enable2FA:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const verify2FA = async (req, res) => {
    try {
        const { token } = req.body;
        const userId = req.user._id;
        const user = await User.findById(userId);

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret.base32,
            encoding: 'base32',
            token: token
        });

        if (verified) {
            user.is2FAEnabled = true;
            await user.save();
            res.status(200).json({ message: "2FA enabled successfully" });
        } else {
            res.status(400).json({ message: "Invalid token" });
        }

    } catch (error) {
        console.log("Error in verify2FA:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const disable2FA = async (req, res) => {
    try {
        const userId = req.user._id;
        await User.findByIdAndUpdate(userId, { is2FAEnabled: false, twoFactorSecret: null });
        res.status(200).json({ message: "2FA disabled successfully" });
    } catch (error) {
        console.log("Error in disable2FA:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const resetToken = speakeasy.totp({
            secret: user.password + "-" + user.createdAt.getTime(),
            encoding: 'base32'
        });

        // In a real app, send this link via email
        // const resetLink = `http://localhost:5173/reset-password/${user._id}/${resetToken}`;

        // For demo purposes, we'll just return the token or log it
        // await transporter.sendMail(...)

        console.log(`Reset Token for ${email}: ${resetToken}`); // For testing

        res.status(200).json({ message: "Password reset link sent to email (check console for token)" });

    } catch (error) {
        console.log("Error in forgotPassword:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { id, token, newPassword } = req.body;
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const verified = speakeasy.totp.verify({
            secret: user.password + "-" + user.createdAt.getTime(),
            encoding: 'base32',
            token: token,
            window: 20 // Allow some time drift
        });

        if (!verified) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.status(200).json({ message: "Password reset successfully" });

    } catch (error) {
        console.log("Error in resetPassword:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const logout = (req, res) => {
    try {
        res.cookie("jwt", "", { maxAge: 0 })
        res.status(200).json({ message: "Logged out successfully" })

    } catch (error) {
        console.log("Error in logout controller", error.message)
        res.status(500).json({ message: "Internal server error" })

    }
}

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { about } = req.body;

        let profilePicUrl;

        if (req.file) {
            const uploadResult = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: "profile_pics" },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );

                stream.end(req.file.buffer);
            });

            profilePicUrl = uploadResult.secure_url;
        }

        const updateData = {};

        if (profilePicUrl) updateData.profilePic = profilePicUrl;
        if (about) updateData.about = about;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true }
        );

        res.status(200).json(updatedUser);

    } catch (error) {
        console.log("Error in updateProfile:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user)
    } catch (error) {
        console.log("Error check auth controller", error.message)
        res.status(500).json({ message: "Internal server error" })
    }
}