"use client";

import { useState, useEffect } from "react";
import { Bot, CheckCircle, Loader2 } from "lucide-react";
import { toast, Toaster } from "sonner";
import api from "@/lib/api";
import Navbar from "@/components/Navbar";

type Project = {
  id: string;
  name: string;
};

type ProjectSummary = {
  project_id: string;
  project_name: string;
  total_tasks: number;
  todo_tasks: number;
  in_progress_tasks: number;
  completed_tasks: number;
};

export default function AIPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  const loadProjects = async () => {
    try {
      const response = await api.get("/ai/tools/list-projects");

      console.log("PROJECTS RESPONSE:", response.data);

      setProjects(response.data);
    } catch (error: any) {
      console.error("LOAD PROJECTS ERROR:", error);

      toast.error(
        error?.response?.data?.detail || "Failed to load projects"
      );
    }
  };

  const createTask = async () => {
    if (!taskTitle.trim()) {
      toast.error("Please enter task title");
      return;
    }

    if (!selectedProject) {
      toast.error("Please select a project");
      return;
    }

    try {
      setLoading(true);
      setResult("");

      const response = await api.post("/ai/tools/create-task", {
        title: taskTitle,
        description: taskDescription.trim() || null,
        project_id: selectedProject,
      });

      console.log("TASK RESPONSE:", response.data);

      setResult(
        `Task "${response.data.title}" was created successfully.`
      );

      toast.success("Task created successfully");

      setTaskTitle("");
      setTaskDescription("");
    } catch (error: any) {
      console.error("CREATE TASK ERROR:", error);

      toast.error(
        error?.response?.data?.detail || "Failed to create task"
      );
    } finally {
      setLoading(false);
    }
  };

  const getProjectSummary = async () => {
    console.log("SUMMARY BUTTON CLICKED");

    if (!selectedProject) {
      toast.error("Please select a project");
      return;
    }

    try {
      setLoading(true);
      setResult("");

      console.log("REQUEST PROJECT ID:", selectedProject);

      const response = await api.get(
        `/ai/tools/project-summary/${selectedProject}`
      );

      console.log("SUMMARY RESPONSE:", response.data);

      const data: ProjectSummary = response.data;

      const summary = `${data.project_name}: ${data.total_tasks} total tasks, ${data.completed_tasks} completed, ${data.in_progress_tasks} in progress, ${data.todo_tasks} todo.`;

      console.log("SUMMARY TEXT:", summary);

      setResult(summary);

      toast.success("Project summary loaded successfully");
    } catch (error: any) {
      console.error("SUMMARY ERROR:", error);

      toast.error(
        error?.response?.data?.detail ||
          "Failed to get project summary"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <>
      {/* Page-level Sonner */}
      <Toaster position="top-right" richColors />

        <Navbar />
      <main className="min-h-screen bg-slate-50 px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-slate-900 p-3 text-white">
                <Bot size={24} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  AI Project Assistant
                </h1>

                <p className="text-sm text-slate-500">
                  Use AI tools to manage your projects and tasks.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-lg font-semibold text-slate-900">
              Create Task
            </h2>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Project
                </label>

                <select
                  value={selectedProject}
                  onChange={(e) =>
                    setSelectedProject(e.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                >
                  <option value="">Select project</option>

                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Task Title
                </label>

                <input
                  value={taskTitle}
                  onChange={(e) =>
                    setTaskTitle(e.target.value)
                  }
                  placeholder="Example: Fix login bug"
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Description
                </label>

                <textarea
                  value={taskDescription}
                  onChange={(e) =>
                    setTaskDescription(e.target.value)
                  }
                  placeholder="Task description..."
                  rows={4}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                />
              </div>

              <button
                type="button"
                onClick={createTask}
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                    Creating...
                  </>
                ) : (
                  "Create Task"
                )}
              </button>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

             {result && (
            <div className="mb-6 flex gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <CheckCircle
                className="mt-0.5 text-green-600"
                size={20}
              />

              <div>
                <p className="text-sm font-semibold text-slate-900">
                  AI Result
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  {result}
                </p>
              </div>
            </div>
          )}



            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Project Summary
            </h2>

            <button
              type="button"
              onClick={getProjectSummary}
              disabled={loading}
              className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Loading..." : "Get Project Summary"}
            </button>
          </div>

        </div>
      </main>
    </>
  );
}
