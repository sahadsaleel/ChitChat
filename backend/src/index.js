import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDB } from "./lib/db.js";

import path from "path";

import authRoutes from "./routes/auth.rout.js";
import messageRoutes from "./routes/message.rout.js";
import friendRoutes from "./routes/friend.rout.js";
import groupRoutes from "./routes/group.rout.js";

import { createServer } from "http";
import { Server } from "socket.io";

dotenv.config();
const app = express();

const server = createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
  },
});

app.set("io", io);

const PORT = process.env.PORT;
const __dirname = path.resolve();

// CORS
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// ⭐ FIX: Increase body size limit
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/friend", friendRoutes);
app.use("/api/group", groupRoutes);

if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "../frontend/dist");

  app.use(express.static(frontendPath));

  app.use((req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}


// ========== SOCKET.IO LOGIC ==========
let onlineUsers = new Map();
app.set("onlineUsers", onlineUsers);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) {
    onlineUsers.set(userId, socket.id);
  }

  io.emit("online-users", Array.from(onlineUsers.keys()));

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    onlineUsers.forEach((value, key) => {
      if (value === socket.id) onlineUsers.delete(key);
    });

    io.emit("online-users", Array.from(onlineUsers.keys()));
  });
});


server.listen(PORT, () => {
  console.log("Server running on PORT:", PORT);
  connectDB();
});
