import { useChat } from "../context/ChatContext";
import Sidebar from "../components/Sidebar";
import PrivateChatWindow from "../components/PrivateChatWindow";
import RoomChatWindow from "../components/RoomChatWindow";
import WelcomeScreen from "../components/WelcomeScreen";

export default function DashboardPage() {
  const { activeChat } = useChat();

  return (
    <div className="flex h-full w-full overflow-hidden bg-pulse-black">
      {/* Sidebar — hidden on mobile when chat is open */}
      <div className={`${activeChat ? "hidden lg:flex" : "flex"} h-full`}>
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className={`flex-1 h-full overflow-hidden ${!activeChat ? "hidden lg:block" : "block"}`}>
        {!activeChat && <WelcomeScreen />}

        {activeChat?.type === "private" && (
          <PrivateChatWindow key={activeChat.data._id} chatUser={activeChat.data} />
        )}

        {activeChat?.type === "room" && (
          <RoomChatWindow key={activeChat.data._id} room={activeChat.data} />
        )}
      </div>
    </div>
  );
}
