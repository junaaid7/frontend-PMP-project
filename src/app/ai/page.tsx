"use client";

import { useEffect, useState } from "react";
import { Bot, CheckCircle, Loader2, Send, Sparkles } from "lucide-react";
import { toast } from "sonner";

import Navbar from "@/components/Navbar";
import { getApiErrorMessage } from "@/lib/api";
import api from "@/lib/api";

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

type ReportData = {
  project_id: string | null;
  project_name: string;
  total_tasks: number;
  status_counts: Record<string, number>;
  completion_rate: number;
  risks: string[];
};

type AssistantResponse = {
  action: string;
  message: string;
  data: unknown;
};

export default function AIPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState("");

  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");

  const [command, setCommand] = useState("");

  const [loadingProjects, setLoadingProjects] = useState(true);
  const [creatingTask, setCreatingTask] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [assistantLoading, setAssistantLoading] = useState(false);

  const [summary, setSummary] = useState<ProjectSummary | null>(null);
  const [report, setReport] = useState<ReportData | null>(null);
  const [assistantResult, setAssistantResult] =
    useState<AssistantResponse | null>(null);

  async function loadProjects() {
    try {
      setLoadingProjects(true);

      const response = await api.get("/ai/tools/list-projects");

      setProjects(response.data);

      if (response.data.length > 0) {
        setSelectedProject(response.data[0].id);
      }
    } catch (error: unknown) {
      console.error(error);

      toast.error(getApiErrorMessage(error, "Failed to load projects"));
    } finally {
      setLoadingProjects(false);
    }
  }

  useEffect(() => {
    const loadPage = async () => {
      await loadProjects();
    };

    void loadPage();
  }, []);

  async function createTask() {
    if (!selectedProject) {
      toast.error("Please select a project");
      return;
    }

    if (!taskTitle.trim()) {
      toast.error("Please enter a task title");
      return;
    }

    try {
      setCreatingTask(true);

      const response = await api.post("/ai/tools/create-task", {
        title: taskTitle.trim(),
        description: taskDescription.trim() || null,
        project_id: selectedProject,
      });

      toast.success("Task created successfully");

      setTaskTitle("");
      setTaskDescription("");

      setAssistantResult({
        action: "create_task",
        message: "Task created successfully.",
        data: response.data,
      });
    } catch (error: unknown) {
      console.error(error);

      toast.error(getApiErrorMessage(error, "Failed to create task"));
    } finally {
      setCreatingTask(false);
    }
  }

  async function getProjectSummary() {
    if (!selectedProject) {
      toast.error("Please select a project");
      return;
    }

    try {
      setLoadingSummary(true);
      setSummary(null);

      const response = await api.get(
        `/ai/tools/project-summary/${selectedProject}`,
      );

      setSummary(response.data);

      toast.success("Project summary generated");
    } catch (error: unknown) {
      console.error(error);

      toast.error(
        getApiErrorMessage(error, "Failed to generate project summary"),
      );
    } finally {
      setLoadingSummary(false);
    }
  }

  async function generateReport() {
    try {
      setLoadingReport(true);
      setReport(null);

      const response = await api.post("/ai/tools/generate-report", {
        project_id: selectedProject || null,
      });

      setReport(response.data);

      toast.success("Report generated");
    } catch (error: unknown) {
      console.error(error);

      toast.error(getApiErrorMessage(error, "Failed to generate report"));
    } finally {
      setLoadingReport(false);
    }
  }

  async function runAssistant() {
    if (!command.trim()) {
      toast.error("Please enter a command");
      return;
    }

    try {
      setAssistantLoading(true);
      setAssistantResult(null);

      const response = await api.post("/ai/assistant", {
        command: command.trim(),
        project_id: selectedProject || null,
      });

      setAssistantResult(response.data);

      toast.success("AI command completed");

      setCommand("");
    } catch (error: unknown) {
      console.error(error);

      const message = getApiErrorMessage(error, "AI command failed");

      toast.error(message);
    } finally {
      setAssistantLoading(false);
    }
  }

  function handleCommandKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      runAssistant();
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="px-4 py-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-indigo-600 p-3 text-white">
                <Bot size={26} />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  AI Assistant
                </h1>

                <p className="text-sm text-slate-500">
                  Manage your projects and tasks using AI.
                </p>
              </div>
            </div>
          </div>

          {/* Project selector */}
          <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-3 flex items-center gap-2">
              <Sparkles size={20} className="text-indigo-600" />

              <h2 className="font-semibold text-slate-900">Select Project</h2>
            </div>

            {loadingProjects ? (
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 size={18} className="animate-spin" />
                Loading projects...
              </div>
            ) : projects.length === 0 ? (
              <p className="text-sm text-slate-500">No projects found.</p>
            ) : (
              <select
                value={selectedProject}
                onChange={(event) => {
                  setSelectedProject(event.target.value);
                  setSummary(null);
                  setReport(null);
                  setAssistantResult(null);
                }}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500"
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            )}
          </section>

          {/* AI Assistant */}
          <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <div className="flex items-center gap-2">
                <Bot size={20} className="text-indigo-600" />

                <h2 className="font-semibold text-slate-900">Ask AI</h2>
              </div>

              <p className="mt-1 text-sm text-slate-500">
                <div className="text-blue-600 font-semibold">prompts</div>
                <div>
                  1. List projects: list projects, <br /> 2. Show projects: show
                  projects, <br /> 3. My projects: my projects, <br /> 4. Create
                  task: create task Test Login, <br /> 5. Add task: add task
                  Test Login, <br /> 6. New task: new task Test Login, <br /> 7.
                  Project summary: project summary, <br /> 8. Health: show health, <br /> 9.
                  Status: project status, <br /> 10. Report: generate report, <br /> 11: Risk:
                  show risks, <br /> 12. Workload: show workload
                </div>
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <textarea
                value={command}
                onChange={(event) => setCommand(event.target.value)}
                onKeyDown={handleCommandKeyDown}
                placeholder="Type an AI command..."
                rows={4}
                className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500"
              />

              <div className="flex justify-end">
                <button
                  onClick={runAssistant}
                  disabled={assistantLoading}
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {assistantLoading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      Ask AI
                    </>
                  )}
                </button>
              </div>
            </div>
          </section>

          {/* AI result */}
          {assistantResult && (
            <section className="mb-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-6">
              <div className="mb-3 flex items-center gap-2">
                <CheckCircle size={20} className="text-indigo-600" />

                <h2 className="font-semibold text-slate-900">AI Result</h2>
              </div>

              <p className="mb-4 text-sm text-slate-700">
                {assistantResult.message}
              </p>

              {assistantResult.data !== null &&
                assistantResult.data !== undefined && (
                  <pre className="overflow-x-auto rounded-xl bg-white p-4 text-xs text-slate-700">
                    {String(JSON.stringify(assistantResult.data, null, 2))}
                  </pre>
                )}
            </section>
          )}

          {/* Action cards */}
          {/* <div className="grid gap-6 lg:grid-cols-2"> */}

          {/* Create task */}
          {/* <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <CheckCircle
                size={20}
                className="text-indigo-600"
              />

              <h2 className="font-semibold text-slate-900">
                Create Task
              </h2>
            </div>

            <div className="space-y-4">
              <input
                value={taskTitle}
                onChange={(event) =>
                  setTaskTitle(event.target.value)
                }
                placeholder="Task title"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500"
              />

              <textarea
                value={taskDescription}
                onChange={(event) =>
                  setTaskDescription(event.target.value)
                }
                placeholder="Task description"
                rows={4}
                className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-indigo-500"
              />

              <button
                onClick={createTask}
                disabled={creatingTask}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
              >
                {creatingTask ? (
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
          </section> */}

          {/* Project summary
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-2">
              <Sparkles
                size={20}
                className="text-indigo-600"
              />

              <h2 className="font-semibold text-slate-900">
                Project Summary
              </h2>
            </div>

            <button
              onClick={getProjectSummary}
              disabled={loadingSummary || !selectedProject}
              className="mb-5 flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
            >
              {loadingSummary ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Generating...
                </>
              ) : (
                "Generate Summary"
              )}
            </button> */}
          {/* 
            {summary && (
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">
                    Total
                  </p>
                  <p className="mt-1 text-2xl font-bold">
                    {summary.total_tasks}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">
                    Todo
                  </p>
                  <p className="mt-1 text-2xl font-bold">
                    {summary.todo_tasks}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">
                    In Progress
                  </p>
                  <p className="mt-1 text-2xl font-bold">
                    {summary.in_progress_tasks}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">
                    Completed
                  </p>
                  <p className="mt-1 text-2xl font-bold">
                    {summary.completed_tasks}
                  </p>
                </div>
              </div>
            )}
          </section>
        </div> */}

          {/* Report
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <FileText
              size={20}
              className="text-indigo-600"
            />

            <div>
              <h2 className="font-semibold text-slate-900">
                AI Project Report
              </h2>

              <p className="text-sm text-slate-500">
                Generate project health and risk information.
              </p>
            </div>
          </div> */}

          {/* <button
            onClick={generateReport}
            disabled={loadingReport}
            className="mb-6 flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {loadingReport ? (
              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />
                Generating...
              </>
            ) : (
              <>
                <FileText size={18} />
                Generate Report
              </>
            )}
          </button>

          {report && (
            <div className="space-y-5">
              <div>
                <p className="text-sm text-slate-500">
                  Project
                </p>

                <p className="font-semibold text-slate-900">
                  {report.project_name}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">
                    Total Tasks
                  </p>

                  <p className="mt-1 text-2xl font-bold">
                    {report.total_tasks}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">
                    Completion
                  </p>

                  <p className="mt-1 text-2xl font-bold">
                    {report.completion_rate}%
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">
                    Done
                  </p>

                  <p className="mt-1 text-2xl font-bold">
                    {report.status_counts.done || 0}
                  </p>
                </div>
              </div> */}

          {/* <div>
                <h3 className="mb-3 font-semibold text-slate-900">
                  Risks
                </h3>

                {report.risks.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No major risks detected.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {report.risks.map((risk, index) => (
                      <li
                        key={index}
                        className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800"
                      >
                        {risk}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </section> */}
        </div>
      </main>
    </div>
  );
}
