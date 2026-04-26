export default function TypingIndicator({ name }) {
  return (
    <div className="flex items-end gap-2 mb-1 message-appear">
      <div className="w-7 flex-shrink-0" />
      <div className="flex flex-col items-start">
        {name && (
          <span className="text-[10px] text-pulse-text-gray uppercase tracking-widest mb-1 ml-1">
            {name}
          </span>
        )}
        <div className="msg-bubble-other flex items-center gap-1 py-3 px-4">
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </div>
      </div>
    </div>
  );
}
