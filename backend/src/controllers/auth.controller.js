// import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js"
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import { v2 as cloudinary } from "cloudinary";


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
    const { email, password } = req.body
    try {
        const user = await User.findOne({ email })

        if (!user) {
            res.status(400).json({ message: "Invalid credentials" })
        }

        const isPasswordCurrect = await bcrypt.compare(password, user.password)

        if (!isPasswordCurrect) {
            res.status(400).json({ message: "Invalid credentials" })
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

export const checkAuth = (req,res) => {
    try {
        res.status(200).json(req.user)
    } catch (error) {
        console.log("Error check auth controller" , error.message)
        res.status(500).json({message : "Internal server error"})
    }
}