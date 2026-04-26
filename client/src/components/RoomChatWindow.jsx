import { useState, useEffect, useRef } from "react";
import {
  RiSendPlaneFill,
  RiImageAddLine,
  RiCloseLine,
  RiUserLine,
  RiArrowLeftLine,
  RiDoorOpenLine,
  RiAddLine,
} from "react-icons/ri";
import { getSocket, onSocketReady } from "../services/socket";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import {
  getRoomMessages,
  sendMessage,
  joinRoom,
  leaveRoom,
} from "../services/api";
import Avatar from "./Avatar";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

export default function RoomChatWindow({ room }) {
  const { user } = useAuth();
  const { setActiveChat, isUserOnline } = useChat();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [typingUsers, setTypingUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    const memberIds = room.members?.map((m) => m._id || m) || [];
    setIsMember(memberIds.includes(user._id));
  }, [room, user._id]);

  // Fetch messages + join socket room
  useEffect(() => {
    let cancelled = false;
    let cleanup = null;

    const fetch = async () => {
      setLoading(true);
      try {
        const { data } = await getRoomMessages(room._id);
        if (!cancelled) setMessages(data);
      } catch {}
      if (!cancelled) setLoading(false);
    };
    fetch();

    onSocketReady((socket) => {
      socket.emit("join_room", room._id);
      cleanup = () => socket.emit("leave_room", room._id);
    });

    return () => {
      cancelled = true;
      if (cleanup) cleanup();
    };
  }, [room._id]);

  // Socket listeners
  useEffect(() => {
    let cleanup = null;

    onSocketReady((socket) => {
      const onMsg = (msg) => {
        const msgRoom = msg.room?._id || msg.room;
        if (msgRoom === room._id) {
          setMessages((prev) => {
            if (prev.some((m) => m._id === msg._id)) return prev;
            return [...prev, msg];
          });
        }
      };

      const onTypingStart = (data) => {
        if (data.room === room._id && data.senderId !== user._id) {
          setTypingUsers((prev) => ({ ...prev, [data.senderId]: data.senderName }));
        }
      };

      const onTypingStop = (data) => {
        if (data.room === room._id) {
          setTypingUsers((prev) => {
            const updated = { ...prev };
            delete updated[data.senderId];
            return updated;
          });
        }
      };

      socket.on("receive_room_message", onMsg);
      socket.on("typing_start", onTypingStart);
      socket.on("typing_stop", onTypingStop);

      cleanup = () => {
        socket.off("receive_room_message", onMsg);
        socket.off("typing_start", onTypingStart);
        socket.off("typing_stop", onTypingStop);
      };
    });

    return () => { if (cleanup) cleanup(); };
  }, [room._id, user._id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  const handleTyping = (e) => {
    setText(e.target.value);
    const socket = getSocket();
    if (!socket?.connected) return;
    socket.emit("typing_start", { room: room._id, senderId: user._id, senderName: user.name });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("typing_stop", { room: room._id, senderId: user._id });
    }, 1500);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if ((!text.trim() && !imageFile) || sending || !isMember) return;
    setSending(true);
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit("typing_stop", { room: room._id, senderId: user._id });
    }

    try {
      const formData = new FormData();
      formData.append("room", room._id);
      if (text.trim()) formData.append("message", text.trim());
      if (imageFile) formData.append("image", imageFile);

      const { data: savedMsg } = await sendMessage(formData);

      // Optimistically show immediately to sender
      setMessages((prev) => {
        if (prev.some((m) => m._id === savedMsg._id)) return prev;
        return [...prev, savedMsg];
      });

      // Broadcast to all room members via socket
      if (socket?.connected) {
        socket.emit("send_room_message", {
          ...savedMsg,
          room: room._id,
        });
      }

      setText("");
      setImageFile(null);
      setImagePreview("");
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleJoin = async () => {
    try {
      await joinRoom(room._id);
      setIsMember(true);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to join room");
    }
  };

  const handleLeave = async () => {
    if (!confirm("Leave this room?")) return;
    try {
      await leaveRoom(room._id);
      setActiveChat(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to leave room");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  const typingNames = Object.values(typingUsers);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center gap-3 px-6 py-4 border-b border-pulse-dark-border bg-pulse-dark-bg">
        <button
          onClick={() => setActiveChat(null)}
          className="text-pulse-text-gray hover:text-white transition-colors mr-1 lg:hidden"
        >
          <RiArrowLeftLine />
        </button>

        <div className="w-10 h-10 bg-pulse-dark-surface border border-pulse-dark-border rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-white font-black text-sm">
            {room.name.charAt(0).toUpperCase()}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="text-white font-bold text-sm uppercase tracking-wide truncate">
            {room.name}
          </h2>
          <p className="text-pulse-text-gray text-xs">
            {room.members?.length || 0} members
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setShowMembers(!showMembers)}
            className="text-pulse-text-gray hover:text-white transition-colors p-1.5"
            title="Members"
          >
            <RiUserLine className="text-lg" />
          </button>
          {!isMember ? (
            <button
              onClick={handleJoin}
              className="flex items-center gap-1 text-xs bg-white text-pulse-black px-3 py-1.5 font-black uppercase tracking-widest hover:bg-pulse-hover-gray transition-all"
            >
              <RiAddLine /> Join
            </button>
          ) : (
            room.admin?._id !== user._id && (
              <button
                onClick={handleLeave}
                className="text-pulse-text-gray hover:text-pulse-red transition-colors p-1.5"
                title="Leave Room"
              >
                <RiDoorOpenLine className="text-lg" />
              </button>
            )
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Messages */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <span className="text-pulse-text-gray text-xs uppercase tracking-widest">Loading...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3">
                <div className="w-16 h-16 bg-pulse-dark-surface border border-pulse-dark-border rounded-full flex items-center justify-center">
                  <span className="text-white font-black text-2xl">
                    {room.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <p className="text-white font-bold text-sm uppercase tracking-wide">{room.name}</p>
                {room.description && (
                  <p className="text-pulse-text-gray text-xs text-center max-w-xs">
                    {room.description}
                  </p>
                )}
                <p className="text-pulse-text-gray text-xs">
                  {isMember ? "Be the first to say something." : "Join to start chatting."}
                </p>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => {
                  const isOwn = msg.sender?._id === user._id || msg.sender === user._id;
                  const prevMsg = messages[i - 1];
                  const showAvatar = !isOwn && (
                    !prevMsg ||
                    (prevMsg.sender?._id || prevMsg.sender) !== (msg.sender?._id || msg.sender)
                  );
                  return (
                    <MessageBubble key={msg._id || i} msg={msg} isOwn={isOwn} showAvatar={showAvatar} />
                  );
                })}
                {typingNames.length > 0 && (
                  <TypingIndicator
                    name={typingNames.length === 1 ? typingNames[0] : `${typingNames.length} people`}
                  />
                )}
                <div ref={bottomRef} />
              </>
            )}
          </div>

          {/* Image preview */}
          {imagePreview && (
            <div className="flex-shrink-0 px-4 pb-2">
              <div className="relative inline-block">
                <img src={imagePreview} alt="preview" className="h-20 w-20 object-cover border border-pulse-dark-border" />
                <button
                  onClick={() => { setImageFile(null); setImagePreview(""); if (fileRef.current) fileRef.current.value = ""; }}
                  className="absolute -top-2 -right-2 bg-pulse-black border border-pulse-dark-border text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-pulse-red transition-colors"
                >
                  <RiCloseLine />
                </button>
              </div>
            </div>
          )}

          {/* Input */}
          {isMember ? (
            <form
              onSubmit={handleSend}
              className="flex-shrink-0 flex items-center gap-2 px-4 py-3 border-t border-pulse-dark-border bg-pulse-dark-bg"
            >
              <input type="file" ref={fileRef} accept="image/*" onChange={handleImageChange} className="hidden" />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="text-pulse-text-gray hover:text-white transition-colors p-2 flex-shrink-0"
              >
                <RiImageAddLine className="text-xl" />
              </button>
              <input
                type="text"
                value={text}
                onChange={handleTyping}
                onKeyDown={handleKeyDown}
                placeholder={`Message ${room.name}...`}
                className="flex-1 bg-pulse-dark-surface border border-pulse-dark-border text-white placeholder-pulse-text-gray px-4 py-2.5 text-sm outline-none focus:border-white transition-colors"
              />
              <button
                type="submit"
                disabled={(!text.trim() && !imageFile) || sending}
                className="bg-white text-pulse-black p-2.5 hover:bg-pulse-hover-gray transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
              >
                <RiSendPlaneFill className="text-lg" />
              </button>
            </form>
          ) : (
            <div className="flex-shrink-0 flex items-center justify-center py-4 border-t border-pulse-dark-border bg-pulse-dark-bg">
              <button
                onClick={handleJoin}
                className="flex items-center gap-2 bg-white text-pulse-black px-8 py-3 font-black uppercase tracking-widest text-xs hover:bg-pulse-hover-gray transition-all active:scale-95"
              >
                <RiAddLine /> Join Room to Chat
              </button>
            </div>
          )}
        </div>

        {/* Members panel */}
        {showMembers && (
          <div className="w-56 flex-shrink-0 border-l border-pulse-dark-border bg-pulse-dark-bg overflow-y-auto">
            <div className="px-4 py-3 border-b border-pulse-dark-border flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-pulse-text-gray">
                Members ({room.members?.length})
              </span>
              <button onClick={() => setShowMembers(false)} className="text-pulse-text-gray hover:text-white">
                <RiCloseLine />
              </button>
            </div>
            {(room.members || []).map((m) => {
              const memberId = m._id || m;
              const memberName = m.name || "Unknown";
              const isAdmin = (room.admin?._id || room.admin) === memberId;
              return (
                <div key={memberId} className="flex items-center gap-2 px-4 py-2.5">
                  <Avatar src={m.avatar} name={memberName} size="xs" online={isUserOnline(memberId)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-xs truncate">{memberName}</p>
                    {isAdmin && (
                      <p className="text-[9px] uppercase tracking-widest text-pulse-text-gray">Admin</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}