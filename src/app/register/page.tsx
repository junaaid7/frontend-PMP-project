"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
User,
Mail,
Lock,
Building2,
Eye,
EyeOff,
} from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api";
import api from "@/lib/api";

export default function RegisterPage() {
const router = useRouter();

const [name, setName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [organizationName, setOrganizationName] = useState("");

const [showPassword, setShowPassword] = useState(false);
const [loading, setLoading] = useState(false);

const handleSubmit = async (
e: React.FormEvent<HTMLFormElement>
) => {
e.preventDefault();

// Name validation
if (!name.trim()) {
  toast.error("Full name is required");
  return;
}

if (name.trim().length < 2) {
  toast.error("Name must be at least 2 characters");
  return;
}

// Organization validation
if (!organizationName.trim()) {
  toast.error("Organization name is required");
  return;
}

if (organizationName.trim().length < 2) {
  toast.error(
    "Organization name must be at least 2 characters"
  );
  return;
}

// Email validation
if (!email.trim()) {
  toast.error("Email is required");
  return;
}

if (!email.includes("@")) {
  toast.error("Please enter a valid email");
  return;
}

// Password validation
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

  // Send registration request to FastAPI
  await api.post("/auth/register", {
    name: name.trim(),
    email: email.trim(),
    password,
    organization_name: organizationName.trim(),
  });

  toast.success("Account created successfully!");

  // Go to login after successful registration
  router.push("/login");
} catch (error: unknown) {
  const message = getApiErrorMessage(
    error,
    "Registration failed. Please try again.",
  );

  toast.error(message);
} finally {
  setLoading(false);
}

};

return ( <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-white to-blue-50/50 p-4">

  <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-blue-100/50 border border-slate-200/60 p-8">

    <h1 className="text-2xl font-bold text-slate-900 text-center">
      Create Account
    </h1>

    <p className="text-sm text-slate-500 text-center mt-1">
      Start your professional journey
    </p>

    <form onSubmit={handleSubmit} className="mt-6 space-y-5">

      {/* Name */}
      <div>
        <label className="text-sm font-medium text-slate-700">
          Full Name
        </label>

        <div className="relative mt-1.5">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />

          <input
            type="text"
            placeholder="Junaid Ali Khan"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
          />
        </div>
      </div>

      {/* Organization */}
      <div>
        <label className="text-sm font-medium text-slate-700">
          Organization Name
        </label>

        <div className="relative mt-1.5">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />

          <input
            type="text"
            placeholder="JAK Brand"
            value={organizationName}
            onChange={(e) =>
              setOrganizationName(e.target.value)
            }
            className="w-full pl-10 pr-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="text-sm font-medium text-slate-700">
          Email
        </label>

        <div className="relative mt-1.5">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />

          <input
            type="email"
            placeholder="JAK@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label className="text-sm font-medium text-slate-700">
          Password
        </label>

        <div className="relative mt-1.5">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Your Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
          />

          <button
            type="button"
            onClick={() =>
              setShowPassword(!showPassword)
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Create Account */}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 text-sm font-semibold text-white bg-linear-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-200 transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? "Creating..." : "Create Account"}
      </button>

      {/* Login Link */}
      <div className="text-center pt-1">
        <p className="text-sm text-slate-600">
          Already have an account?{" "}

          <Link
            href="/login"
            className="font-semibold text-blue-600 hover:text-blue-700 hover:underline"
          >
            Login
          </Link>
        </p>
      </div>

    </form>
  </div>
</div>

);
}
