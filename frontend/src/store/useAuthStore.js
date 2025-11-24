import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";


const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,

  onlineUsers: [],
  socket: null,

  // CHECK AUTH

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      set({ authUser: res.data });

      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  // SIGNUP

  signup: async (data) => {
    set({ isSigningUp: true });

    try {
      const res = await axiosInstance.post("/auth/signup", data);

      set({ authUser: res.data });
      toast.success("Account created successfully");

      get().connectSocket();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Signup failed");
    } finally {
      set({ isSigningUp: false });
    }
  },

  // LOGIN

  login: async (data) => {
    set({ isLoggingIn: true });

    try {
      const res = await axiosInstance.post("/auth/login", data);

      if (res.data.is2FARequired) {
        set({ isLoggingIn: false });
        return { is2FARequired: true, userId: res.data.userId };
      }

      set({ authUser: res.data });

      toast.success("Logged in successfully");

      get().connectSocket();
      return { success: true };
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed");
      return { success: false };
    } finally {
      set({ isLoggingIn: false });
    }
  },

  verify2FA: async (data) => {
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      get().connectSocket();
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Invalid 2FA code");
      return false;
    }
  },

  enable2FA: async () => {
    try {
      const res = await axiosInstance.post("/auth/enable-2fa");
      return res.data;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to enable 2FA");
      throw error;
    }
  },

  confirm2FA: async (token) => {
    try {
      await axiosInstance.post("/auth/verify-2fa", { token });
      toast.success("2FA Enabled Successfully");
      // Refresh user data to update is2FAEnabled status
      await get().checkAuth();
      return true;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Invalid Token");
      return false;
    }
  },

  disable2FA: async () => {
    try {
      await axiosInstance.post("/auth/disable-2fa");
      toast.success("2FA Disabled Successfully");
      await get().checkAuth();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to disable 2FA");
    }
  },

  // LOGOUT

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");

      set({ authUser: null });
      toast.success("Logged out successfully");

      get().disconnectSocket();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Logout failed");
    }
  },

  // UPDATE PROFILE

  updateProfile: async (formData) => {
    set({ isUpdatingProfile: true });

    try {
      const res = await axiosInstance.put("/auth/update-profile", formData);

      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("Error in updateProfile:", error);
      toast.error(error?.response?.data?.message || "Update failed");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  // SOCKET CONNECT

  connectSocket: () => {
    const { authUser, socket } = get();

    if (!authUser || socket?.connected) return;

    const newSocket = io(BASE_URL, {
      query: { userId: authUser._id },
      withCredentials: true,
    });

    set({ socket: newSocket });

    newSocket.on("connect", () => {
      console.log("Socket Connected:", newSocket.id);
    });

    // LISTEN FOR ONLINE USERS
    newSocket.on("online-users", (userIds) => {
      set({ onlineUsers: userIds });
    });
  },

  // SOCKET DISCONNECT
  disconnectSocket: () => {
    const { socket } = get();

    if (socket && socket.connected) {
      socket.disconnect();
      console.log("Socket Disconnected");
    }

    set({ socket: null, onlineUsers: [] });
  },

}));
