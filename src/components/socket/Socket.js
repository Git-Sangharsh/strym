import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";

// Setup socket connection
const socket = io("http://localhost:3000"); // You can use process.env.REACT_APP_BACKEND_URL in prod

// Get user details
const token = localStorage.getItem("google_token");
const decoded = token ? jwtDecode(token) : null;

const roomId = "abc123"; // Make dynamic if needed

// Create room (admin)
const handleCreateRoom = () => {
  if (!decoded) return console.error("User not authenticated.");

  socket.emit("create-room", { roomId, userEmail: decoded.email });

  socket.once("room-create-status", ({ success, roomId, members, message }) => {
    if (success) {
      console.log("✅ Room created:", roomId);
      console.log("👑 Admin:", decoded.email);
      console.log("👥 Members:", members);
    } else {
      console.error("❌ Failed to create room:", message);
    }
  });
};

// Join room (non-admin)
const handleJoinRoom = () => {
  if (!decoded) return console.error("User not authenticated.");

  socket.emit("join-room", { roomId, userEmail: decoded.email });

  socket.once("room-join-status", ({ success, created, roomId, members, admin, message }) => {
    if (!success) {
      console.error("❌ Failed to join room:", message);
      return;
    }

    console.log(created ? "🆕 Room created" : "👋 Joined room");
    console.log("👑 Admin:", admin);
    console.log("👥 Members:", members);
  });
};

// Listen to someone else joining
socket.on("user-joined", ({ userEmail }) => {
  console.log("👤 New user joined:", userEmail);
});

// Connection events
socket.on("connect", () => {
  console.log("✅ Socket connected:", socket.id);
});

socket.on("disconnect", () => {
  console.warn("❌ Socket disconnected");
});

// Export functions
export { socket, handleCreateRoom, handleJoinRoom };
