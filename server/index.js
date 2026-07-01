// server/index.js
const express = require("express");
const http = require("http");
const cors = require("cors");
const { setupSocket } = require("./socket");

const app = express();
const server = http.createServer(app);

// Enable CORS for all origins in development
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3003",
      "http://localhost:3006",
      "http://localhost:5173",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:5173",
    ],
    methods: ["GET", "POST"],
    credentials: true,
  }),
);
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  // Get active rooms count
  const rooms = global.rooms || new Map();
  res.json({
    status: "OK",
    rooms: rooms.size || 0,
    timestamp: new Date().toISOString(),
  });
});

// Get active rooms info (for debugging)
app.get("/rooms", (req, res) => {
  const rooms = global.rooms || new Map();
  const roomInfo = [];
  rooms.forEach((room, roomId) => {
    roomInfo.push({
      roomId,
      users: room.users.length,
      messages: room.messages.length,
      cartItems: room.cart.length,
      created_at: room.created_at,
    });
  });
  res.json({ rooms: roomInfo });
});

// Setup Socket.io
const io = setupSocket(server);

// Store rooms globally for health check
global.rooms = new Map();

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Socket server running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
  console.log(`📡 Rooms info: http://localhost:${PORT}/rooms`);
});
