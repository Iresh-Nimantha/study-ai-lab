import { useStore } from "../store";
import { ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { AppRoute } from "../types";

export const Home = () => {
  const { tasks, user } = useStore();
  const pendingTasks = tasks.filter((t) => !t.completed);

  const quickActions = [
    {
      title: "Ask AI",
      desc: "Get help with homework",
      icon: "🤖",
      path: AppRoute.CHAT,
      color: "bg-indigo-500",
    },
    {
      title: "Create Image",
      desc: "Visualize concepts",
      icon: "🎨",
      path: AppRoute.IMAGE_GEN,
      color: "bg-pink-500",
    },
    {
      title: "Study",
      desc: "Start a focus session",
      icon: "⏱️",
      path: AppRoute.TIMER,
      color: "bg-amber-500",
    },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
          Welcome back, {user?.name || "Student"}! 👋
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          You have {pendingTasks.length} pending tasks for today. Let's get
          productive.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickActions.map((action) => (
          <Link
            key={action.title}
            to={action.path}
            className="group relative overflow-hidden bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-100 dark:border-slate-700"
          >
            <div
              className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10 ${action.color}`}
            />
            <div className="relative z-10">
              <span className="text-4xl mb-4 block">{action.icon}</span>
              <h3 className="text-lg font-semibold mb-1">{action.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                {action.desc}
              </p>
              <span className="text-brand-500 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                Go now <ArrowRight size={16} />
              </span>
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Tasks Overview */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <CheckCircle2 className="text-green-500" size={20} />
              Priority Tasks
            </h2>
            <Link
              to={AppRoute.PLANNER}
              className="text-sm text-brand-500 hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {pendingTasks.slice(0, 3).map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700"
              >
                <div
                  className={`w-2 h-full rounded-full ${
                    task.category === "study" ? "bg-blue-500" : "bg-purple-500"
                  }`}
                />
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{task.title}</h4>
                  <p className="text-xs text-slate-500">
                    {new Date(task.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {pendingTasks.length === 0 && (
              <p className="text-slate-500 text-sm text-center py-4">
                No pending tasks. Great job!
              </p>
            )}
          </div>
        </div>

        {/* Recent Activity / Stats */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
          <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
            <Clock className="text-brand-500" size={20} />
            Study Stats
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-center">
              <span className="block text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                4.5h
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Focused Today
              </span>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-center">
              <span className="block text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                12
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Tasks Done
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
