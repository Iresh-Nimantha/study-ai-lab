import React, { useState } from "react";
import { useStore } from "../store";
import { Plus, Trash2, Check, Calendar as CalendarIcon } from "lucide-react";
import type { Task } from "../types";

export const Planner = () => {
  const { tasks, addTask, toggleTask, deleteTask } = useStore();
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [category, setCategory] = useState<Task["category"]>("study");

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    addTask({
      id: Date.now().toString(),
      title: newTaskTitle,
      completed: false,
      date: new Date().toISOString(),
      category,
    });
    setNewTaskTitle("");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 pb-10">
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-3">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Study Planner
        </h1>

        <div className="bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 self-start sm:self-auto">
          <CalendarIcon size={16} />
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </div>
      </header>

      {/* Add Task */}
      <form
        onSubmit={handleAdd}
        className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 mb-8 flex flex-col sm:flex-row gap-4"
      >
        <input
          type="text"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 bg-transparent focus:outline-none text-base sm:text-lg placeholder:text-slate-400"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as Task["category"])}
          className="bg-slate-100 dark:bg-slate-900 border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 w-full sm:w-auto"
        >
          <option value="study">Study</option>
          <option value="assignment">Assignment</option>
          <option value="exam">Exam</option>
          <option value="other">Other</option>
        </select>

        <button
          type="submit"
          className="bg-brand-500 hover:bg-brand-600 text-white p-3 rounded-xl transition-colors flex items-center justify-center w-full sm:w-auto"
        >
          <Plus size={20} className="sm:w-6 sm:h-6" />
        </button>
      </form>

      {/* Task List */}
      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-sm sm:text-base">
            No tasks yet. Add one above to get started!
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`
                group flex items-start sm:items-center gap-4 p-4 rounded-xl bg-white dark:bg-slate-800 border transition-all duration-200
                ${
                  task.completed
                    ? "border-slate-200 dark:border-slate-700 opacity-60"
                    : "border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                }
              `}
            >
              {/* Complete Button */}
              <button
                onClick={() => toggleTask(task.id)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 sm:mt-0 transition-colors
                  ${
                    task.completed
                      ? "bg-green-500 border-green-500 text-white"
                      : "border-slate-300 hover:border-green-500"
                  }`}
              >
                {task.completed && <Check size={14} />}
              </button>

              {/* Text */}
              <div className="flex-1">
                <h3
                  className={`font-medium text-sm sm:text-base ${
                    task.completed ? "line-through text-slate-500" : ""
                  }`}
                >
                  {task.title}
                </h3>

                <div className="flex gap-2 mt-2">
                  <span
                    className={`
                      text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full
                      ${
                        task.category === "study"
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                          : task.category === "exam"
                          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                          : "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
                      }
                    `}
                  >
                    {task.category}
                  </span>
                </div>
              </div>

              {/* Delete */}
              <button
                onClick={() => deleteTask(task.id)}
                className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
