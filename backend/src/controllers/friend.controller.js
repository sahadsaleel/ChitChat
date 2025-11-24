import User from "../models/user.model.js";

export const sendFriendRequest = async (req, res) => {
    try {
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        if (senderId.toString() === receiverId) {
            return res.status(400).json({ message: "You cannot send a friend request to yourself" });
        }

        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ message: "User not found" });
        }

        if (receiver.friends.includes(senderId)) {
            return res.status(400).json({ message: "You are already friends" });
        }

        const existingRequest = receiver.friendRequests.find(
            (req) => req.senderId.toString() === senderId.toString()
        );

        if (existingRequest) {
            return res.status(400).json({ message: "Friend request already sent" });
        }

        receiver.friendRequests.push({ senderId, status: "pending" });
        await receiver.save();

        res.status(200).json({ message: "Friend request sent successfully" });
    } catch (error) {
        console.log("Error in sendFriendRequest:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const acceptFriendRequest = async (req, res) => {
    try {
        const { id: senderId } = req.params;
        const receiverId = req.user._id;

        const receiver = await User.findById(receiverId);
        const sender = await User.findById(senderId);

        if (!sender || !receiver) {
            return res.status(404).json({ message: "User not found" });
        }

        const requestIndex = receiver.friendRequests.findIndex(
            (req) => req.senderId.toString() === senderId && req.status === "pending"
        );

        if (requestIndex === -1) {
            return res.status(404).json({ message: "Friend request not found" });
        }

        receiver.friendRequests[requestIndex].status = "accepted";
        receiver.friends.push(senderId);
        sender.friends.push(receiverId);

        await receiver.save();
        await sender.save();

        res.status(200).json({ message: "Friend request accepted" });
    } catch (error) {
        console.log("Error in acceptFriendRequest:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const rejectFriendRequest = async (req, res) => {
    try {
        const { id: senderId } = req.params;
        const receiverId = req.user._id;

        const receiver = await User.findById(receiverId);

        if (!receiver) {
            return res.status(404).json({ message: "User not found" });
        }

        receiver.friendRequests = receiver.friendRequests.filter(
            (req) => req.senderId.toString() !== senderId
        );

        await receiver.save();

        res.status(200).json({ message: "Friend request rejected" });
    } catch (error) {
        console.log("Error in rejectFriendRequest:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getFriends = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate("friends", "-password");
        res.status(200).json(user.friends);
    } catch (error) {
        console.log("Error in getFriends:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const blockUser = async (req, res) => {
    try {
        const { id: userToBlockId } = req.params;
        const userId = req.user._id;

        const user = await User.findById(userId);

        if (user.blockedUsers.includes(userToBlockId)) {
            return res.status(400).json({ message: "User already blocked" });
        }

        user.blockedUsers.push(userToBlockId);

        // Remove from friends if they are friends
        user.friends = user.friends.filter(id => id.toString() !== userToBlockId);

        await user.save();

        // Also remove from the other user's friend list
        await User.findByIdAndUpdate(userToBlockId, {
            $pull: { friends: userId }
        });

        res.status(200).json({ message: "User blocked successfully" });
    } catch (error) {
        console.log("Error in blockUser:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const unblockUser = async (req, res) => {
    try {
        const { id: userToUnblockId } = req.params;
        const userId = req.user._id;

        const user = await User.findById(userId);

        user.blockedUsers = user.blockedUsers.filter(
            (id) => id.toString() !== userToUnblockId
        );

        await user.save();

        res.status(200).json({ message: "User unblocked successfully" });
    } catch (error) {
        console.log("Error in unblockUser:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};
