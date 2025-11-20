import { useState, useEffect } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Sidebar } from "../components/Sidebar";
import { Home } from "../pages/Home";
import { Chat } from "../pages/Chat";
import { ImageGen } from "../pages/ImageGen";
import Developer from "../pages/Developer";
import { Planner } from "../pages/Planner";
import { Timer } from "../pages/Timer";
import { Summary } from "../pages/Summary";
import { Flashcards } from "../pages/Flashcards";
import { MCQGenerator } from "../pages/MCQGenerator";
import { AppRoute, Theme } from "../types";
import { useStore } from "../store";
import { Menu } from "lucide-react";

const AppContent = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme } = useStore();

  // Theme Handling
  useEffect(() => {
    const root = window.document.documentElement;
    const isDark =
      theme === Theme.DARK ||
      (theme === Theme.SYSTEM &&
        window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  return (
    <Router>
      <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden transition-colors duration-200">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <div className="flex-1 flex flex-col h-full overflow-hidden text-white">
          {/* Mobile Header */}
          <header className="md:hidden flex items-center p-4 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2"
            >
              <Menu />
            </button>
            <span className="font-bold text-lg ml-2 text-white">
              Student AI
            </span>
          </header>

          {/* Main Scroll Area */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
            <Routes>
              <Route path={AppRoute.HOME} element={<Home />} />
              <Route path={AppRoute.CHAT} element={<Chat />} />
              <Route path={AppRoute.IMAGE_GEN} element={<ImageGen />} />
              <Route path={AppRoute.PLANNER} element={<Planner />} />
              <Route path={AppRoute.TIMER} element={<Timer />} />
              <Route path={AppRoute.FLASHCARDS} element={<Flashcards />} />
              <Route path={AppRoute.SUMMARY} element={<Summary />} />
              <Route path={AppRoute.MCQ} element={<MCQGenerator />} />
              <Route path={AppRoute.Developer} element={<Developer />} />
              <Route
                path="*"
                element={<Navigate to={AppRoute.HOME} replace />}
              />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
};

export default AppContent;
