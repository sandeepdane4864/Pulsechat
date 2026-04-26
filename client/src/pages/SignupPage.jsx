import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { registerUser } from "../services/api";

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      return setError("Passwords do not match");
    }
    if (form.password.length < 6) {
      return setError("Password must be at least 6 characters");
    }
    setLoading(true);
    try {
      const { data } = await registerUser({
        name: form.name,
        email: form.email,
        password: form.password,
      });
      login(data);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pulse-black flex">
      {/* Left panel */}
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex flex-col justify-between w-1/2 p-16 bg-pulse-dark-bg border-r border-pulse-dark-border"
      >
        <div>
          <span className="text-white font-black uppercase tracking-widest text-lg">
            PULSE<span className="text-pulse-text-gray">CHAT</span>
          </span>
        </div>
        <div>
          <h1 className="text-6xl font-black uppercase leading-none text-white mb-6">
            YOUR
            <br />
            VOICE.
            <br />
            <span className="text-pulse-text-gray">AMPLIFIED.</span>
          </h1>
          <p className="text-pulse-text-gray text-sm tracking-wide max-w-xs">
            Join thousands already chatting in real-time. Create rooms, go private, share media.
          </p>
        </div>
        <div className="text-pulse-text-gray text-xs uppercase tracking-widest">
          © 2024 PulseChat
        </div>
      </motion.div>

      {/* Right panel */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24"
      >
        <div className="w-full max-w-sm mx-auto">
          <div className="lg:hidden mb-12">
            <span className="text-white font-black uppercase tracking-widest text-lg">
              PULSE<span className="text-pulse-text-gray">CHAT</span>
            </span>
          </div>

          <h2 className="text-3xl font-black uppercase tracking-tight text-white mb-2">
            CREATE ACCOUNT
          </h2>
          <p className="text-pulse-text-gray text-sm mb-10 tracking-wide">
            Free forever. No credit card.
          </p>

          {error && (
            <div className="mb-6 text-pulse-red text-xs uppercase tracking-widest border border-pulse-red/30 px-4 py-3">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-pulse-text-gray mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                className="pulse-input"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-pulse-text-gray mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="pulse-input"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-pulse-text-gray mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Min. 6 characters"
                className="pulse-input"
                required
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-pulse-text-gray mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirm"
                value={form.confirm}
                onChange={handleChange}
                placeholder="••••••••"
                className="pulse-input"
                required
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-white text-pulse-black font-black uppercase tracking-widest text-sm transition-all duration-200 hover:bg-pulse-hover-gray active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "CREATING..." : "CREATE ACCOUNT"}
              </button>
            </div>
          </form>

          <p className="mt-8 text-pulse-text-gray text-sm">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-white font-bold uppercase tracking-widest text-xs hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
