"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  Circle,
  Clock3,
  FolderKanban,
  ListTodo,
  Plus,
  Shield,
  Sparkles,
  Users,
  AlertCircle,
} from "lucide-react";
import { Toaster, toast } from "sonner";
import api from "@/lib/api";
import { formatRole } from "@/lib/permissions";
import Navbar from "@/components/Navbar";

type UserData = {
  id: string;
  name: string;
  email: string;
  organization_id: string;
  role: string;
};

type Project = {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
};

type TaskStatus = "todo" | "in_progress" | "done";

type Task = {
  id: string;
  organization_id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
};

export default function DashboardPage() {
  const router = useRouter();

  const [user, setUser] = useState<UserData | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const [userResponse, projectsResponse, tasksResponse] =
          await Promise.all([
            api.get("/auth/me"),
            api.get("/projects/"),
            api.get("/tasks/"),
          ]);

        setUser(userResponse.data);
        setProjects(projectsResponse.data);
        setTasks(tasksResponse.data);
      } catch (error: any) {
        console.error("Dashboard error:", error);

        const statusCode = error?.response?.status;

        if (statusCode === 401) {
          localStorage.removeItem("access_token");
          router.push("/login");
          return;
        }

        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [router]);

  const stats = useMemo(() => {
    const todo = tasks.filter(
      (task) => task.status === "todo"
    ).length;

    const inProgress = tasks.filter(
      (task) => task.status === "in_progress"
    ).length;

    const completed = tasks.filter(
      (task) => task.status === "done"
    ).length;

    return {
      projects: projects.length,
      tasks: tasks.length,
      todo,
      inProgress,
      completed,
    };
  }, [projects, tasks]);

  const getProjectName = (projectId: string) => {
    const project = projects.find(
      (item) => item.id === projectId
    );

    return project?.name || "Unknown Project";
  };

  const getStatusLabel = (status: TaskStatus) => {
    if (status === "in_progress") {
      return "In Progress";
    }

    if (status === "done") {
      return "Completed";
    }

    return "To Do";
  };

  const getStatusIcon = (status: TaskStatus) => {
    if (status === "done") {
      return (
        <CheckCircle2 className="h-4 w-4 text-green-600" />
      );
    }

    if (status === "in_progress") {
      return (
        <Clock3 className="h-4 w-4 text-blue-600" />
      );
    }

    return (
      <Circle className="h-4 w-4 text-slate-400" />
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />

            <p className="mt-3 text-sm text-slate-500">
              Loading dashboard...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Toaster position="top-right" />

      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <section className="rounded-2xl bg-slate-900 p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-slate-300">
                <Sparkles className="h-3.5 w-3.5" />
                AI Project Workspace
              </div>

              <h1 className="text-2xl font-bold text-white sm:text-3xl">
                Welcome back, {user.name}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                Manage your projects, track tasks and keep your team
                moving forward.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                <FolderKanban className="h-4 w-4" />
                Projects
              </Link>

              <Link
                href="/tasks"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <ListTodo className="h-4 w-4" />
                Tasks
              </Link>
            </div>
          </div>
        </section>

        {/* User Role */}
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Current Workspace Role
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {formatRole(user.role)}
                </p>
              </div>
            </div>

            <Link
              href="/profile"
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              View Profile
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* Stats */}
        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {/* Projects */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
                <FolderKanban className="h-5 w-5 text-purple-600" />
              </div>

              <span className="text-xs text-slate-400">
                Workspace
              </span>
            </div>

            <p className="mt-4 text-2xl font-bold text-slate-900">
              {stats.projects}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Projects
            </p>
          </div>

          {/* Total Tasks */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                <ListTodo className="h-5 w-5 text-blue-600" />
              </div>

              <span className="text-xs text-slate-400">
                Total
              </span>
            </div>

            <p className="mt-4 text-2xl font-bold text-slate-900">
              {stats.tasks}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Total Tasks
            </p>
          </div>

          {/* Todo */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
                <Circle className="h-5 w-5 text-slate-500" />
              </div>

              <span className="text-xs text-slate-400">
                Pending
              </span>
            </div>

            <p className="mt-4 text-2xl font-bold text-slate-900">
              {stats.todo}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              To Do
            </p>
          </div>

          {/* In Progress */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                <Clock3 className="h-5 w-5 text-blue-600" />
              </div>

              <span className="text-xs text-slate-400">
                Active
              </span>
            </div>

            <p className="mt-4 text-2xl font-bold text-slate-900">
              {stats.inProgress}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              In Progress
            </p>
          </div>

          {/* Completed */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>

              <span className="text-xs text-slate-400">
                Finished
              </span>
            </div>

            <p className="mt-4 text-2xl font-bold text-slate-900">
              {stats.completed}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Completed
            </p>
          </div>
        </section>

        {/* Main Grid */}
        <section className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Projects */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm lg:col-span-2">
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Your Projects
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Projects in your organization
                </p>
              </div>

              <Link
                href="/projects"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                View all
              </Link>
            </div>

            <div className="p-5">
              {projects.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
                  <FolderKanban className="mx-auto h-8 w-8 text-slate-400" />

                  <h3 className="mt-3 text-sm font-semibold text-slate-900">
                    No projects yet
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Create your first project to get started.
                  </p>

                  <Link
                    href="/projects"
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                  >
                    <Plus className="h-4 w-4" />
                    Create Project
                  </Link>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {projects.slice(0, 6).map((project) => {
                    const projectTasks = tasks.filter(
                      (task) => task.project_id === project.id
                    );

                    const completedTasks = projectTasks.filter(
                      (task) => task.status === "done"
                    ).length;

                    return (
                      <Link
                        key={project.id}
                        href={`/projects/${project.id}`}
                        className="group rounded-xl border border-slate-200 p-4 transition hover:border-slate-300 hover:shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                            <FolderKanban className="h-4 w-4 text-slate-700" />
                          </div>

                          <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:text-slate-600" />
                        </div>

                        <h3 className="mt-4 truncate text-sm font-semibold text-slate-900">
                          {project.name}
                        </h3>

                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                          {project.description ||
                            "No project description available."}
                        </p>

                        <div className="mt-4 flex items-center justify-between text-xs">
                          <span className="text-slate-500">
                            {projectTasks.length} tasks
                          </span>

                          <span className="font-medium text-green-600">
                            {completedTasks} completed
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Workspace */}
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 p-5">
              <h2 className="font-semibold text-slate-900">
                Workspace
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Organization information
              </p>
            </div>

            <div className="space-y-5 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50">
                  <Building2 className="h-4 w-4 text-purple-600" />
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-slate-500">
                    Organization ID
                  </p>

                  <p className="mt-1 break-all font-mono text-[11px] font-medium text-slate-800">
                    {user.organization_id}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Team
                  </p>

                  <Link
                    href="/team"
                    className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-slate-900 hover:text-blue-600"
                  >
                    Manage Members
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-50">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Security
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-900">
                    Tenant Isolated
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* Quick Actions */}
        <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/projects"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
                <FolderKanban className="h-5 w-5 text-purple-600" />
              </div>

              <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-600" />
            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-900">
              Manage Projects
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Create, view and manage your organization projects.
            </p>
          </Link>

          <Link
            href="/tasks"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                <ListTodo className="h-5 w-5 text-blue-600" />
              </div>

              <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-600" />
            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-900">
              Manage Tasks
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Create tasks, update status and track project progress.
            </p>
          </Link>

          <Link
            href="/team"
            className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
                <Users className="h-5 w-5 text-green-600" />
              </div>

              <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-600" />
            </div>

            <h3 className="mt-4 text-sm font-bold text-slate-900">
              Team Members
            </h3>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              View your organization members and their roles.
            </p>
          </Link>
        </section>
      </main>
    </div>
  );
}