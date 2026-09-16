// "use client";

// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { usePathname, useRouter } from "next/navigation";
// import {
//   BarChart3,
//   Bot,
//   CheckSquare,
//   ChevronDown,
//   LayoutDashboard,
//   LogOut,
//   Menu,
//   Shield,
//   User,
//   Users,
//   X,
// } from "lucide-react";
// import { toast } from "sonner";
// import api from "@/lib/api";
// import { formatRole } from "@/lib/permissions";

// type UserData = {
//   id: string;
//   name: string;
//   email: string;
//   organization_id: string;
//   role: string;
// };

// const navItems = [
//   {
//     name: "Dashboard",
//     href: "/dashboard",
//     icon: LayoutDashboard,
//   },
//   {
//     name: "Projects",
//     href: "/projects",
//     icon: BarChart3,
//   },
//   {
//     name: "Tasks",
//     href: "/tasks",
//     icon: CheckSquare,
//   },
//   {
//     name: "Team",
//     href: "/team",
//     icon: Users,
//   },
// {
//   name: "AI Assistant",
//   href: "/ai",
//   icon: Bot,
// },
//   {
//     name: "Profile",
//     href: "/profile",
//     icon: User,
//   },
// ];

// export default function Navbar() {
//   const router = useRouter();
//   const pathname = usePathname();

//   const [user, setUser] = useState<UserData | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [mobileOpen, setMobileOpen] = useState(false);
//   const [profileOpen, setProfileOpen] = useState(false);

//   useEffect(() => {
//     const getCurrentUser = async () => {
//       const token = localStorage.getItem("access_token");

//       if (!token) {
//         setLoading(false);
//         return;
//       }

//       try {
//         const response = await api.get("/auth/me");
//         setUser(response.data);
//       } catch (error: any) {
//         console.error("Navbar user error:", error);

//         if (error?.response?.status === 401) {
//           localStorage.removeItem("access_token");
//           router.push("/login");
//         }
//       } finally {
//         setLoading(false);
//       }
//     };

//     getCurrentUser();
//   }, [router]);

//   const handleLogout = () => {
//     localStorage.removeItem("access_token");

//     toast.success("Logged out successfully");

//     setTimeout(() => {
//       router.push("/login");
//     }, 300);
//   };

//   const isActive = (href: string) => {
//     if (href === "/dashboard") {
//       return pathname === "/dashboard";
//     }

//     return pathname.startsWith(href);
//   };

//   return (
//     <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
//       <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
//         <div className="flex h-16 items-center justify-between">
          
//           {/* Logo */}
//           <Link
//             href="/dashboard"
//             className="flex items-center gap-3"
//             onClick={() => setMobileOpen(false)}
//           >
//             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900">
//               <BarChart3 className="h-5 w-5 text-white" />
//             </div>

//             <div className="hidden sm:block">
//               <p className="text-sm font-bold text-slate-900">
//                 PMP 
//               </p>
//               <p className="text-[11px] text-slate-500">
//                 AI Workspace
//               </p>
//             </div>
//           </Link>

//           {/* Desktop Navigation */}
//           <nav className="hidden items-center gap-1 md:flex">
//             {navItems.map((item) => {
//               const Icon = item.icon;
//               const active = isActive(item.href);

//               return (
//                 <Link
//                   key={item.href}
//                   href={item.href}
//                   className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
//                     active
//                       ? "bg-slate-900 text-white"
//                       : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
//                   }`}
//                 >
//                   <Icon className="h-4 w-4" />
//                   {item.name}
//                 </Link>
//               );
//             })}
//           </nav>

//           {/* Desktop User Menu */}
//           <div className="relative hidden md:block">
//             {loading ? (
//               <div className="h-9 w-32 animate-pulse rounded-lg bg-slate-100" />
//             ) : user ? (
//               <>
//                 <button
//                   onClick={() => setProfileOpen(!profileOpen)}
//                   className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-slate-100"
//                 >
//                   <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
//                     {user.name.charAt(0).toUpperCase()}
//                   </div>

//                   <div className="hidden text-left lg:block">
//                     <p className="max-w-28 truncate text-xs font-semibold text-slate-900">
//                       {user.name}
//                     </p>

//                     <p className="text-[11px] text-slate-500">
//                       {formatRole(user.role)}
//                     </p>
//                   </div>

//                   <ChevronDown className="h-4 w-4 text-slate-500" />
//                 </button>

//                 {profileOpen && (
//                   <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
//                     <div className="border-b border-slate-100 px-3 py-2">
//                       <p className="truncate text-sm font-semibold text-slate-900">
//                         {user.name}
//                       </p>

//                       <p className="truncate text-xs text-slate-500">
//                         {user.email}
//                       </p>
//                     </div>

//                     <Link
//                       href="/profile"
//                       onClick={() => setProfileOpen(false)}
//                       className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
//                     >
//                       <User className="h-4 w-4" />
//                       Profile
//                     </Link>

//                     <Link
//                       href="/team"
//                       onClick={() => setProfileOpen(false)}
//                       className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
//                     >
//                       <Users className="h-4 w-4" />
//                       Team
//                     </Link>

