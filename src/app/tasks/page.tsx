"use client";

import { useEffect, useState } from "react";
import {
  ClipboardList,
  Plus,
  Pencil,
  X,
  Trash2,
  FolderKanban,
} from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api";
import api from "@/lib/api";

type Project = {
  id: string;
  name: string;
};

type Task = {
  id: string;
  organization_id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "done";
};

import { canCreateTask, canEditTask, canDeleteTask } from "@/lib/permissions";
import Navbar from "@/components/Navbar";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [projectId, setProjectId] = useState("");

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [userRole, setUserRole] = useState("");
  const [editStatus, setEditStatus] = useState<Task["status"]>("todo");

  const getProjects = async () => {
    try {
      const response = await api.get("/projects/");

      setProjects(response.data);

      if (response.data.length > 0 && !projectId) {
        setProjectId(response.data[0].id);
      }
    } catch (error: unknown) {
      console.error("Failed to fetch projects:", error);

      toast.error(getApiErrorMessage(error, "Failed to load projects."));
    }
  };

  const getTasks = async () => {
    try {
      setLoading(true);

      const response = await api.get("/tasks/");

      setTasks(response.data);
    } catch (error: unknown) {
      console.error("Failed to fetch tasks:", error);

      toast.error(getApiErrorMessage(error, "Failed to load tasks."));
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const response = await api.get("/auth/me");

      setUserRole(response.data.role);
    } catch (error) {
      console.error("Failed to fetch current user:", error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([getProjects(), getTasks(), fetchCurrentUser()]);
    };

    loadData();
  }, []);

  const handleCreateTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Task title is required");
      return;
    }

    if (title.trim().length < 2) {
      toast.error("Task title must be at least 2 characters");
      return;
    }

    if (!projectId) {
      toast.error("Please select a project");
      return;
    }

    try {
      setCreating(true);

      const response = await api.post("/tasks/", {
        project_id: projectId,
        title: title.trim(),
        description: description.trim() || null,
      });

      setTasks((currentTasks) => [response.data, ...currentTasks]);

      setTitle("");
      setDescription("");
      setShowCreateModal(false);

      toast.success("Task created successfully!");
    } catch (error: unknown) {
      console.error("Failed to create task:", error);

      toast.error(getApiErrorMessage(error, "Failed to create task."));
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/tasks/${taskId}`);

      setTasks((currentTasks) =>
        currentTasks.filter((task) => task.id !== taskId),
      );

      toast.success("Task deleted successfully!");
    } catch (error: unknown) {
      console.error("Failed to delete task:", error);

      toast.error(getApiErrorMessage(error, "Failed to delete task."));
    }
  };

  const handleStatusChange = async (taskId: string, status: Task["status"]) => {
    try {
      const response = await api.patch(`/tasks/${taskId}/status`, {
        status,
      });

      setTasks((currentTasks) =>
        currentTasks.map((task) => (task.id === taskId ? response.data : task)),
      );

      toast.success("Task status updated!");
    } catch (error: unknown) {
      console.error("Failed to update task status:", error);

      toast.error(
        getApiErrorMessage(error, "Failed to update task status."),
      );
    }
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setEditStatus(task.status);

    setShowEditModal(true);
  };

  const handleUpdateTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!editingTask) {
      return;
    }

    if (!editTitle.trim()) {
      toast.error("Task title is required");
      return;
    }

    if (editTitle.trim().length < 2) {
      toast.error("Task title must be at least 2 characters");
      return;
    }

    try {
      setUpdating(true);

      const response = await api.put(`/tasks/${editingTask.id}`, {
        title: editTitle.trim(),
        description: editDescription.trim() || null,
        status: editStatus,
      });

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === editingTask.id ? response.data : task,
        ),
      );

      setEditingTask(null);
      setEditTitle("");
      setEditDescription("");
      setEditStatus("todo");
      setShowEditModal(false);

      toast.success("Task updated successfully!");
    } catch (error: unknown) {
      console.error("Failed to update task:", error);

      toast.error(getApiErrorMessage(error, "Failed to update task."));
    } finally {
      setUpdating(false);
    }
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setTitle("");
    setDescription("");
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingTask(null);
    setEditTitle("");
    setEditDescription("");
    setEditStatus("todo");
  };

  const getProjectName = (projectId: string) => {
    const project = projects.find((item) => item.id === projectId);

    return project?.name || "Unknown Project";
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {" "}
      <Navbar/>
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 rounded-lg bg-blue-50 flex items-center justify-center">
              <ClipboardList className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                Tasks
              </h1>

              <p className="text-xs sm:text-sm text-slate-500">
                Manage tasks across your projects
              </p>
            </div>
          </div>
          {canCreateTask(userRole) && (
            <button
              onClick={() => setShowCreateModal(true)}
              disabled={projects.length === 0}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-linear-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="h-4 w-4" />
              Create Task
            </button>
          )}
        </div>
      </div>
      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* No Projects */}
        {!loading && projects.length === 0 && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
            You need to create a project before creating a task.
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-slate-500">Loading tasks...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && tasks.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-10 text-center">
            <div className="mx-auto h-14 w-14 rounded-xl bg-blue-50 flex items-center justify-center">
              <ClipboardList className="h-7 w-7 text-blue-600" />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              No tasks yet
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Create your first task to start working.
            </p>

            {canCreateTask(userRole) && (
              <button
                onClick={() => setShowCreateModal(true)}
                disabled={projects.length === 0}
                className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="h-4 w-4" />
                Create Task
              </button>
            )}
          </div>
        )}

        {/* Tasks */}
        {!loading && tasks.length > 0 && (
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-5 hover:shadow-md transition"
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  {/* Task Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                      <h2 className="text-base sm:text-lg font-semibold text-slate-900 break-words">
                        {task.title}
                      </h2>

                      {/* Status */}
                      {canEditTask(userRole) ? (
                        <select
                          value={task.status}
                          onChange={(e) =>
                            handleStatusChange(
                              task.id,
                              e.target.value as Task["status"],
                            )
                          }
                          className="w-fit px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        >
                          <option value="todo">Todo</option>

                          <option value="in_progress">In Progress</option>

                          <option value="done">Done</option>
                        </select>
                      ) : (
                        <span>{task.status}</span>
                      )}
                    </div>

                    {/* Project */}
                    <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
                      <FolderKanban className="h-4 w-4 shrink-0" />

                      <span className="truncate">
                        {getProjectName(task.project_id)}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="mt-3 text-sm text-slate-600 leading-6 break-words">
                      {task.description || "No description provided."}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end lg:self-start">
                    {/* Edit */}
                    {canEditTask(userRole) && (
                      <button
                        onClick={() => handleEditTask(task)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                        title="Edit task"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                    )}

                    {/* Delete */}
                    {canDeleteTask(userRole) && (
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Delete task"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 p-5 sm:p-6 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Create Task
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Add a task to one of your projects.
                </p>
              </div>

              <button
                onClick={closeCreateModal}
                className="shrink-0 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateTask} className="p-5 sm:p-6 space-y-5">
              {/* Project */}
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Project
                </label>

                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                >
                  <option value="">Select a project</option>

                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Task Title
                </label>

                <input
                  type="text"
                  placeholder="Create homepage"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Description
                </label>

                <textarea
                  rows={4}
                  placeholder="Describe what needs to be done..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <button
                  type="button"
                  onClick={closeCreateModal}
                  className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="w-full sm:w-auto px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {creating ? "Creating..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Task Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 p-5 sm:p-6 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Edit Task
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Update task information.
                </p>
              </div>

              <button
                onClick={closeEditModal}
                className="shrink-0 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleUpdateTask} className="p-5 sm:p-6 space-y-5">
              {/* Title */}
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Task Title
                </label>

                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Description
                </label>

                <textarea
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                />
              </div>

              {/* Status */}
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Status
                </label>

                <select
                  value={editStatus}
                  onChange={(e) =>
                    setEditStatus(e.target.value as Task["status"])
                  }
                  className="w-full mt-1.5 px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                >
                  <option value="todo">Todo</option>

                  <option value="in_progress">In Progress</option>

                  <option value="done">Done</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={updating}
                  className="w-full sm:w-auto px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {updating ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
