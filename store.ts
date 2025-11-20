import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  Theme,
  type Task,
  type FlashcardSet,
  type ChatMessage,
  type SummarySession,
  type MCQSet,
} from "./types";

interface AppState {
  theme: Theme;
  user: { name: string; email: string } | null;

  tasks: Task[];
  flashcardSets: FlashcardSet[];
  mcqSets: MCQSet[];
  chatHistory: ChatMessage[];
  summaries: SummarySession[];

  setTheme: (theme: Theme) => void;
  setUser: (user: { name: string; email: string } | null) => void;

  addTask: (task: Task) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;

  addFlashcardSet: (set: FlashcardSet) => void;
  deleteFlashcardSet: (id: string) => void;

  addMCQSet: (set: MCQSet) => void;
  deleteMCQSet: (id: string) => void;

  addChatMessage: (message: ChatMessage) => void;
  clearChat: () => void;

  addSummary: (summary: SummarySession) => void;
  deleteSummary: (id: string) => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      theme: Theme.SYSTEM,
      user: null,

      // Clean initial state — NO MOCK DATA
      tasks: [],
      flashcardSets: [],
      mcqSets: [],
      chatHistory: [],
      summaries: [],

      setTheme: (theme) => set({ theme }),
      setUser: (user) => set({ user }),

      addTask: (task) =>
        set((state) => ({
          tasks: [...state.tasks, task],
        })),

      toggleTask: (id) =>
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === id ? { ...t, completed: !t.completed } : t
          ),
        })),

      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        })),

      addFlashcardSet: (newSet) =>
        set((state) => ({
          flashcardSets: [...state.flashcardSets, newSet],
        })),

      deleteFlashcardSet: (id) =>
        set((state) => ({
          flashcardSets: state.flashcardSets.filter((s) => s.id !== id),
        })),

      addMCQSet: (newSet) =>
        set((state) => ({
          mcqSets: [...state.mcqSets, newSet],
        })),

      deleteMCQSet: (id) =>
        set((state) => ({
          mcqSets: state.mcqSets.filter((s) => s.id !== id),
        })),

      addChatMessage: (message) =>
        set((state) => ({
          chatHistory: [...state.chatHistory, message],
        })),

      clearChat: () => set({ chatHistory: [] }),

      addSummary: (summary) =>
        set((state) => ({
          summaries: [summary, ...state.summaries],
        })),

      deleteSummary: (id) =>
        set((state) => ({
          summaries: state.summaries.filter((s) => s.id !== id),
        })),
    }),

    {
      name: "study-app-storage", // localStorage key for entire app
    }
  )
);
