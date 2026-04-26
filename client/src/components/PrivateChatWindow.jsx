import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import {
  RiSendPlaneFill,
  RiImageAddLine,
  RiCloseLine,
  RiArrowLeftLine,
} from "react-icons/ri";
import { getSocket, onSocketReady } from "../services/socket";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import {
  getPrivateMessages,
  sendMessage,
  markMessagesSeen,
} from "../services/api";
import Avatar from "./Avatar";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";

export default function PrivateChatWindow({ chatUser }) {
  const { user } = useAuth();
  const { isUserOnline, setActiveChat } = useChat();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [typingUser, setTypingUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);
  const fileRef = useRef(null);

  const isOnline = isUserOnline(chatUser._id);

  // Fetch history
  useEffect(() => {
    let cancelled = false;
    const fetchMsgs = async () => {
      setLoading(true);
      try {
        const { data } = await getPrivateMessages(chatUser._id);
        if (!cancelled) setMessages(data);
      } catch {}
      if (!cancelled) setLoading(false);
    };
    fetchMsgs();
    markMessagesSeen(chatUser._id).catch(() => {});
    return () => { cancelled = true; };
  }, [chatUser._id]);

  // Socket events — use onSocketReady so we never miss events on first mount
  useEffect(() => {
    let cleanup = null;

    onSocketReady((socket) => {
      const onMsg = (msg) => {
        const sId = msg.sender?._id || msg.sender;
        const rId = msg.receiver?._id || msg.receiver;
        const involved =
          (sId === chatUser._id && rId === user._id) ||
          (sId === user._id && rId === chatUser._id);

        if (involved) {
          setMessages((prev) => {
            if (prev.some((m) => m._id === msg._id)) return prev;
            return [...prev, msg];
          });
          if (sId === chatUser._id) {
            markMessagesSeen(chatUser._id).catch(() => {});
          }
        }
      };

      const onTypingStart = (data) => {
        if (data.senderId === chatUser._id) setTypingUser(chatUser.name);
      };
      const onTypingStop = (data) => {
        if (data.senderId === chatUser._id) setTypingUser(null);
      };
      const onSeen = () => {
        setMessages((prev) =>
          prev.map((m) =>
            m.sender?._id === user._id || m.sender === user._id
              ? { ...m, seen: true }
              : m
          )
        );
      };

      socket.on("receive_private_message", onMsg);
      socket.on("typing_start", onTypingStart);
      socket.on("typing_stop", onTypingStop);
      socket.on("message_seen", onSeen);

      cleanup = () => {
        socket.off("receive_private_message", onMsg);
        socket.off("typing_start", onTypingStart);
        socket.off("typing_stop", onTypingStop);
        socket.off("message_seen", onSeen);
      };
    });

    return () => { if (cleanup) cleanup(); };
  }, [chatUser._id, user._id]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUser]);

  const handleTyping = (e) => {
    setText(e.target.value);
    const socket = getSocket();
    if (!socket?.connected) return;
    socket.emit("typing_start", {
      receiverId: chatUser._id,
      senderId: user._id,
      senderName: user.name,
    });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("typing_stop", { receiverId: chatUser._id, senderId: user._id });
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
    if ((!text.trim() && !imageFile) || sending) return;

    setSending(true);
    const socket = getSocket();
    if (socket?.connected) {
      socket.emit("typing_stop", { receiverId: chatUser._id, senderId: user._id });
    }

    try {
      const formData = new FormData();
      formData.append("receiverId", chatUser._id);
      if (text.trim()) formData.append("message", text.trim());
      if (imageFile) formData.append("image", imageFile);

      const { data: savedMsg } = await sendMessage(formData);

      // Optimistically add to local state immediately
      setMessages((prev) => {
        if (prev.some((m) => m._id === savedMsg._id)) return prev;
        return [...prev, savedMsg];
      });

      // Emit via socket so the receiver gets it in real-time
      if (socket?.connected) {
        socket.emit("send_private_message", {
          ...savedMsg,
          receiverId: chatUser._id,
          senderId: user._id,
        });
      }

      setText("");
      setImageFile(null);
      setImagePreview("");
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      console.error("Send failed:", err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

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
        <Avatar src={chatUser.avatar} name={chatUser.name} size="md" online={isOnline} />
        <div>
          <h2 className="text-white font-bold text-sm">{chatUser.name}</h2>
          <p className="text-pulse-text-gray text-xs">
            {isOnline ? "Online" : "Offline"}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-pulse-text-gray text-xs uppercase tracking-widest">
              Loading...
            </span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Avatar src={chatUser.avatar} name={chatUser.name} size="xl" />
            <p className="text-white font-bold text-sm">{chatUser.name}</p>
            <p className="text-pulse-text-gray text-xs text-center max-w-xs">
              This is the beginning of your conversation. Say something.
            </p>
          </div>
        ) : (
          <>
            {messages.map((msg, i) => {
              const isOwn =
                msg.sender?._id === user._id || msg.sender === user._id;
              return (
                <MessageBubble key={msg._id || i} msg={msg} isOwn={isOwn} showAvatar={false} />
              );
            })}
            {typingUser && <TypingIndicator name={null} />}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Image preview */}
      {imagePreview && (
        <div className="flex-shrink-0 px-4 pb-2">
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="preview"
              className="h-20 w-20 object-cover border border-pulse-dark-border"
            />
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
          placeholder="Message..."
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
    </div>
  );
}