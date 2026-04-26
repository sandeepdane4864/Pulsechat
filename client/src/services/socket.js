import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

let socket = null;
let readyCallbacks = [];

export const getSocket = () => socket;

// Call cb immediately if socket is already connected, otherwise queue it
export const onSocketReady = (cb) => {
  if (socket?.connected) {
    cb(socket);
  } else {
    readyCallbacks.push(cb);
  }
};

export const connectSocket = (userId) => {
  if (socket?.connected) return socket;

  // Clean up stale disconnected socket
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  socket = io(SOCKET_URL, {
    query: { userId },
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
  });

  socket.on("connect", () => {
    console.log("✅ Socket connected:", socket.id);
    // Flush queued callbacks
    readyCallbacks.forEach((cb) => cb(socket));
    readyCallbacks = [];
    // Re-request online users on every (re)connect
    socket.emit("get_online_users");
  });

  socket.on("reconnect", () => {
    console.log("🔄 Socket reconnected");
    socket.emit("get_online_users");
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    readyCallbacks = [];
  }
};