import { X } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export function SignupModal({ isOpen, onClose, onSwitchToLogin }: SignupModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  if (!isOpen) return null;

  // ✅ HANDLE SUBMIT
  const handleSignup = async (e: any) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
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
      console.log("Signup Response:", data);

      alert(data.message || "Signup done ✅");

      // optional reset
      setEmail("");
      setPassword("");
      setName("");

      onClose(); // modal close
    } catch (err) {
      console.error(err);
      alert("Signup failed ❌");
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
          Create Your Account
        </h2>

        <p className="text-sm text-[#333333]/70 dark:text-white/70 mb-6">
          Join VAYU to track air quality
        </p>

        {/* FORM */}
        <form className="space-y-4" onSubmit={handleSignup}>
          {/* NAME */}
          <div>
            <label className="block text-sm mb-2">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#FFFBEB]/40 border"
              placeholder="John Doe"
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="block text-sm mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#FFFBEB]/40 border"
              placeholder="you@example.com"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#FFFBEB]/40 border"
              placeholder="••••••"
            />
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#A5C7E9] to-[#F4D7DA] text-white font-semibold"
          >
            CREATE ACCOUNT
          </button>
        </form>

        {/* SWITCH */}
        <p className="text-center text-sm mt-6">
          Already have an account?{" "}
          <button
            onClick={onSwitchToLogin}
            className="text-blue-400 font-semibold"
          >
            Log In
          </button>
        </p>
      </motion.div>
    </div>
  );
}