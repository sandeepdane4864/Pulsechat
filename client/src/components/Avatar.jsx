export default function Avatar({ src, name = "", size = "md", online = false }) {
  const sizes = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-xl",
    "2xl": "w-24 h-24 text-3xl",
  };

  const dotSizes = {
    xs: "w-1.5 h-1.5",
    sm: "w-2 h-2",
    md: "w-2.5 h-2.5",
    lg: "w-3 h-3",
    xl: "w-3.5 h-3.5",
    "2xl": "w-4 h-4",
  };

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={`relative flex-shrink-0 ${sizes[size]}`}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={`${sizes[size]} rounded-full object-cover bg-pulse-dark-surface`}
        />
      ) : (
        <div
          className={`${sizes[size]} rounded-full bg-pulse-dark-surface border border-pulse-dark-border flex items-center justify-center font-bold text-pulse-text-gray`}
        >
          {initials || "?"}
        </div>
      )}
      {online && (
        <span
          className={`absolute bottom-0 right-0 ${dotSizes[size]} bg-pulse-green rounded-full border-2 border-pulse-black`}
        />
      )}
    </div>
  );
}
