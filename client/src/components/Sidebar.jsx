import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  RiMessage3Line,
  RiGroupLine,
  RiUserLine,
  RiAddLine,
  RiLogoutBoxLine,
  RiSearch2Line,
} from "react-icons/ri";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import { getAllUsers, getMyRooms, getAllRooms, logoutUser } from "../services/api";
import Avatar from "./Avatar";
import CreateRoomModal from "./CreateRoomModal";

const tabs = [
  { id: "chats", icon: RiMessage3Line, label: "Chats" },
  { id: "rooms", icon: RiGroupLine, label: "Rooms" },
  { id: "explore", icon: RiSearch2Line, label: "Explore" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { activeChat, setActiveChat, notifications, clearNotification, isUserOnline } = useChat();
  const navigate = useNavigate();

  const [tab, setTab] = useState("chats");
  const [users, setUsers] = useState([]);
  const [myRooms, setMyRooms] = useState([]);
  const [allRooms, setAllRooms] = useState([]);
  const [search, setSearch] = useState("");
  const [showCreateRoom, setShowCreateRoom] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchMyRooms();
  }, []);

  useEffect(() => {
    if (tab === "explore") fetchAllRooms();
  }, [tab]);

  const fetchUsers = async () => {
    try {
      const { data } = await getAllUsers();
      setUsers(data);
    } catch {}
  };

  const fetchMyRooms = async () => {
    try {
      const { data } = await getMyRooms();
      setMyRooms(data);
    } catch {}
  };

  const fetchAllRooms = async () => {
    try {
      const { data } = await getAllRooms();
      setAllRooms(data);
    } catch {}
  };

  const openPrivateChat = (u) => {
    setActiveChat({ type: "private", data: u });
    clearNotification(u._id);
  };

  const openRoomChat = (room) => {
    setActiveChat({ type: "room", data: room });
  };

  const handleLogout = async () => {
    try { await logoutUser(); } catch {}
    logout();
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );
  const filteredMyRooms = myRooms.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );
  const filteredAllRooms = allRooms.filter((r) =>
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-72 flex-shrink-0 h-full bg-pulse-dark-bg border-r border-pulse-dark-border flex flex-col">
      {/* Header */}
      <div className="px-5 py-5 border-b border-pulse-dark-border flex items-center justify-between">
        <span className="text-white font-black uppercase tracking-widest text-sm">
          PULSE<span className="text-pulse-text-gray">CHAT</span>
        </span>
        <button
          onClick={() => navigate("/profile")}
          className="relative"
        >
          <Avatar
            src={user?.avatar}
            name={user?.name}
            size="sm"
            online={true}
          />
        </button>
      </div>

      {/* Search */}
      <div className="px-4 py-3 border-b border-pulse-dark-border">
        <div className="flex items-center gap-2 bg-pulse-dark-surface px-3 py-2 border border-pulse-dark-border">
          <RiSearch2Line className="text-pulse-text-gray text-sm flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="bg-transparent text-white text-sm outline-none w-full placeholder-pulse-text-gray"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-pulse-dark-border">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex flex-col items-center py-3 gap-1 transition-all duration-150 ${
              tab === t.id
                ? "text-white border-b-2 border-white"
                : "text-pulse-text-gray hover:text-white"
            }`}
          >
            <t.icon className="text-base" />
            <span className="text-[9px] uppercase tracking-widest">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {/* Chats tab */}
          {tab === "chats" && (
            <motion.div
              key="chats"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="px-4 py-3">
                <span className="text-[10px] uppercase tracking-widest text-pulse-text-gray">
                  Direct Messages
                </span>
              </div>
              {filteredUsers.length === 0 && (
                <p className="text-pulse-text-gray text-xs text-center py-8 px-4">
                  No users found
                </p>
              )}
              {filteredUsers.map((u) => {
                const isActive =
                  activeChat?.type === "private" && activeChat?.data?._id === u._id;
                const notifCount = notifications[u._id] || 0;
                const online = isUserOnline(u._id);

                return (
                  <div
                    key={u._id}
                    onClick={() => openPrivateChat(u)}
                    className={`sidebar-item ${isActive ? "sidebar-item-active" : ""}`}
                  >
                    <Avatar src={u.avatar} name={u.name} size="sm" online={online} />
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{u.name}</p>
                      <p className="text-pulse-text-gray text-xs">
                        {online ? "Online" : "Offline"}
                      </p>
                    </div>
                    {notifCount > 0 && (
                      <span className="bg-white text-pulse-black text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                        {notifCount > 9 ? "9+" : notifCount}
                      </span>
                    )}
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* My Rooms tab */}
          {tab === "rooms" && (
            <motion.div
              key="rooms"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="px-4 py-3 flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest text-pulse-text-gray">
                  My Rooms
                </span>
                <button
                  onClick={() => setShowCreateRoom(true)}
                  className="text-pulse-text-gray hover:text-white transition-colors"
                  title="Create Room"
                >
                  <RiAddLine className="text-base" />
                </button>
              </div>
              {filteredMyRooms.length === 0 && (
                <div className="text-center py-10 px-4">
                  <p className="text-pulse-text-gray text-xs mb-3">No rooms yet</p>
                  <button
                    onClick={() => setShowCreateRoom(true)}
                    className="text-xs text-white uppercase tracking-widest underline hover:no-underline"
                  >
                    Create one
                  </button>
                </div>
              )}
              {filteredMyRooms.map((room) => {
                const isActive =
                  activeChat?.type === "room" && activeChat?.data?._id === room._id;
                return (
                  <div
                    key={room._id}
                    onClick={() => openRoomChat(room)}
                    className={`sidebar-item ${isActive ? "sidebar-item-active" : ""}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-pulse-dark-surface border border-pulse-dark-border flex items-center justify-center flex-shrink-0">
                      <RiGroupLine className="text-pulse-text-gray text-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{room.name}</p>
                      <p className="text-pulse-text-gray text-xs">
                        {room.members?.length || 0} members
                      </p>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* Explore tab */}
          {tab === "explore" && (
            <motion.div
              key="explore"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <div className="px-4 py-3">
                <span className="text-[10px] uppercase tracking-widest text-pulse-text-gray">
                  Discover Rooms
                </span>
              </div>
              {filteredAllRooms.length === 0 && (
                <p className="text-pulse-text-gray text-xs text-center py-8">
                  No public rooms yet
                </p>
              )}
              {filteredAllRooms.map((room) => (
                <div
                  key={room._id}
                  onClick={() => openRoomChat(room)}
                  className="sidebar-item"
                >
                  <div className="w-8 h-8 rounded-full bg-pulse-dark-surface border border-pulse-dark-border flex items-center justify-center flex-shrink-0">
                    <RiGroupLine className="text-pulse-text-gray text-sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{room.name}</p>
                    <p className="text-pulse-text-gray text-xs">
                      {room.members?.length || 0} members
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="border-t border-pulse-dark-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar src={user?.avatar} name={user?.name} size="sm" online />
          <div className="min-w-0">
            <p className="text-white text-xs font-bold truncate">{user?.name}</p>
            <p className="text-pulse-text-gray text-[10px] truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="text-pulse-text-gray hover:text-pulse-red transition-colors ml-2 flex-shrink-0"
          title="Logout"
        >
          <RiLogoutBoxLine className="text-base" />
        </button>
      </div>

      {showCreateRoom && (
        <CreateRoomModal
          onClose={() => setShowCreateRoom(false)}
          onCreated={(room) => {
            setMyRooms((prev) => [room, ...prev]);
            openRoomChat(room);
            setShowCreateRoom(false);
          }}
        />
      )}
    </div>
  );
}
