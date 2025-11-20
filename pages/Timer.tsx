import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";

export const Timer = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<"focus" | "short" | "long">("focus");

  useEffect(() => {
    let interval: number | undefined;

    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Play sound or notify here
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    if (mode === "focus") setTimeLeft(25 * 60);
    if (mode === "short") setTimeLeft(5 * 60);
    if (mode === "long") setTimeLeft(15 * 60);
  };

  const switchMode = (newMode: "focus" | "short" | "long") => {
    setMode(newMode);
    setIsActive(false);
    if (newMode === "focus") setTimeLeft(25 * 60);
    if (newMode === "short") setTimeLeft(5 * 60);
    if (newMode === "long") setTimeLeft(15 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Calculate progress for ring
  const totalTime =
    mode === "focus" ? 25 * 60 : mode === "short" ? 5 * 60 : 15 * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 283; // 283 is circ of r=45

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 w-full max-w-md">
        <div className="flex justify-center gap-2 mb-10">
          {["focus", "short", "long"].map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m as any)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all capitalize ${
                mode === m
                  ? "bg-brand-500 text-white shadow-lg shadow-brand-500/30"
                  : "text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              {m === "short"
                ? "Short Break"
                : m === "long"
                ? "Long Break"
                : "Focus"}
            </button>
          ))}
        </div>

        <div className="relative w-64 h-64 mx-auto mb-10">
          {/* SVG Ring */}
          <svg
            className="w-full h-full transform -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              className="text-slate-100 dark:text-slate-700"
              strokeWidth="4"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              className={`${
                mode === "focus" ? "text-brand-500" : "text-emerald-500"
              } transition-all duration-1000 ease-linear`}
              strokeWidth="4"
              strokeDasharray="283"
              strokeDashoffset={progress}
              strokeLinecap="round"
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-6xl font-bold tabular-nums tracking-tighter">
              {formatTime(timeLeft)}
            </span>
            <span className="text-slate-400 uppercase tracking-widest text-xs font-semibold mt-2">
              {isActive ? "Running" : "Paused"}
            </span>
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={toggleTimer}
            className={`
              w-16 h-16 rounded-2xl flex items-center justify-center text-white text-xl transition-all shadow-lg
              ${
                isActive
                  ? "bg-amber-500 hover:bg-amber-600"
                  : "bg-brand-500 hover:bg-brand-600 hover:scale-105"
              }
            `}
          >
            {isActive ? (
              <Pause fill="currentColor" />
            ) : (
              <Play fill="currentColor" className="ml-1" />
            )}
          </button>
          <button
            onClick={resetTimer}
            className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
          >
            <RotateCcw size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};
