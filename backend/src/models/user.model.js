import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true
        },
        fullName: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true,
            minLength: 6
        },
        profilePic: {
            type: String,
            default: ""
        },
        about: {
            type: String,
            default: ""
        }
    },
    { timestamps: true }
)

// Add new fields to the schema
userSchema.add({
    is2FAEnabled: {
        type: Boolean,
        default: false
    },
    twoFactorSecret: {
        type: Object,
        default: null
    },
    friends: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],
    friendRequests: [{
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        status: {
            type: String,
            enum: ["pending", "accepted", "rejected"],
            default: "pending"
        }
    }],
    blockedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
});

const User = mongoose.model("User", userSchema)

export default User;