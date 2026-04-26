import { motion } from "framer-motion";
import { RiMessage3Line, RiGroupLine } from "react-icons/ri";
import { useAuth } from "../context/AuthContext";

export default function WelcomeScreen() {
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center h-full bg-pulse-black">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-sm px-6"
      >
        {/* Logo mark */}
        <div className="mb-8 inline-block">
          <div className="w-20 h-20 border-2 border-white flex items-center justify-center mx-auto">
            <span className="text-white font-black text-2xl tracking-tighter">PC</span>
          </div>
        </div>

        <h1 className="text-3xl font-black uppercase tracking-tight text-white mb-3">
          WELCOME,<br />{user?.name?.split(" ")[0] || "THERE"}.
        </h1>
        <p className="text-pulse-text-gray text-sm leading-relaxed mb-10">
          Select a conversation from the sidebar to get started, or explore public rooms.
        </p>

        <div className="flex gap-4 justify-center">
          <div className="flex flex-col items-center gap-2 text-pulse-text-gray">
            <div className="w-10 h-10 border border-pulse-dark-border flex items-center justify-center">
              <RiMessage3Line className="text-lg" />
            </div>
            <span className="text-[9px] uppercase tracking-widest">Direct</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-pulse-text-gray">
            <div className="w-10 h-10 border border-pulse-dark-border flex items-center justify-center">
              <RiGroupLine className="text-lg" />
            </div>
            <span className="text-[9px] uppercase tracking-widest">Rooms</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
