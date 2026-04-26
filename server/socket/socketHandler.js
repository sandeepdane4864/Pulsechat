const User = require("../models/User");

// Map: userId -> socketId
const onlineUsers = new Map();

const socketHandler = (io) => {
  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log(`🔌 User connected: ${socket.id} | userId: ${userId}`);

    // ─── User goes online ────────────────────────────────────────────
    if (userId && userId !== "undefined") {
      onlineUsers.set(userId, socket.id);

      // Update DB status
      User.findByIdAndUpdate(userId, { status: "online" }).catch(console.error);

      // Send current online list to the newly connected socket immediately
      socket.emit("online_users", Array.from(onlineUsers.keys()));

      // Broadcast updated list to everyone else
      socket.broadcast.emit("online_users", Array.from(onlineUsers.keys()));
    }

    // ─── Join room ───────────────────────────────────────────────────
    socket.on("join_room", (roomId) => {
      socket.join(roomId);
      console.log(`📦 ${socket.id} joined room ${roomId}`);
    });

    socket.on("leave_room", (roomId) => {
      socket.leave(roomId);
      console.log(`🚪 ${socket.id} left room ${roomId}`);
    });

    // ─── Room message ────────────────────────────────────────────────
    socket.on("send_room_message", (data) => {
      // Normalize room ID whether it's a string or populated object
      const roomId = data.room?._id || data.room;
      io.to(roomId).emit("receive_room_message", { ...data, room: roomId });
    });

    // ─── Private message ─────────────────────────────────────────────
    socket.on("send_private_message", (data) => {
      // data: { receiverId, senderId, message, image, _id, sender, createdAt }
      const receiverSocketId = onlineUsers.get(data.receiverId);
      const senderSocketId = onlineUsers.get(data.senderId);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receive_private_message", data);
      }
      // Also emit back to sender (for multi-tab)
      if (senderSocketId && senderSocketId !== socket.id) {
        io.to(senderSocketId).emit("receive_private_message", data);
      }
    });

    // ─── Typing indicators ───────────────────────────────────────────
    socket.on("typing_start", (data) => {
      // data: { room?, receiverId?, senderId, senderName }
      if (data.room) {
        socket.to(data.room).emit("typing_start", data);
      } else if (data.receiverId) {
        const receiverSocketId = onlineUsers.get(data.receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("typing_start", data);
        }
      }
    });

    socket.on("typing_stop", (data) => {
      if (data.room) {
        socket.to(data.room).emit("typing_stop", data);
      } else if (data.receiverId) {
        const receiverSocketId = onlineUsers.get(data.receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("typing_stop", data);
        }
      }
    });

    // ─── Message seen ────────────────────────────────────────────────
    socket.on("message_seen", (data) => {
      // data: { senderId, seenBy }
      const senderSocketId = onlineUsers.get(data.senderId);
      if (senderSocketId) {
        io.to(senderSocketId).emit("message_seen", data);
      }
    });

    // ─── Get online users ────────────────────────────────────────────
    socket.on("get_online_users", () => {
      socket.emit("online_users", Array.from(onlineUsers.keys()));
    });

    // ─── Disconnect ──────────────────────────────────────────────────
    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.id}`);

      // Find which userId maps to this socket
      let disconnectedUserId = null;
      for (const [uid, sid] of onlineUsers.entries()) {
        if (sid === socket.id) {
          disconnectedUserId = uid;
          break;
        }
      }

      if (disconnectedUserId) {
        onlineUsers.delete(disconnectedUserId);

        User.findByIdAndUpdate(disconnectedUserId, {
          status: "offline",
          lastSeen: Date.now(),
        }).catch(console.error);

        io.emit("online_users", Array.from(onlineUsers.keys()));
        io.emit("user_offline", disconnectedUserId);
      }
    });
  });
};

module.exports = socketHandler;