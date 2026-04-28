ii# PulseChat ⚡

> \real-time MERN chat platform** — rooms, private messaging, media sharing, authentication.

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite, Tailwind CSS, Framer Motion, React Router v6 |
| Backend | Node.js, Express.js, Socket.IO |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Uploads | Multer (local) / Cloudinary (optional) |
| Real-time | Socket.IO |

---

## Features

- ✅ JWT Authentication (register / login / logout)
- ✅ Edit profile + avatar upload
- ✅ Real-time private messaging (Socket.IO)
- ✅ Group chat rooms (create, join, leave, delete)
- ✅ Typing indicators (private + room)
- ✅ Online / offline status with last seen
- ✅ Image sharing in chat
- ✅ Message seen / double-tick status
- ✅ Unread message badge counters
- ✅ Member list panel in rooms
- ✅ Explore public rooms
- ✅ Mobile-responsive layout
- ✅  monochrome design system
- ✅ Rate limiting + input validation

---

## Project Structure

```
pulsechat/
├── server/
│   ├── config/         # MongoDB connection
│   ├── controllers/    # Auth, Messages, Rooms
│   ├── middleware/     # JWT auth, Multer upload
│   ├── models/         # User, Message, Room schemas
│   ├── routes/         # Express route definitions
│   ├── socket/         # Socket.IO event handler
│   ├── uploads/        # Local file storage
│   ├── app.js          # Express app
│   └── server.js       # HTTP server + Socket.IO boot
│
├── client/
│   └── src/
│       ├── components/  # Avatar, Sidebar, ChatWindow, Bubbles…
│       ├── context/     # AuthContext, ChatContext
│       ├── pages/       # Login, Signup, Dashboard, Profile
│       ├── services/    # Axios API calls, Socket singleton
│       └── utils/       # Time formatters
│
└── package.json        # Root scripts (concurrently)
```

---

## Quick Start

### 1. Clone & install

```bash
git clone <your-repo>
cd pulsechat
npm run install-all
```

### 2. Configure environment

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/pulsechat
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

### 3. Start MongoDB

```bash
# Local
mongod

# Or use MongoDB Atlas — paste your connection string into MONGO_URI
```

### 4. Run development

```bash
# From root — starts both server and client
npm run dev

# Or separately:
npm run server   # Express + Socket.IO on :5000
npm run client   # Vite on :5173
```

---

## API Reference

### Auth
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Login |
| POST | `/api/auth/logout` | ✅ | Logout |
| GET | `/api/auth/profile` | ✅ | Get own profile |
| PUT | `/api/auth/profile` | ✅ | Update name/bio/avatar |
| GET | `/api/auth/users` | ✅ | All users (for DM list) |

### Messages
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/messages/send` | ✅ | Send message (text or image) |
| GET | `/api/messages/private/:userId` | ✅ | Private chat history |
| GET | `/api/messages/room/:roomId` | ✅ | Room message history |
| PUT | `/api/messages/seen/:senderId` | ✅ | Mark messages as seen |
| GET | `/api/messages/unread` | ✅ | Unread counts per user |

### Rooms
| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/rooms/create` | ✅ | Create room |
| GET | `/api/rooms/all` | ✅ | All public rooms |
| GET | `/api/rooms/my` | ✅ | Rooms I'm in |
| GET | `/api/rooms/:roomId` | ✅ | Single room details |
| POST | `/api/rooms/join` | ✅ | Join a room |
| DELETE | `/api/rooms/leave` | ✅ | Leave a room |
| DELETE | `/api/rooms/:roomId` | ✅ | Delete room (admin only) |

---

## Socket.IO Events

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `join_room` | `roomId` | Subscribe to room |
| `leave_room` | `roomId` | Unsubscribe from room |
| `send_room_message` | message object | Broadcast to room |
| `send_private_message` | message object | Send to specific user |
| `typing_start` | `{ room?, receiverId?, senderId, senderName }` | Typing indicator |
| `typing_stop` | same | Stop typing |
| `message_seen` | `{ senderId, seenBy }` | Mark seen |

### Server → Client
| Event | Description |
|-------|-------------|
| `online_users` | Array of online user IDs |
| `receive_room_message` | New room message |
| `receive_private_message` | New private message |
| `typing_start` / `typing_stop` | Typing state |
| `message_seen` | Seen receipt |
| `user_offline` | User disconnected |

---

## Deployment

### Frontend (Vercel/Netlify)
```bash
cd client
npm run build
# Deploy /dist folder
```

Set env var: `VITE_API_URL=https://your-backend.com/api`

### Backend (Render/Railway)
- Set all env vars from `.env.example`
- Set `CLIENT_URL` to your Vercel URL
- MongoDB Atlas for database

---

## Design System

| Token | Value |
|-------|-------|
| Black | `#111111` |
| White | `#FFFFFF` |
| Surface | `#1A1A1A` |
| Border | `#2A2A2A` |
| Text Gray | `#707072` |
| Error Red | `#D30005` |
| Success Green | `#007D48` |

Typography: Helvetica Neue — big uppercase headings, clean body.

---

## License

MIT
