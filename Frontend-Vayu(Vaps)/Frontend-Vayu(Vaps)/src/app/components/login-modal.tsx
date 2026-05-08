import { X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToSignup: () => void;
}

export function LoginModal({ isOpen, onClose, onSwitchToSignup }: LoginModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (!isOpen) return null;

  const handleLogin = async (e: any) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await res.json();
      console.log("Login Response:", data);

      if (res.ok) {
        // 🔥 TOKEN SAVE
        localStorage.setItem("token", data.token);

        alert(data.message || "Login successful ✅");
        onClose();
      } else {
        alert(data.message || "Login failed ❌");
      }

    } catch (err) {
      console.error(err);
      alert("Server error ❌");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      {/* Background */}
      <div className="absolute inset-0 backdrop-blur-[25px] bg-black/30" />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="relative backdrop-blur-[15px] bg-white/20 border border-white/30 rounded-3xl p-8 max-w-md w-full shadow-2xl"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20"
        >
          <X className="w-6 h-6 text-[#333333] dark:text-white" />
        </button>

        <h2 className="text-3xl font-semibold mb-2 text-[#333333] dark:text-white">
          Welcome Back
        </h2>

        <p className="text-sm text-[#333333]/70 dark:text-white/70 mb-6">
          Log in to your account
        </p>

        {/* FORM */}
        <form className="space-y-4" onSubmit={handleLogin}>
          
          {/* EMAIL */}
          <div>
            <label className="block text-sm mb-2 text-[#333333] dark:text-white">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#FFFBEB]/40 border border-white/30 text-[#333333] dark:text-white"
              placeholder="you@example.com"
              required
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm mb-2 text-[#333333] dark:text-white">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#FFFBEB]/40 border border-white/30 text-[#333333] dark:text-white"
              placeholder="••••••••"
              required
            />
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#A5C7E9] to-[#F4D7DA] text-white font-semibold hover:shadow-lg transition-all"
          >
            LOG IN
          </button>
        </form>

        {/* SWITCH */}
        <p className="text-center text-sm mt-6 text-[#333333]/70 dark:text-white/70">
          Don't have an account?{" "}
          <button
            onClick={onSwitchToSignup}
            className="text-[#A5C7E9] font-semibold hover:underline"
          >
            Sign Up
          </button>
        </p>
      </motion.div>
    </div>
  );
}