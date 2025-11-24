import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

export const useFriendStore = create((set, get) => ({
    friends: [],
    isLoadingFriends: false,

    getFriends: async () => {
        set({ isLoadingFriends: true });
        try {
            const res = await axiosInstance.get("/friend");
            set({ friends: res.data });
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to fetch friends");
        } finally {
            set({ isLoadingFriends: false });
        }
    },

    sendFriendRequest: async (userId) => {
        try {
            await axiosInstance.post(`/friend/request/${userId}`);
            toast.success("Friend request sent");
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to send request");
        }
    },

    acceptFriendRequest: async (userId) => {
        try {
            await axiosInstance.post(`/friend/accept/${userId}`);
            toast.success("Friend request accepted");
            get().getFriends(); // Refresh list
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to accept request");
        }
    },

    rejectFriendRequest: async (userId) => {
        try {
            await axiosInstance.post(`/friend/reject/${userId}`);
            toast.success("Friend request rejected");
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to reject request");
        }
    },

    blockUser: async (userId) => {
        try {
            await axiosInstance.post(`/friend/block/${userId}`);
            toast.success("User blocked");
            get().getFriends();
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to block user");
        }
    },

    unblockUser: async (userId) => {
        try {
            await axiosInstance.post(`/friend/unblock/${userId}`);
            toast.success("User unblocked");
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to unblock user");
        }
    },
}));
