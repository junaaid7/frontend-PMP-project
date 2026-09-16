"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FolderKanban, Plus, X, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";
import {
  getApiErrorMessage,
  getApiErrorStatus,
} from "@/lib/api";
import api from "@/lib/api";
import {
  canCreateProject,
  canDeleteProject,
} from "@/lib/permissions";
import Navbar from "@/components/Navbar";

type Project = {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const fetchProjects = async () => {
    try {
      setLoading(true);

      const response = await api.get("/projects/");

      setProjects(response.data);
    } catch (error: unknown) {
      console.error("Failed to fetch projects:", error);

      const statusCode = getApiErrorStatus(error);

      if (statusCode === 401) {
        toast.error("Please login again.");
        return;
      }

      toast.error(getApiErrorMessage(error, "Failed to load projects."));
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
    const loadPage = async () => {
      await Promise.all([fetchProjects(), fetchCurrentUser()]);
    };

    void loadPage();
  }, []);


  const handleCreateProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Project name is required");
      return;
    }

    if (name.trim().length < 2) {
      toast.error("Project name must be at least 2 characters");
      return;
    }

    try {
      setCreating(true);

      const response = await api.post("/projects/", {
        name: name.trim(),
        description: description.trim() || null,
      });

      setProjects((currentProjects) => [response.data, ...currentProjects]);

      setName("");
      setDescription("");
      setShowCreateModal(false);

      toast.success("Project created successfully!");
    } catch (error: unknown) {
      console.error("Failed to create project:", error);

      toast.error(getApiErrorMessage(error, "Failed to create project."));
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this project?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/projects/${projectId}`);

      setProjects((currentProjects) =>
        currentProjects.filter((project) => project.id !== projectId),
      );

      toast.success("Project deleted successfully!");
    } catch (error: unknown) {
      console.error("Failed to delete project:", error);

      toast.error(getApiErrorMessage(error, "Failed to delete project."));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {" "}
      <Navbar  />
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <FolderKanban className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <h1 className="text-xl font-bold text-slate-900">Projects</h1>

              <p className="text-sm text-slate-500">
                Manage your organization projects
              </p>
            </div>
          </div>
          {canCreateProject(userRole) && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-linear-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md cursor-pointer"
            >
              <Plus className="h-4 w-4 hidden sm:block" />
              Create Project
            </button>
          )}
        </div>
      </div>
      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm text-slate-500">Loading projects...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && projects.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-10 text-center">
            <div className="mx-auto h-14 w-14 rounded-xl bg-blue-50 flex items-center justify-center">
              <FolderKanban className="h-7 w-7 text-blue-600" />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              No projects yet
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Create your first project to get started.
            </p>

            {canCreateProject(userRole) && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                Create Project
              </button>
            )}
          </div>
        )}

        {/* Projects */}
        {!loading && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 hover:shadow-md transition"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between">
                  <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                    <FolderKanban className="h-5 w-5 text-blue-600" />
                  </div>

{canDeleteProject(userRole) && (
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                    title="Delete project"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
)}
                </div>

                {/* Project Info */}
                <h2 className="mt-4 text-lg font-semibold text-slate-900">
                  {project.name}
                </h2>

                <div className="flex items-start gap-2 mt-2">
                  <FileText className="h-4 w-4 mt-0.5 text-slate-400 shrink-0" />

                  <p className="text-sm text-slate-500 line-clamp-3">
                    {project.description || "No description provided."}
                  </p>
                </div>

                {/* Project ID */}
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-400">Project ID</p>

                  <p className="mt-1 text-xs text-slate-600 truncate">
                    {project.id}
                  </p>
                </div>
                <Link
                  href={`/projects/${project.id}`}
                  className="inline-flex items-center bg-green-700 px-4 py-2 rounded-lg text-white hover:bg-green-800 gap-2 mt-4 text-sm font-semibold"
                >
                  View Project →
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Create Project
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  Add a new project to your organization.
                </p>
              </div>

              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5 " />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateProject} className="p-6 space-y-5">
              {/* Name */}
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Project Name
                </label>

                <input
                  type="text"
                  placeholder="Website Redesign"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
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
                  placeholder="Describe your project..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full mt-1.5 px-3 py-2.5 text-sm rounded-lg border border-slate-200 bg-slate-50/70 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setName("");
                    setDescription("");
                  }}
                  className="cursor-pointer px-4 py-2.5 text-sm font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={creating}
                  className="cursor-pointer px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {creating ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
