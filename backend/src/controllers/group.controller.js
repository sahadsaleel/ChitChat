import Group from "../models/group.model.js";
import User from "../models/user.model.js";

export const createGroup = async (req, res) => {
    try {
        const { name, description, members } = req.body;
        const adminId = req.user._id;

        if (!name || !members || members.length === 0) {
            return res.status(400).json({ message: "Name and members are required" });
        }

        // Ensure admin is part of the group
        const allMembers = [...new Set([...members, adminId.toString()])];

        const newGroup = new Group({
            name,
            description,
            admin: adminId,
            members: allMembers,
        });

        await newGroup.save();

        res.status(201).json(newGroup);
    } catch (error) {
        console.log("Error in createGroup:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getGroups = async (req, res) => {
    try {
        const userId = req.user._id;
        const groups = await Group.find({ members: userId }).populate("members", "-password").populate("admin", "-password");
        res.status(200).json(groups);
    } catch (error) {
        console.log("Error in getGroups:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const addMember = async (req, res) => {
    try {
        const { groupId, userId } = req.body;
        const adminId = req.user._id;

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        if (group.admin.toString() !== adminId.toString()) {
            return res.status(403).json({ message: "Only admin can add members" });
        }

        if (group.members.includes(userId)) {
            return res.status(400).json({ message: "User already in group" });
        }

        group.members.push(userId);
        await group.save();

        res.status(200).json(group);
    } catch (error) {
        console.log("Error in addMember:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const removeMember = async (req, res) => {
    try {
        const { groupId, userId } = req.body;
        const adminId = req.user._id;

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        if (group.admin.toString() !== adminId.toString()) {
            return res.status(403).json({ message: "Only admin can remove members" });
        }

        group.members = group.members.filter((id) => id.toString() !== userId);
        await group.save();

        res.status(200).json(group);
    } catch (error) {
        console.log("Error in removeMember:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const leaveGroup = async (req, res) => {
    try {
        const { groupId } = req.body;
        const userId = req.user._id;

        const group = await Group.findById(groupId);

        if (!group) {
            return res.status(404).json({ message: "Group not found" });
        }

        group.members = group.members.filter((id) => id.toString() !== userId.toString());

        // If admin leaves, assign new admin if there are members left
        if (group.admin.toString() === userId.toString()) {
            if (group.members.length > 0) {
                group.admin = group.members[0];
            } else {
                // Delete group if empty
                await Group.findByIdAndDelete(groupId);
                return res.status(200).json({ message: "Group deleted as it is empty" });
            }
        }

        await group.save();

        res.status(200).json({ message: "Left group successfully" });

    } catch (error) {
        console.log("Error in leaveGroup:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}
