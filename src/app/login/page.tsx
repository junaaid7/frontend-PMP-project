"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api";
import api from "@/lib/api";

export default function LoginPage() {
const router = useRouter();

const [email, setEmail] = useState("");
const [password, setPassword] = useState("");

const [showPassword, setShowPassword] = useState(false);
const [loading, setLoading] = useState(false);

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
e.preventDefault();
// Frontend validation
if (!email.trim()) {
  toast.error("Email is required");
  return;
}

if (!email.includes("@")) {
  toast.error("Please enter a valid email");
  return;
}

if (!password) {
  toast.error("Password is required");
  return;
}

if (password.length < 6) {
  toast.error("Password must be at least 6 characters");
  return;
}

try {
  setLoading(true);

  // Send login request to FastAPI
  const response = await api.post("/auth/login", {
    email,
    password,
  });

  // Get JWT token from backend response
  const { access_token } = response.data;

  // Save token for later protected API requests
  localStorage.setItem("access_token", access_token);

  toast.success("Login successful!");

  // Move user to dashboard
  router.push("/dashboard");
} catch (error: unknown) {
  const message = getApiErrorMessage(
    error,
    "Login failed. Please try again.",
  );

  toast.error(message);
} finally {
  setLoading(false);
}

};

return ( <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-white to-blue-50/50 p-4">

  <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-blue-100/50 border border-slate-200/60 p-8">

    <h1 className="text-2xl font-bold text-slate-900 text-center">
      Welcome Back
    </h1>

    <p className="text-sm text-slate-500 text-center mt-1">
      Sign in to your account
    </p>

    <form onSubmit={handleSubmit} className="mt-6 space-y-5">

      {/* Email */}
      <div>
        <label className="text-sm font-medium text-slate-700">
          Email
        </label>

        <div className="relative mt-1.5">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />

          <input
            type="email"
            placeholder="junaid@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-slate-700">
            Password
          </label>

          <Link
            href="/forgot-password"
            className="text-sm text-blue-600 hover:underline"
          >
            Forgot password?
          </Link>
        </div>

        <div className="relative mt-1.5">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none"
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 cursor-pointer -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Login Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 cursor-pointer text-sm font-semibold text-white bg-linear-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-200 transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? "Signing in..." : "Login"}
      </button>

      {/* Register */}
      <div className="text-center pt-1">
        <p className="text-sm text-slate-600">
          Do not have an account?{" "}

          <Link
            href="/register"
            className="font-semibold text-blue-600 hover:underline"
          >
            Create Account
          </Link>
        </p>
      </div>

    </form>
  </div>
</div>
);
}