//                     <button
//                       onClick={handleLogout}
//                       className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
//                     >
//                       <LogOut className="h-4 w-4" />
//                       Logout
//                     </button>
//                   </div>
//                 )}
//               </>
//             ) : (
//               <Link
//                 href="/login"
//                 className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
//               >
//                 Login
//               </Link>
//             )}
//           </div>

//           {/* Mobile Button */}
//           <button
//             onClick={() => setMobileOpen(!mobileOpen)}
//             className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
//             aria-label="Toggle menu"
//           >
//             {mobileOpen ? (
//               <X className="h-6 w-6" />
//             ) : (
//               <Menu className="h-6 w-6" />
//             )}
//           </button>
//         </div>

//         {/* Mobile Navigation */}
//         {mobileOpen && (
//           <div className="border-t border-slate-100 py-3 md:hidden">
//             <nav className="space-y-1">
//               {navItems.map((item) => {
//                 const Icon = item.icon;
//                 const active = isActive(item.href);

//                 return (
//                   <Link
//                     key={item.href}
//                     href={item.href}
//                     onClick={() => setMobileOpen(false)}
//                     className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium ${
//                       active
//                         ? "bg-slate-900 text-white"
//                         : "text-slate-600 hover:bg-slate-100"
//                     }`}
//                   >
//                     <Icon className="h-5 w-5" />
//                     {item.name}
//                   </Link>
//                 );
//               })}

//               {user && (
//                 <>
//                   <div className="my-2 border-t border-slate-100" />

//                   <div className="flex items-center gap-3 px-3 py-2">
//                     <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
//                       {user.name.charAt(0).toUpperCase()}
//                     </div>

//                     <div className="min-w-0">
//                       <p className="truncate text-sm font-semibold text-slate-900">
//                         {user.name}
//                       </p>

//                       <p className="text-xs text-slate-500">
//                         {formatRole(user.role)}
//                       </p>
//                     </div>
//                   </div>

//                   <button
//                     onClick={handleLogout}
//                     className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
//                   >
//                     <LogOut className="h-5 w-5" />
//                     Logout
//                   </button>
//                 </>
//               )}

//               {!user && (
//                 <Link
//                   href="/login"
//                   onClick={() => setMobileOpen(false)}
//                   className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
//                 >
//                   <Shield className="h-5 w-5" />
//                   Login
//                 </Link>
//               )}
//             </nav>
//           </div>
//         )}
//       </div>
//     </header>
//   );
// }



"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BarChart3,
  Bot,
  CheckSquare,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  Shield,
  User,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { getApiErrorStatus } from "@/lib/api";
import api from "@/lib/api";
import { formatRole } from "@/lib/permissions";

type UserData = {
  id: string;
  name: string;
  email: string;
  organization_id: string;
  role: string;
};

const navItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Projects",
    href: "/projects",
    icon: BarChart3,
  },
  {
    name: "Tasks",
    href: "/tasks",
    icon: CheckSquare,
  },
  {
    name: "Team",
    href: "/team",
    icon: Users,
  },
  {
    name: "AI Assistant",
    href: "/ai",
    icon: Bot,
  },
  {
    name: "Profile",
    href: "/profile",
    icon: User,
  },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const getCurrentUser = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get("/auth/me");
        setUser(response.data);
      } catch (error: unknown) {
        console.error("Navbar user error:", error);

        if (getApiErrorStatus(error) === 401) {
          localStorage.removeItem("access_token");
          router.push("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    getCurrentUser();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");

    toast.success("Logged out successfully");

    setTimeout(() => {
      router.push("/login");
    }, 300);
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link
            href="/dashboard"
            className="flex items-center gap-3"
            onClick={() => setMobileOpen(false)}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>

            <div className="hidden sm:block">
              <p className="text-sm font-bold text-slate-900">
                PMP
              </p>
              <p className="text-[11px] text-slate-500">
                AI Workspace
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Desktop User Menu */}
          <div className="relative hidden md:block">
            {loading ? (
              <div className="h-9 w-32 animate-pulse rounded-lg bg-slate-100" />
            ) : user ? (
              <>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition hover:bg-slate-100"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="hidden text-left lg:block">
                    <p className="max-w-28 truncate text-xs font-semibold text-slate-900">
                      {user.name}
                    </p>

                    <p className="text-[11px] text-slate-500">
                      {formatRole(user.role)}
                    </p>
                  </div>

                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
                    <div className="border-b border-slate-100 px-3 py-2">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {user.name}
                      </p>

                      <p className="truncate text-xs text-slate-500">
                        {user.email}
                      </p>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>

                    <Link
                      href="/team"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
                    >
                      <Users className="h-4 w-4" />
                      Team
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileOpen && (
          <div className="border-t border-slate-100 py-3 md:hidden">
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium ${
                      active
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                );
              })}

              {user && (
                <>
                  <div className="my-2 border-t border-slate-100" />

                  <div className="flex items-center gap-3 px-3 py-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                      {user.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {user.name}
                      </p>

                      <p className="text-xs text-slate-500">
                        {formatRole(user.role)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </button>
                </>
              )}

              {!user && (
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-100"
                >
                  <Shield className="h-5 w-5" />
                  Login
                </Link>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}