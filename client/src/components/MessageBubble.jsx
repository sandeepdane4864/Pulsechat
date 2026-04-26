import { format } from "../utils/time";
import Avatar from "./Avatar";
import { RiCheckDoubleLine, RiCheckLine } from "react-icons/ri";

export default function MessageBubble({ msg, isOwn, showAvatar = false }) {
  return (
    <div className={`flex items-end gap-2 mb-1 message-appear ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar placeholder for spacing */}
      <div className="w-7 flex-shrink-0">
        {showAvatar && !isOwn && (
          <Avatar src={msg.sender?.avatar} name={msg.sender?.name} size="xs" />
        )}
      </div>

      <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[72%]`}>
        {/* Sender name for group chats */}
        {showAvatar && !isOwn && (
          <span className="text-[10px] text-pulse-text-gray uppercase tracking-widest mb-1 ml-1">
            {msg.sender?.name}
          </span>
        )}

        {/* Image message */}
        {msg.image && (
          <div className={`overflow-hidden mb-1 ${isOwn ? "rounded-2xl rounded-br-sm" : "rounded-2xl rounded-bl-sm"}`}>
            <img
              src={msg.image}
              alt="shared"
              className="max-w-[200px] max-h-[200px] object-cover cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => window.open(msg.image, "_blank")}
            />
          </div>
        )}

        {/* Text message */}
        {msg.message && (
          <div className={isOwn ? "msg-bubble-mine" : "msg-bubble-other"}>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
          </div>
        )}

        {/* Timestamp + seen */}
        <div className={`flex items-center gap-1 mt-1 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
          <span className="text-[10px] text-pulse-text-gray">
            {format(msg.createdAt)}
          </span>
          {isOwn && (
            <span className={`text-[10px] ${msg.seen ? "text-pulse-green" : "text-pulse-text-gray"}`}>
              {msg.seen ? <RiCheckDoubleLine /> : <RiCheckLine />}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
