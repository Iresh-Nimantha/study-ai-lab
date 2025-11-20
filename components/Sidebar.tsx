import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  Image as ImageIcon,
  Calendar,
  Timer,
  Library,
  FileText,
  ListChecks,
  X,
} from "lucide-react";

import Dev from "../src/assets/dev.svg"; // <-- remove /src

import { AppRoute } from "../types";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: "Home", path: AppRoute.HOME },
    { icon: MessageSquare, label: "AI Chat", path: AppRoute.CHAT },
    { icon: ImageIcon, label: "Image Gen", path: AppRoute.IMAGE_GEN },
    { icon: Calendar, label: "Study Planner", path: AppRoute.PLANNER },
    { icon: Timer, label: "Focus Timer", path: AppRoute.TIMER },
    { icon: Library, label: "Flashcards", path: AppRoute.FLASHCARDS },
    { icon: FileText, label: "Summarizer", path: AppRoute.SUMMARY },
    { icon: ListChecks, label: "MCQ Generator", path: AppRoute.MCQ },
  ];

  const bottomItem = {
    icon: Dev,
    label: "Developer",
    path: AppRoute.Developer,
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
        fixed top-0 left-0 z-50 h-full w-64 bg-white dark:bg-slate-800 shadow-xl transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static md:block flex flex-col
      `}
      >
        <div className="p-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-indigo-600">
            Student AI
          </h1>
          <button
            onClick={onClose}
            className="md:hidden text-slate-500 hover:text-slate-700"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => window.innerWidth < 768 && onClose()}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                  ${
                    isActive
                      ? "bg-brand-500 text-white shadow-md shadow-brand-500/30"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200"
                  }
                `}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Developer Link at Bottom */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700">
          <Link
            to={bottomItem.path}
            onClick={() => window.innerWidth < 768 && onClose()}
            className={`
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
              ${
                location.pathname === bottomItem.path
                  ? "bg-brand-500 text-white shadow-md shadow-brand-500/30"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-200"
              }
            `}
          >
            <img
              src={bottomItem.icon}
              alt="Developer"
              className="w-5 h-5 bg-white rounded-full"
            />
            <span className="font-medium">{bottomItem.label}</span>
          </Link>
        </div>
      </aside>
    </>
  );
};
