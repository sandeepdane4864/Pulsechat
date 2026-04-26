import { useState } from "react";
import { motion } from "framer-motion";
import { RiCloseLine } from "react-icons/ri";
import { createRoom } from "../services/api";

export default function CreateRoomModal({ onClose, onCreated }) {
  const [form, setForm] = useState({ name: "", description: "", isPrivate: false });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((p) => ({ ...p, [e.target.name]: val }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError("Room name required");
    setError("");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("description", form.description.trim());
      formData.append("isPrivate", form.isPrivate);
      const { data } = await createRoom(formData);
      onCreated(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-pulse-dark-bg border border-pulse-dark-border w-full max-w-md"
      >
        <div className="flex items-center justify-between px-6 py-5 border-b border-pulse-dark-border">
          <h2 className="text-white font-black uppercase tracking-widest text-sm">
            Create Room
          </h2>
          <button
            onClick={onClose}
            className="text-pulse-text-gray hover:text-white transition-colors"
          >
            <RiCloseLine className="text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="text-pulse-red text-xs uppercase tracking-widest border border-pulse-red/30 px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-pulse-text-gray mb-2">
              Room Name *
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Design Talk"
              className="pulse-input"
              maxLength={50}
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-widest text-pulse-text-gray mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="What's this room about?"
              rows={3}
              maxLength={200}
              className="pulse-input resize-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isPrivate"
              id="isPrivate"
              checked={form.isPrivate}
              onChange={handleChange}
              className="w-4 h-4 accent-white cursor-pointer"
            />
            <label
              htmlFor="isPrivate"
              className="text-xs text-pulse-text-gray uppercase tracking-widest cursor-pointer"
            >
              Private Room
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-pulse-dark-border text-pulse-text-gray text-xs uppercase tracking-widest hover:border-white hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-white text-pulse-black font-black text-xs uppercase tracking-widest hover:bg-pulse-hover-gray transition-all disabled:opacity-50"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
