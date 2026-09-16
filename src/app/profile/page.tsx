"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  CheckCircle2,
  Mail,
  Shield,
  User,
  CalendarDays,
  KeyRound,
} from "lucide-react";
import { toast } from "sonner";
import { getApiErrorStatus } from "@/lib/api";
import api from "@/lib/api";
import { formatRole } from "@/lib/permissions";
import Navbar from "@/components/Navbar";

// type UserData = {
//   id: string;
//   name: string;
//   email: string;
//   organization_id: string;
//   role: string;
// };

type UserData = {
  id: string;
  name: string;
  email: string;
  organization_id: string;
  organization_name: string;
  role: string;
};

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProfile = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await api.get("/auth/me");
        setUser(response.data);
      } catch (error: unknown) {
        console.error("Profile error:", error);

        if (getApiErrorStatus(error) === 401) {
          localStorage.removeItem("access_token");
          router.push("/login");
          return;
        }

        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen w-full overflow-x-hidden bg-slate-50">
        <Navbar />

        <div className="flex min-h-[70vh] w-full items-center justify-center px-4">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />

            <p className="mt-3 text-sm text-slate-500">
              Loading profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const initials = user.name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div>
      <Navbar />
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-50">


      <main className="mx-auto w-full max-w-[1600px] px-4 py-8 sm:px-6 lg:px-10 xl:px-12 2xl:px-16">
        {/* Page Heading */}
        <div className="mb-8">
          <p className="text-sm font-medium text-blue-600">
            Account
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            My Profile
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            View your account and workspace information.
          </p>
        </div>

{/* Profile Header */}
<section className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
  <div className="px-5 py-6 sm:px-8 sm:py-8">
    <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
      
      {/* Profile Info */}
      <div className="flex min-w-0 items-center gap-5">
        
        {/* Default Profile Avatar */}
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-100 shadow-sm sm:h-24 sm:w-24">
          <User className="h-10 w-10 text-slate-400 sm:h-12 sm:w-12" />
        </div>

        {/* Name & Email */}
        <div className="min-w-0">
          <h2 className="break-words text-xl font-bold text-slate-900 sm:text-2xl">
            {user.name}
          </h2>

          <div className="mt-2 flex min-w-0 items-center gap-2 text-sm text-slate-500">
            <Mail className="h-4 w-4 shrink-0" />
            <span className="break-all">
              {user.email}
            </span>
          </div>
        </div>
      </div>

      {/* Role */}
      <div className="shrink-0">
        <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">
          <Shield className="h-4 w-4 shrink-0" />
          {formatRole(user.role)}
        </span>
      </div>

    </div>
  </div>
</section>



        {/* Account Information */}
        <section className="mt-6 w-full rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
              <User className="h-5 w-5 text-slate-700" />
            </div>

            <div className="min-w-0">
              <h2 className="font-semibold text-slate-900">
                Account Information
              </h2>

              <p className="text-xs text-slate-500">
                Your basic account details
              </p>
            </div>
          </div>

          <div className="mt-6 grid w-full gap-5 sm:grid-cols-2">
            {/* Name */}
            <div className="min-w-0 rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 shrink-0 text-slate-500" />

                <div className="min-w-0">
                  <p className="text-xs text-slate-500">
                    Full Name
                  </p>

                  <p className="mt-1 truncate text-sm font-semibold text-slate-900">
                    {user.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="min-w-0 rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-slate-500" />

                <div className="min-w-0">
                  <p className="text-xs text-slate-500">
                    Email Address
                  </p>

                  <p className="mt-1 truncate text-sm font-semibold text-slate-900">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Role */}
            <div className="min-w-0 rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <Shield className="h-4 w-4 shrink-0 text-slate-500" />

                <div className="min-w-0">
                  <p className="text-xs text-slate-500">
                    Workspace Role
                  </p>

                  <p className="mt-1 truncate text-sm font-semibold text-slate-900">
                    {formatRole(user.role)}
                  </p>
                </div>
              </div>
            </div>

            {/* Organization */}
            <div className="min-w-0 rounded-xl border border-slate-200 p-4">
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4 shrink-0 text-slate-500" />

                <div className="min-w-0">
                  <p className="text-xs text-slate-500">
                    Organization
                  </p>

                  <p className="mt-1 break-all text-xs font-semibold text-slate-900">
                    {user.organization_name}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
    </div>
  );
}
