"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  FolderKanban,
  ClipboardList,
  Trash2,
  Pencil,
  Plus,
  X,
} from "lucide-react";
import {
  canCreateTask,
  canEditTask,
  canDeleteTask,
  canEditProject,
  canDeleteProject,
} from "@/lib/permissions";

import { toast } from "sonner";
import {
  getApiErrorMessage,
  getApiErrorStatus,
} from "@/lib/api";
import api from "@/lib/api";

type Project = {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
};

type Task = {
  id: string;
  organization_id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "done";
};

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);

  const [tasks, setTasks] = useState<Task[]>([]);

  const [userRole, setUserRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(true);

  const [deleting, setDeleting] = useState(false);
  const [creatingTask, setCreatingTask] = useState(false);
  const [updatingTask, setUpdatingTask] = useState(false);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");

  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [editTaskTitle, setEditTaskTitle] = useState("");

  const [editTaskDescription, setEditTaskDescription] = useState("");

  const [editTaskStatus, setEditTaskStatus] = useState<Task["status"]>("todo");

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/projects/${projectId}`);

      setProject(response.data);
    } catch (error: unknown) {
      console.error("Failed to fetch project:", error);

      if (getApiErrorStatus(error) === 404) {
        toast.error("Project not found");
      } else if (getApiErrorStatus(error) === 401) {
        toast.error("Please login again.");
      } else {
        toast.error(getApiErrorMessage(error, "Failed to load project."));
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectTasks = async () => {
    try {
      setTasksLoading(true);

      const response = await api.get(`/tasks/project/${projectId}`);

      setTasks(response.data);
    } catch (error: unknown) {
      console.error("Failed to fetch project tasks:", error);

      toast.error(
        getApiErrorMessage(error, "Failed to load project tasks."),
      );
    } finally {
      setTasksLoading(false);
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
    const loadPage = async () => {
      await Promise.all([
        fetchProject(),
        fetchProjectTasks(),
        fetchCurrentUser(),
      ]);
    };

    void loadPage();
  }, [projectId]);




  const handleDeleteProject = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?",
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);

      await api.delete(`/projects/${projectId}`);

      toast.success("Project deleted successfully!");

      router.push("/projects");
    } catch (error: unknown) {
      console.error("Failed to delete project:", error);

      toast.error(getApiErrorMessage(error, "Failed to delete project."));
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!taskTitle.trim()) {
      toast.error("Task title is required");
      return;
    }

    if (taskTitle.trim().length < 2) {
      toast.error("Task title must be at least 2 characters");
      return;
    }

    try {
      setCreatingTask(true);

      const response = await api.post("/tasks/", {
        project_id: projectId,
        title: taskTitle.trim(),
        description: taskDescription.trim() || null,
      });

      setTasks((currentTasks) => [response.data, ...currentTasks]);

      setTaskTitle("");
      setTaskDescription("");
      setShowTaskModal(false);

      toast.success("Task created successfully!");
    } catch (error: unknown) {
      console.error("Failed to create task:", error);

      toast.error(getApiErrorMessage(error, "Failed to create task."));
    } finally {
      setCreatingTask(false);
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
    setEditTaskTitle(task.title);
    setEditTaskDescription(task.description || "");
    setEditTaskStatus(task.status);

    setShowEditTaskModal(true);
  };

  const handleUpdateTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!editingTask) {
      return;
    }

    if (!editTaskTitle.trim()) {
      toast.error("Task title is required");
      return;
    }

    if (editTaskTitle.trim().length < 2) {
      toast.error("Task title must be at least 2 characters");
      return;
    }

    try {
      setUpdatingTask(true);

      const response = await api.put(`/tasks/${editingTask.id}`, {
        title: editTaskTitle.trim(),
        description: editTaskDescription.trim() || null,
        status: editTaskStatus,
      });

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === editingTask.id ? response.data : task,
        ),
      );

      setShowEditTaskModal(false);
      setEditingTask(null);
      setEditTaskTitle("");
      setEditTaskDescription("");
      setEditTaskStatus("todo");

      toast.success("Task updated successfully!");
    } catch (error: unknown) {
      console.error("Failed to update task:", error);

      toast.error(getApiErrorMessage(error, "Failed to update task."));
    } finally {
      setUpdatingTask(false);
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

  const closeTaskModal = () => {
    setShowTaskModal(false);
    setTaskTitle("");
    setTaskDescription("");
  };

  const closeEditTaskModal = () => {
    setShowEditTaskModal(false);
    setEditingTask(null);
    setEditTaskTitle("");
    setEditTaskDescription("");
    setEditTaskStatus("todo");
  };

  const getStatusClasses = (status: Task["status"]) => {
    if (status === "done") {
      return "bg-green-50 text-green-700 border-green-200";
    }

    if (status === "in_progress") {
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    }

    return "bg-slate-50 text-slate-600 border-slate-200";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        {" "}
        <p className="text-sm text-slate-500">Loading project... </p>{" "}
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        {" "}
        <div className="text-center">
          <h2 className="text-lg font-semibold text-slate-900">
            Project not found
          </h2>

          <Link
            href="/projects"
            className="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {" "}
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Projects
          </Link>
        </div>
      </div>
      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-6">
          {/* Project Heading */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
            <div className="flex items-start gap-3 sm:gap-4 min-w-0">
              <div className="h-12 w-12 shrink-0 rounded-xl bg-blue-50 flex items-center justify-center">
                <FolderKanban className="h-6 w-6 text-blue-600" />
              </div>

              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 break-words">
                  {project.name}
                </h1>

                <p className="text-sm text-slate-500 mt-1">Project Details</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {canEditProject(userRole) && (
              <button
                disabled
                className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-400 bg-slate-100 rounded-lg cursor-not-allowed"
              >
                
                <Pencil className="h-4 w-4" />
                Edit
              </button>
              )}

              {canDeleteProject(userRole) && (
                <button
                  onClick={handleDeleteProject}
                  disabled={deleting}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" />

                  {deleting ? "Deleting..." : "Delete"}
                </button>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="mt-8">
            <h2 className="text-sm font-semibold text-slate-900">
              Description
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600 break-words">
              {project.description ||
                "No description provided for this project."}
            </p>
          </div>

          {/* Project Information */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-xl p-4">
              <p className="text-xs text-slate-400">Project ID</p>

              <p className="mt-1 text-sm font-medium text-slate-800 break-all">
                {project.id}
              </p>
            </div>

            <div className="border border-slate-200 rounded-xl p-4">
              <p className="text-xs text-slate-400">Organization ID</p>

              <p className="mt-1 text-sm font-medium text-slate-800 break-all">
                {project.organization_id}
              </p>
            </div>
          </div>

          {/* Tasks */}
          <div className="mt-8 border-t border-slate-200 pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Tasks</h2>

                <p className="text-sm text-slate-500 mt-1">
                  Tasks for this project
                </p>
              </div>
              {canCreateTask(userRole) && (
                <button
                  onClick={() => setShowTaskModal(true)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                >
                  <Plus className="h-4 w-4" />
                  Add Task
                </button>
              )}
            </div>

            {/* Task Loading */}
            {tasksLoading && (
              <div className="mt-5 py-8 text-center">
                <p className="text-sm text-slate-500">Loading tasks...</p>
              </div>
            )}

            {/* Empty */}
            {!tasksLoading && tasks.length === 0 && (
              <div className="mt-5 rounded-xl bg-slate-50 border border-dashed border-slate-200 p-6 sm:p-8 text-center">
                <ClipboardListIcon />

                <p className="mt-3 text-sm text-slate-500">
                  No tasks in this project yet.
                </p>
                {canCreateTask(userRole) && (
                  <button
                    onClick={() => setShowTaskModal(true)}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                  >
                    <Plus className="h-4 w-4" />
                    Create First Task
                  </button>
                )}
              </div>
            )}

            {/* Task List */}
            {!tasksLoading && tasks.length > 0 && (
              <div className="mt-5 space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="border border-slate-200 rounded-xl p-4 hover:shadow-sm transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <h3 className="font-semibold text-slate-900 break-words">
                            {task.title}
                          </h3>
                          {canEditTask(userRole) ? (
                            <select
                              value={task.status}
                              onChange={(e) =>
                                handleStatusChange(
                                  task.id,
                                  e.target.value as Task["status"],
                                )
                              }
                              disabled={!canEditTask(userRole)}
                              className={`w-fit px-3 py-1.5 text-xs rounded-lg border outline-none focus:ring-2 focus:ring-blue-100 ${getStatusClasses(
                                task.status,
                              )}`}
                            >
                              <option value="todo">Todo</option>

                              <option value="in_progress">In Progress</option>

                              <option value="done">Done</option>
                            </select>
                          ) : (
                            <span>{task.status}</span>
                          )}
                        </div>

                        <p className="mt-2 text-sm text-slate-500 leading-6 break-words">
                          {task.description || "No description provided."}
                        </p>
                      </div>

                      {/* Task Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-start">
                        {canEditTask(userRole) && (
                          <button
                            onClick={() => handleEditTask(task)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="Edit task"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                        )}

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
          </div>
        </div>
      </main>
      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl">
            <div className="flex items-start justify-between gap-4 p-5 sm:p-6 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Create Task
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Add a task to this project.
                </p>
              </div>

              <button
                onClick={closeTaskModal}
                className="shrink-0 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="p-5 sm:p-6 space-y-5">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Task Title
                </label>

                <input
                  type="text"
                  placeholder="Create homepage"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Description
                </label>

                <textarea
                  rows={4}
                  placeholder="Describe what needs to be done..."
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <button
                  type="button"
                  onClick={closeTaskModal}
                  className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creatingTask}
                  className="w-full sm:w-auto px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {creatingTask ? "Creating..." : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Edit Task Modal */}
      {showEditTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl">
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
                onClick={closeEditTaskModal}
                className="shrink-0 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTask} className="p-5 sm:p-6 space-y-5">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Task Title
                </label>

                <input
                  type="text"
                  value={editTaskTitle}
                  onChange={(e) => setEditTaskTitle(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Description
                </label>

                <textarea
                  rows={4}
                  value={editTaskDescription}
                  onChange={(e) => setEditTaskDescription(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Status
                </label>

                <select
                  value={editTaskStatus}
                  onChange={(e) =>
                    setEditTaskStatus(e.target.value as Task["status"])
                  }
                  className="w-full mt-1.5 px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                >
                  <option value="todo">Todo</option>

                  <option value="in_progress">In Progress</option>

                  <option value="done">Done</option>
                </select>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
                <button
                  type="button"
                  onClick={closeEditTaskModal}
                  className="w-full sm:w-auto px-4 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={updatingTask}
                  className="w-full sm:w-auto px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {updatingTask ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/*
Small inline icon used for the empty task state.
*/
function ClipboardListIcon() {
  return (
    <div className="mx-auto h-14 w-14 rounded-xl bg-blue-50 flex items-center justify-center">
      {" "}
      <ClipboardList className="h-7 w-7 text-blue-600" />{" "}
    </div>
  );
}
