// server/socket.js
const { Server } = require("socket.io");

// Global rooms storage (accessible from index.js)
let rooms = new Map();

function setupSocket(server) {
  const io = new Server(server, {
    cors: {
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
    },
    transports: ["websocket", "polling"],
    allowEIO3: true,
  });

  // Store rooms globally for health checks
  global.rooms = rooms;

  io.on("connection", (socket) => {
    console.log(`🟢 User connected: ${socket.id}`);

    // ============================================================
    // JOIN ROOM
    // ============================================================
    socket.on("join-room", ({ roomId, username, userId }) => {
      // Leave previous room if any
      if (socket.roomId) {
        socket.leave(socket.roomId);
        removeUserFromRoom(socket.roomId, socket.id);
      }

      socket.join(roomId);
      socket.roomId = roomId;
      socket.username = username;
      socket.userId = userId;

      // Initialize room if not exists
      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          users: [],
          products: [],
          messages: [],
          selectedProduct: null,
          cart: [],
          created_at: Date.now(),
        });
      }

      const room = rooms.get(roomId);

      // Check if user already exists in room (reconnection case)
      const existingUser = room.users.find((u) => u.userId === userId);
      if (existingUser) {
        existingUser.socketId = socket.id;
        existingUser.isActive = true;
        existingUser.username = username; // Update username in case it changed
      } else {
        room.users.push({
          socketId: socket.id,
          username,
          userId,
          isActive: true,
          currentProduct: null,
        });
      }

      // Send room state to new user
      socket.emit("room-state", room);

      // Broadcast updated user list to everyone in the room
      io.to(roomId).emit("users-update", room.users);

      console.log(`👤 ${username} (${userId}) joined room ${roomId}`);
    });

    // ============================================================
    // VIEW PRODUCT
    // ============================================================
    socket.on("view-product", ({ productId, product }) => {
      const roomId = socket.roomId;
      if (!roomId || !rooms.has(roomId)) return;

      const room = rooms.get(roomId);

      // Update user's current product
      const user = room.users.find((u) => u.socketId === socket.id);
      if (user) {
        user.currentProduct = productId;
      }

      // Update room's selected product
      room.selectedProduct = product;

      // Broadcast to others in the room
      socket.to(roomId).emit("user-viewing", {
        userId: socket.id,
        username: socket.username,
        productId,
        product,
      });

      // Update product view count
      const productIndex = room.products.findIndex((p) => p.id === productId);
      if (productIndex === -1) {
        room.products.push({
          ...product,
          views: 1,
          viewers: [socket.id],
        });
      } else {
        room.products[productIndex].views =
          (room.products[productIndex].views || 0) + 1;
        if (!room.products[productIndex].viewers.includes(socket.id)) {
          room.products[productIndex].viewers.push(socket.id);
        }
      }
    });

    // ============================================================
    // SEND MESSAGE
    // ============================================================
    socket.on("send-message", ({ message }) => {
      const roomId = socket.roomId;
      if (!roomId || !rooms.has(roomId)) return;

      const room = rooms.get(roomId);
      const msgData = {
        id: Date.now().toString(),
        userId: socket.userId,
        username: socket.username,
        message: message.trim(),
        timestamp: new Date().toISOString(),
        type: "text",
      };

      room.messages.push(msgData);

      // Limit messages to last 100
      if (room.messages.length > 100) {
        room.messages = room.messages.slice(-100);
      }

      // Broadcast to everyone in the room
      io.to(roomId).emit("new-message", msgData);
    });

    // ============================================================
    // COLLABORATIVE CART
    // ============================================================
    socket.on("add-to-collab-cart", ({ productId, product }) => {
      const roomId = socket.roomId;
      if (!roomId || !rooms.has(roomId)) return;

      const room = rooms.get(roomId);

      const existing = room.cart.find((item) => item.id === productId);
      if (existing) {
        existing.quantity = (existing.quantity || 1) + 1;
      } else {
        room.cart.push({
          ...product,
          quantity: 1,
          addedBy: socket.username,
          addedById: socket.userId,
          addedAt: Date.now(),
        });
      }

      io.to(roomId).emit("cart-update", room.cart);
    });

    socket.on("remove-from-collab-cart", ({ productId }) => {
      const roomId = socket.roomId;
      if (!roomId || !rooms.has(roomId)) return;

      const room = rooms.get(roomId);
      room.cart = room.cart.filter((item) => item.id !== productId);
      io.to(roomId).emit("cart-update", room.cart);
    });

    socket.on("update-cart-quantity", ({ productId, quantity }) => {
      const roomId = socket.roomId;
      if (!roomId || !rooms.has(roomId)) return;

      const room = rooms.get(roomId);
      const item = room.cart.find((item) => item.id === productId);
      if (item) {
        item.quantity = Math.max(1, quantity);
        io.to(roomId).emit("cart-update", room.cart);
      }
    });

    // ============================================================
    // LEAVE ROOM
    // ============================================================
    socket.on("leave-room", () => {
      const roomId = socket.roomId;
      if (roomId) {
        removeUserFromRoom(roomId, socket.id);
        socket.leave(roomId);
        socket.roomId = null;
        console.log(`👋 User ${socket.id} left room ${roomId}`);
      }
    });

    // ============================================================
    // DISCONNECT
    // ============================================================
    socket.on("disconnect", () => {
      const roomId = socket.roomId;
      if (roomId) {
        // Mark user as inactive instead of removing immediately
        const room = rooms.get(roomId);
        if (room) {
          const user = room.users.find((u) => u.socketId === socket.id);
          if (user) {
            user.isActive = false;
          }
          io.to(roomId).emit("users-update", room.users);

          // Remove user after 60 seconds of inactivity
          setTimeout(() => {
            if (room) {
              const stillThere = room.users.find(
                (u) => u.socketId === socket.id && u.isActive === false,
              );
              if (stillThere) {
                removeUserFromRoom(roomId, socket.id);
                console.log(
                  `🗑️ Removed inactive user ${socket.id} from room ${roomId}`,
                );
              }
            }
          }, 60000);
        }
      }
      console.log(`🔴 User disconnected: ${socket.id}`);
    });
  });

  function removeUserFromRoom(roomId, socketId) {
    if (!rooms.has(roomId)) return;

    const room = rooms.get(roomId);
    room.users = room.users.filter((u) => u.socketId !== socketId);

    // Clean up if room is empty
    if (room.users.length === 0) {
      rooms.delete(roomId);
      console.log(`🧹 Room ${roomId} deleted (empty)`);
      return;
    }

    // Notify remaining users
    io.to(roomId).emit("users-update", room.users);
  }

  return io;
}

module.exports = { setupSocket };
