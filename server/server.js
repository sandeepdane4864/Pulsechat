require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");
const connectDB = require("./config/db");
const socketHandler = require("./socket/socketHandler");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
  pingTimeout: 60000,
});

socketHandler(io);

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`\n🚀 PulseChat server running on port ${PORT}`);
    console.log(`📡 Socket.IO ready`);
    console.log(`🌐 API: http://localhost:${PORT}/api`);
    console.log(`─────────────────────────────────\n`);
  });
});
