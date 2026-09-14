"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  FolderKanban,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";

export default function HomePage() {
  const features = [
    {
      icon: FolderKanban,
      title: "Project Management",
      description:
        "Create and manage projects, tasks, statuses and deadlines from one workspace.",
    },
    {
      icon: Bot,
      title: "AI-Powered Tools",
      description:
        "Use AI tools to create tasks, update tasks, assign users and generate reports.",
    },
    {
      icon: ShieldCheck,
      title: "Role-Based Access",
      description:
        "Owner, Admin, Manager, Developer and Viewer roles keep your workspace controlled.",
    },
    {
      icon: LockKeyhole,
      title: "Multi-Tenant Security",
      description:
        "Every organization has isolated data so users cannot access another organization's projects.",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description:
        "Manage team members and control their roles and permissions.",
    },
    {
      icon: BarChart3,
      title: "Workspace Insights",
      description:
        "Track project health, task distribution, workload and important risks.",
    },
  ];

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-slate-50">
      {/* Navbar */}
      <nav className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-900">PMP</p>
              <p className="text-[11px] text-slate-500">AI Workspace</p>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 sm:px-4"
            >
              Login
            </Link>

            <Link
              href="/register"
              className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800 sm:px-4"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="w-full overflow-hidden">
        <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-16 sm:px-6 sm:pb-20 sm:pt-24 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-5 inline-flex max-w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 shadow-sm">
              <span>Project Management Platform</span>
            </div>

            <h1 className="break-words text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Manage your projects.
              <span className="block text-slate-500">
                Work smarter with AI.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
              A secure multi-tenant project management platform for teams to
              organize projects, manage tasks, collaborate with members and
              use AI-powered productivity tools.
            </p>

            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 sm:w-auto"
              >
                Create Workspace
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 sm:w-auto"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="w-full border-t border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold text-blue-600">
              Everything your team needs
            </p>

            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              One workspace for your entire team
            </h2>

            <p className="mt-4 text-sm leading-6 text-slate-500">
              Manage your work, team members and projects while keeping
              organization data secure.
            </p>
          </div>

          <div className="mt-12 grid w-full gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <div
                  key={feature.title}
                  className="min-w-0 rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                    <Icon className="h-5 w-5 text-slate-700" />
                  </div>

                  <h3 className="mt-5 break-words text-base font-bold text-slate-900">
                    {feature.title}
                  </h3>

                  <p className="mt-2 break-words text-sm leading-6 text-slate-500">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Workflow */}
      {/* <section className="w-full overflow-hidden bg-slate-50">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid w-full gap-10 lg:grid-cols-2 lg:items-center">
            <div className="min-w-0">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900">
                <Zap className="h-5 w-5 text-white" />
              </div>

              <h2 className="mt-5 break-words text-3xl font-bold text-slate-900">
                Built for productive teams
              </h2>

              <p className="mt-4 text-sm leading-7 text-slate-600">
                From creating your organization to managing projects and
                tasks, everything is connected in one secure workspace.
              </p>

              <div className="mt-6 space-y-4">
                {[
                  "Create your organization",
                  "Invite and manage team members",
                  "Create projects and tasks",
                  "Track task progress",
                  "Use AI tools for repetitive work",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
                    <p className="text-sm font-medium text-slate-700">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-900">
                    AI Workspace
                  </p>

                  <p className="text-xs text-slate-500">
                    Productivity assistant
                  </p>
                </div>

                <Bot className="h-6 w-6 shrink-0 text-blue-600" />
              </div>

              <div className="mt-6 space-y-3">
                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-500">
                    AI Assistant
                  </p>

                  <p className="mt-2 break-words text-sm text-slate-700">
                    Create a task for the frontend team and assign it to a
                    developer.
                  </p>
                </div>

                <div className="ml-4 rounded-xl bg-slate-900 p-4 sm:ml-8">
                  <p className="text-xs text-slate-400">AI Result</p>

                  <p className="mt-2 break-words text-sm text-white">
                    Task created and assigned successfully.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      {/* CTA */}
      <section className="w-full overflow-hidden bg-slate-900">
        <div className="mx-auto w-full max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <h2 className="break-words text-3xl font-bold text-white">
            Ready to manage your workspace?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-400">
            Create your workspace and start managing your projects and team
            today.
          </p>

          <Link
            href="/register"
            className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 sm:w-auto"
          >
            Get Started
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}