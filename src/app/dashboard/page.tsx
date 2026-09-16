"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Circle,
  Clock3,
  FolderKanban,
  ListTodo,
  Loader2,
  Search,
  TrendingUp,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import Navbar from "@/components/Navbar";
import api from "@/lib/api";

type UserData = {
  id: string;
  name: string;
  email: string;
  organization_id: string;
  organization_name: string;
  role: string;
};

type Project = {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
};

type DashboardStats = {
  total_projects: number;
  total_tasks: number;
  todo_tasks: number;
  in_progress_tasks: number;
  completed_tasks: number;
};

type DashboardTask = {
  id: string;
  organization_id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: string;
};

type TaskResponse = {
  items: DashboardTask[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
};

const formatRole = (role: string) => {
  switch (role?.toLowerCase()) {
    case "owner":
      return "Owner";
    case "admin":
      return "Admin";
    case "manager":
      return "Manager";
    case "developer":
      return "Developer";
    case "viewer":
      return "Viewer";
    default:
      return role || "User";
  }
};

const formatStatus = (status: string) => {
  switch (status?.toLowerCase()) {
    case "todo":
      return "Todo";

    case "in_progress":
      return "In Progress";

    case "done":
      return "Completed";

    default:
      return status || "Unknown";
  }
};

const getStatusClasses = (status: string) => {
  switch (status?.toLowerCase()) {
    case "todo":
      return "bg-slate-100 text-slate-700";

    case "in_progress":
      return "bg-amber-100 text-amber-700";

    case "done":
      return "bg-green-100 text-green-700";

    default:
      return "bg-slate-100 text-slate-700";
  }
};

export default function DashboardPage() {
  const [user, setUser] = useState<UserData | null>(null);

  const [projects, setProjects] = useState<Project[]>([]);

  const [stats, setStats] = useState<DashboardStats>({
    total_projects: 0,
    total_tasks: 0,
    todo_tasks: 0,
    in_progress_tasks: 0,
    completed_tasks: 0,
  });

  const [tasks, setTasks] = useState<DashboardTask[]>([]);

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [statusFilter, setStatusFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);

  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);

  const [error, setError] = useState("");

  /*
   * ---------------------------------------------------------
   * GET CURRENT USER
   * ---------------------------------------------------------
   */
  const fetchUser = async () => {
    try {
      setLoadingUser(true);

      const response = await api.get("/auth/me");

      setUser(response.data);
    } catch (error) {
      console.error("Failed to load current user:", error);

      setError("Failed to load your account information.");
    } finally {
      setLoadingUser(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * GET PROJECTS
   * ---------------------------------------------------------
   */
  const fetchProjects = async () => {
    try {
      const response = await api.get("/projects/");

      setProjects(response.data);
    } catch (error) {
      console.error("Failed to load projects:", error);

      toast.error("Failed to load projects.");
    }
  };

  /*
   * ---------------------------------------------------------
   * GET DASHBOARD STATS
   * ---------------------------------------------------------
   */
  const fetchStats = async () => {
    try {
      setLoadingStats(true);

      const response = await api.get("/dashboard/stats");

      setStats(response.data);
    } catch (error) {
      console.error("Failed to load dashboard stats:", error);

      toast.error("Failed to load dashboard statistics.");
    } finally {
      setLoadingStats(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * GET DASHBOARD TASKS
   * ---------------------------------------------------------
   */
  const fetchTasks = async () => {
    try {
      setLoadingTasks(true);

      const params: Record<string, string | number> = {
        page,
        limit,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (statusFilter) {
        params.status = statusFilter;
      }

      if (projectFilter) {
        params.project_id = projectFilter;
      }

      const response = await api.get<TaskResponse>(
        "/dashboard/tasks",
        {
          params,
        }
      );

      setTasks(response.data.items || []);
      setTotalPages(response.data.total_pages || 1);
      setTotalTasks(response.data.total || 0);
    } catch (error) {
      console.error("Failed to load dashboard tasks:", error);

      toast.error("Failed to load tasks.");
      setTasks([]);
      setTotalPages(1);
      setTotalTasks(0);
    } finally {
      setLoadingTasks(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * INITIAL LOAD
   * ---------------------------------------------------------
   */
  useEffect(() => {
    const loadDashboard = async () => {
      await Promise.all([fetchUser(), fetchProjects(), fetchStats()]);
    };

    void loadDashboard();
  }, []);

  /*
   * ---------------------------------------------------------
   * TASKS LOAD
   * ---------------------------------------------------------
   *
   * Whenever search/filter/page changes,
   * dashboard tasks are loaded again.
   */
  useEffect(() => {
    const loadTasks = async () => {
      await fetchTasks();
    };

    void loadTasks();
  }, [search, statusFilter, projectFilter, page]);

  /*
   * ---------------------------------------------------------
   * GET PROJECT NAME
   * ---------------------------------------------------------
   */
  const getProjectName = (projectId: string) => {
    const project = projects.find(
      (item) => item.id === projectId
    );

    return project?.name || "Unknown Project";
  };

  /*
   * ---------------------------------------------------------
   * SEARCH
   * ---------------------------------------------------------
   */
  const handleSearch = () => {
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  /*
   * ---------------------------------------------------------
   * CLEAR FILTERS
   * ---------------------------------------------------------
   */
  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setStatusFilter("");
    setProjectFilter("");
    setPage(1);
  };

  /*
   * ---------------------------------------------------------
   * COMPLETION PERCENTAGE
   * ---------------------------------------------------------
   */
  const completionPercentage = useMemo(() => {
    if (stats.total_tasks === 0) {
      return 0;
    }

    return Math.round(
      (stats.completed_tasks / stats.total_tasks) * 100
    );
  }, [stats]);

  /*
   * ---------------------------------------------------------
   * SIMPLE PROJECT HEALTH
   * ---------------------------------------------------------
   */
  const projectHealth = useMemo(() => {
    if (stats.total_tasks === 0) {
      return {
        label: "No Tasks Yet",
        description:
          "Create some tasks to see project health.",
        icon: Circle,
        classes: "bg-slate-100 text-slate-600",
      };
    }

    if (completionPercentage >= 70) {
      return {
        label: "Healthy",
        description:
          "Most project tasks have been completed.",
        icon: CheckCircle2,
        classes: "bg-green-100 text-green-700",
      };
    }

    if (completionPercentage >= 40) {
      return {
        label: "In Progress",
        description:
          "The project is progressing but still has pending work.",
        icon: Clock3,
        classes: "bg-amber-100 text-amber-700",
      };
    }

    return {
      label: "Needs Attention",
      description:
        "Many tasks are still pending. Review the workload.",
      icon: AlertCircle,
      classes: "bg-red-100 text-red-700",
    };
  }, [stats, completionPercentage]);

  const HealthIcon = projectHealth.icon;

  /*
   * ---------------------------------------------------------
   * LOADING USER
   * ---------------------------------------------------------
   */
  if (loadingUser) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar />

        <div className="flex min-h-[70vh] items-center justify-center px-4">
          <div className="flex items-center gap-3 text-slate-600">
            <Loader2
              size={22}
              className="animate-spin"
            />

            <span className="text-sm">
              Loading dashboard...
            </span>
          </div>
        </div>
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * MAIN UI
   * ---------------------------------------------------------
   */
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* -------------------------------------------------- */}
        {/* HEADER */}
        {/* -------------------------------------------------- */}

        <section className="mb-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-500">
                Dashboard
              </p>

              <h1 className="mt-1 break-words text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Welcome, {user?.name || "User"}
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Manage your projects, tasks and team activity
                from one place.
              </p>
            </div>

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <Link
                href="/projects"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                <FolderKanban size={17} />
                Projects
              </Link>

              <Link
                href="/tasks"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <ListTodo size={17} />
                Tasks
              </Link>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------- */}
        {/* ERROR */}
        {/* -------------------------------------------------- */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex gap-3">
              <XCircle
                size={20}
                className="mt-0.5 shrink-0 text-red-600"
              />

              <div>
                <p className="text-sm font-semibold text-red-800">
                  Dashboard Error
                </p>

                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* -------------------------------------------------- */}
        {/* USER / ORGANIZATION INFO */}
        {/* -------------------------------------------------- */}

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Organization
            </p>

            <p className="mt-2 truncate text-base font-semibold text-slate-900">
              {user?.organization_name ||
                "Unknown Organization"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Your Role
            </p>

            <p className="mt-2 text-base font-semibold text-slate-900">
              {formatRole(user?.role || "")}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Task Completion
            </p>

            <div className="mt-2 flex items-center gap-3">
              <p className="text-base font-semibold text-slate-900">
                {completionPercentage}%
              </p>

              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-slate-900 transition-all duration-500"
                  style={{
                    width: `${completionPercentage}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* -------------------------------------------------- */}
        {/* STAT CARDS */}
        {/* -------------------------------------------------- */}

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {/* Projects */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-slate-100 p-2.5">
                <FolderKanban
                  size={20}
                  className="text-slate-700"
                />
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Total Projects
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {loadingStats ? "—" : stats.total_projects}
            </p>
          </div>

          {/* Tasks */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-slate-100 p-2.5">
                <ListTodo
                  size={20}
                  className="text-slate-700"
                />
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Total Tasks
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {loadingStats ? "—" : stats.total_tasks}
            </p>
          </div>

          {/* Todo */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-slate-100 p-2.5">
                <Circle
                  size={20}
                  className="text-slate-700"
                />
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Todo
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {loadingStats ? "—" : stats.todo_tasks}
            </p>
          </div>

          {/* In Progress */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-slate-100 p-2.5">
                <Clock3
                  size={20}
                  className="text-slate-700"
                />
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-500">
              In Progress
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {loadingStats
                ? "—"
                : stats.in_progress_tasks}
            </p>
          </div>

          {/* Completed */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-slate-100 p-2.5">
                <CheckCircle2
                  size={20}
                  className="text-slate-700"
                />
              </div>
            </div>

            <p className="mt-4 text-sm text-slate-500">
              Completed
            </p>

            <p className="mt-1 text-2xl font-bold text-slate-900">
              {loadingStats
                ? "—"
                : stats.completed_tasks}
            </p>
          </div>
        </section>


        {/* --------------------------------------------------
        {/* HEALTH + QUICK ACTIONS */}
        {/* -------------------------------------------------- */}


        {/* <section className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3"> */}
          {/* Health */}
          {/* <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Project Health
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-900">
                  {projectHealth.label}
                </h2>
              </div>

              <div
                className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${projectHealth.classes}`}
              >
                <HealthIcon size={16} />
                {projectHealth.label}
              </div>
            </div>

            <p className="mt-4 text-sm leading-6 text-slate-500">
              {projectHealth.description}
            </p>

            <div className="mt-6">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-slate-500">
                  Overall completion
                </span>

                <span className="font-semibold text-slate-900">
                  {completionPercentage}%
                </span>
              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-slate-900 transition-all duration-500"
                  style={{
                    width: `${completionPercentage}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          {/* <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Quick Actions
            </p>

            <div className="mt-4 grid grid-cols-1 gap-3">
              <Link
                href="/projects"
                className="rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50"
              >
                <p className="text-sm font-semibold text-slate-900">
                  Manage Projects
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Create and manage your projects.
                </p>
              </Link>

              <Link
                href="/tasks"
                className="rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50"
              >
                <p className="text-sm font-semibold text-slate-900">
                  Manage Tasks
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  View and update your tasks.
                </p>
              </Link>

              <Link
                href="/ai"
                className="rounded-xl border border-slate-200 p-4 transition hover:bg-slate-50"
              >
                <p className="text-sm font-semibold text-slate-900">
                  AI Assistant
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Use AI tools for project management.
                </p>
              </Link>
            </div>
          </div>
        </section>  */}

        {/* -------------------------------------------------- */}
        {/* TASK SEARCH + FILTER */}
        {/* -------------------------------------------------- */}

        <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <p className="text-sm font-medium text-slate-500">
              Task Management
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900">
              Search & Filter Tasks
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_180px_220px_auto]">
            {/* Search */}
            <div className="relative">
              <Search
                size={18}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={searchInput}
                onChange={(event) =>
                  setSearchInput(event.target.value)
                }
                onKeyDown={handleSearchKeyDown}
                placeholder="Search tasks..."
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            {/* Status */}
            <select
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-500"
            >
              <option value="">All Statuses</option>
              <option value="todo">Todo</option>
              <option value="in_progress">
                In Progress
              </option>
              <option value="done">Completed</option>
            </select>

            {/* Project */}
            <select
              value={projectFilter}
              onChange={(event) => {
                setProjectFilter(event.target.value);
                setPage(1);
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-500"
            >
              <option value="">All Projects</option>

              {projects.map((project) => (
                <option
                  key={project.id}
                  value={project.id}
                >
                  {project.name}
                </option>
              ))}
            </select>

            {/* Search button */}
            <button
              onClick={handleSearch}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <Search size={17} />
              Search
            </button>
          </div>

          {/* Active filters */}
          {(search ||
            statusFilter ||
            projectFilter) && (
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs text-slate-500">
                Showing filtered results
              </div>

              <button
                onClick={clearFilters}
                className="w-fit text-sm font-medium text-slate-600 underline underline-offset-4 hover:text-slate-900"
              >
                Clear filters
              </button>
            </div>
          )}
        </section>

        {/* -------------------------------------------------- */}
        {/* TASK LIST */}
        {/* -------------------------------------------------- */}

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Recent Tasks
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {totalTasks} task
                  {totalTasks === 1 ? "" : "s"} found.
                </p>
              </div>

              <Link
                href="/tasks"
                className="text-sm font-semibold text-slate-700 hover:text-slate-900"
              >
                View all tasks →
              </Link>
            </div>
          </div>

          <div className="p-4 sm:p-6">
            {loadingTasks ? (
              <div className="flex min-h-[180px] items-center justify-center">
                <div className="flex items-center gap-3 text-sm text-slate-500">
                  <Loader2
                    size={20}
                    className="animate-spin"
                  />

                  Loading tasks...
                </div>
              </div>
            ) : tasks.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 px-5 py-12 text-center">
                <ListTodo
                  size={30}
                  className="mx-auto text-slate-400"
                />

                <h3 className="mt-4 text-sm font-semibold text-slate-900">
                  No tasks found
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Try changing your search or filters.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-xl border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <h3 className="break-words text-sm font-semibold text-slate-900 sm:text-base">
                          {task.title}
                        </h3>

                        {task.description && (
                          <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-500">
                            {task.description}
                          </p>
                        )}

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                            {getProjectName(task.project_id)}
                          </span>

                          <span className="rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-500">
                            Task
                          </span>
                        </div>
                      </div>

                      <span
                        className={`w-fit shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${getStatusClasses(
                          task.status
                        )}`}
                      >
                        {formatStatus(task.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ------------------------------------------------ */}
            {/* PAGINATION */}
            {/* ------------------------------------------------ */}

            {totalTasks > 0 && (
              <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  Page{" "}
                  <span className="font-semibold text-slate-900">
                    {page}
                  </span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-900">
                    {totalPages}
                  </span>
                </p>

                <div className="flex items-center gap-2">
                  <button
                    disabled={page <= 1 || loadingTasks}
                    onClick={() =>
                      setPage((current) =>
                        Math.max(1, current - 1)
                      )
                    }
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Previous
                  </button>

                  <button
                    disabled={
                      page >= totalPages ||
                      loadingTasks
                    }
                    onClick={() =>
                      setPage((current) =>
                        Math.min(
                          totalPages,
                          current + 1
                        )
                      )
                    }
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* -------------------------------------------------- */}
        {/* SECURITY NOTICE */}
        {/* -------------------------------------------------- */}

        {/* <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex gap-3">
            <div className="shrink-0 rounded-lg bg-slate-100 p-2">
              <TrendingUp
                size={18}
                className="text-slate-700"
              />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Organization Workspace
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                You are viewing data for{" "}
                <span className="font-medium text-slate-700">
                  {user?.organization_name ||
                    "your organization"}
                </span>
                . Dashboard data is scoped to your
                organization.
              </p>
            </div>
          </div>
        </section> */}
      </main>
    </div>
  );
}