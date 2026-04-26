import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  RiArrowLeftLine,
  RiCameraLine,
  RiEditLine,
  RiCheckLine,
  RiCloseLine,
  RiLogoutBoxLine,
} from "react-icons/ri";
import { useAuth } from "../context/AuthContext";
import { updateProfile, logoutUser } from "../services/api";
import Avatar from "../components/Avatar";
import { timeAgo } from "../utils/time";

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || "", bio: user?.bio || "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const formData = new FormData();
      if (form.name.trim()) formData.append("name", form.name.trim());
      formData.append("bio", form.bio);
      if (avatarFile) formData.append("avatar", avatarFile);

      const { data } = await updateProfile(formData);
      updateUser(data);
      setEditing(false);
      setAvatarFile(null);
      setAvatarPreview("");
      setSuccess("Profile updated!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try { await logoutUser(); } catch {}
    logout();
  };

  return (
    <div className="min-h-screen bg-pulse-black flex flex-col">
      {/* Top nav */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-pulse-dark-border bg-pulse-dark-bg">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-pulse-text-gray hover:text-white transition-colors"
        >
          <RiArrowLeftLine />
          <span className="text-xs uppercase tracking-widest">Back</span>
        </button>
        <span className="text-white font-black uppercase tracking-widest text-sm">
          PULSE<span className="text-pulse-text-gray">CHAT</span>
        </span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-pulse-text-gray hover:text-pulse-red transition-colors"
        >
          <RiLogoutBoxLine />
          <span className="text-xs uppercase tracking-widest">Logout</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md"
        >
          {/* Avatar section */}
          <div className="flex flex-col items-center mb-10">
            <div className="relative mb-4">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Preview"
                  className="w-24 h-24 rounded-full object-cover border-2 border-pulse-dark-border"
                />
              ) : (
                <Avatar src={user?.avatar} name={user?.name} size="2xl" online />
              )}
              {editing && (
                <>
                  <input type="file" ref={fileRef} accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-white text-pulse-black w-7 h-7 rounded-full flex items-center justify-center hover:bg-pulse-hover-gray transition-colors"
                  >
                    <RiCameraLine className="text-sm" />
                  </button>
                </>
              )}
            </div>

            {!editing && (
              <>
                <h1 className="text-white font-black text-2xl uppercase tracking-tight mb-1">
                  {user?.name}
                </h1>
                <p className="text-pulse-text-gray text-sm mb-1">{user?.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="w-2 h-2 rounded-full bg-pulse-green animate-pulse-dot" />
                  <span className="text-pulse-text-gray text-xs uppercase tracking-widest">Online</span>
                </div>
              </>
            )}
          </div>

          {/* Feedback messages */}
          {success && (
            <div className="mb-4 text-pulse-green text-xs uppercase tracking-widest border border-pulse-green/30 px-4 py-3 text-center">
              {success}
            </div>
          )}
          {error && (
            <div className="mb-4 text-pulse-red text-xs uppercase tracking-widest border border-pulse-red/30 px-4 py-3">
              {error}
            </div>
          )}

          {/* Profile form */}
          <div className="border border-pulse-dark-border bg-pulse-dark-bg">
            <div className="flex items-center justify-between px-6 py-4 border-b border-pulse-dark-border">
              <span className="text-[10px] uppercase tracking-widest text-pulse-text-gray">
                Profile Info
              </span>
              {editing ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setEditing(false);
                      setForm({ name: user?.name || "", bio: user?.bio || "" });
                      setAvatarFile(null);
                      setAvatarPreview("");
                    }}
                    className="text-pulse-text-gray hover:text-white transition-colors"
                  >
                    <RiCloseLine />
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="text-white hover:text-pulse-green transition-colors disabled:opacity-50"
                  >
                    <RiCheckLine />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="text-pulse-text-gray hover:text-white transition-colors"
                >
                  <RiEditLine />
                </button>
              )}
            </div>

            <div className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-pulse-text-gray mb-2">
                  Name
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    className="pulse-input"
                    maxLength={50}
                  />
                ) : (
                  <p className="text-white text-sm">{user?.name || "—"}</p>
                )}
              </div>

              {/* Email (read-only) */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-pulse-text-gray mb-2">
                  Email
                </label>
                <p className="text-pulse-text-gray text-sm">{user?.email}</p>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-pulse-text-gray mb-2">
                  Bio
                </label>
                {editing ? (
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                    rows={3}
                    maxLength={160}
                    placeholder="Tell people about yourself..."
                    className="pulse-input resize-none"
                  />
                ) : (
                  <p className="text-white text-sm">
                    {user?.bio || <span className="text-pulse-text-gray italic">No bio yet</span>}
                  </p>
                )}
              </div>

              {/* Member since */}
              <div>
                <label className="block text-[10px] uppercase tracking-widest text-pulse-text-gray mb-2">
                  Member Since
                </label>
                <p className="text-white text-sm">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString([], {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "—"}
                </p>
              </div>
            </div>

            {editing && (
              <div className="px-6 pb-6">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full py-3 bg-white text-pulse-black font-black uppercase tracking-widest text-xs hover:bg-pulse-hover-gray transition-all disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>

          {/* Danger zone */}
          <div className="mt-6 border border-pulse-dark-border bg-pulse-dark-bg">
            <div className="px-6 py-4">
              <p className="text-[10px] uppercase tracking-widest text-pulse-text-gray mb-4">
                Account
              </p>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-pulse-red text-xs uppercase tracking-widest hover:underline"
              >
                <RiLogoutBoxLine />
                Sign Out
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
