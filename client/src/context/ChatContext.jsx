import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { onSocketReady } from "../services/socket";
import { useAuth } from "./AuthContext";

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [notifications, setNotifications] = useState({});
  const activeChatRef = useRef(activeChat);

  // Keep ref in sync so socket callbacks always see latest activeChat
  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  useEffect(() => {
    if (!user) return;

    let cleanup = null;

    onSocketReady((socket) => {
      const onOnlineUsers = (users) => {
        setOnlineUsers(users);
      };

      const onPrivateMsg = (msg) => {
        const senderId = msg.sender?._id || msg.sender;
        const current = activeChatRef.current;
        const isViewingThisChat =
          current?.type === "private" && current?.data?._id === senderId;

        if (!isViewingThisChat) {
          setNotifications((prev) => ({
            ...prev,
            [senderId]: (prev[senderId] || 0) + 1,
          }));
        }
      };

      socket.on("online_users", onOnlineUsers);
      socket.on("receive_private_message", onPrivateMsg);

      // Always request fresh list when context mounts
      socket.emit("get_online_users");

      cleanup = () => {
        socket.off("online_users", onOnlineUsers);
        socket.off("receive_private_message", onPrivateMsg);
      };
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, [user]);

  const clearNotification = useCallback((userId) => {
    setNotifications((prev) => {
      const updated = { ...prev };
      delete updated[userId];
      return updated;
    });
  }, []);

  const isUserOnline = useCallback(
    (userId) => onlineUsers.includes(String(userId)),
    [onlineUsers]
  );

  return (
    <ChatContext.Provider
      value={{
        onlineUsers,
        activeChat,
        setActiveChat,
        notifications,
        clearNotification,
        isUserOnline,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be inside ChatProvider");
  return ctx;
};