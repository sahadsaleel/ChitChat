import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useGroupStore = create((set, get) => ({
    groups: [],
    isLoadingGroups: false,
    selectedGroup: null,

    getGroups: async () => {
        set({ isLoadingGroups: true });
        try {
            const res = await axiosInstance.get("/group");
            set({ groups: res.data });
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to fetch groups");
        } finally {
            set({ isLoadingGroups: false });
        }
    },

    createGroup: async (data) => {
        try {
            const res = await axiosInstance.post("/group/create", data);
            set({ groups: [...get().groups, res.data] });
            toast.success("Group created successfully");
            return true;
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to create group");
            return false;
        }
    },

    setSelectedGroup: (group) => set({ selectedGroup: group }),

    addMember: async (groupId, userId) => {
        try {
            await axiosInstance.post("/group/add-member", { groupId, userId });
            toast.success("Member added");
            get().getGroups();
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to add member");
        }
    },

    removeMember: async (groupId, userId) => {
        try {
            await axiosInstance.post("/group/remove-member", { groupId, userId });
            toast.success("Member removed");
            get().getGroups();
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to remove member");
        }
    },

    leaveGroup: async (groupId) => {
        try {
            await axiosInstance.post("/group/leave", { groupId });
            toast.success("Left group");
            set({ selectedGroup: null });
            get().getGroups();
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to leave group");
        }
    }
}));
