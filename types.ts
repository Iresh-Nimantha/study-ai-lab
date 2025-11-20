// types.ts

// Theme as const object + union type (replaces enum)
export const Theme = {
  LIGHT: "light",
  DARK: "dark",
  SYSTEM: "system",
} as const; // fully erasable, no emitted enum code [web:19][web:27]
export type Theme = (typeof Theme)[keyof typeof Theme]; // "light" | "dark" | "system" [web:19][web:27]

// AppRoute as const object + union type (replaces enum)
export const AppRoute = {
  HOME: "/",
  CHAT: "/chat",
  IMAGE_GEN: "/image-gen",
  PLANNER: "/planner",
  TIMER: "/timer",
  FLASHCARDS: "/flashcards",
  SUMMARY: "/summary",
  MCQ: "/mcq",
  Developer: "/developer",
} as const; // object literal stays at runtime; keys are read-only [web:19][web:27]
export type AppRoute = (typeof AppRoute)[keyof typeof AppRoute]; // "/" | "/chat" | ... [web:19][web:27]

// Data models (interfaces are erasable and safe)
export interface Task {
  id: string;
  title: string;
  completed: boolean;
  date: string;
  category: "study" | "assignment" | "exam" | "other";
} // interfaces are removed at emit and allowed under erasableSyntaxOnly [web:27][web:28]

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  setId: string;
} // purely type-level, no runtime output [web:27][web:28]

export interface FlashcardSet {
  id: string;
  title: string;
  cards: Flashcard[];
} // compatible with verbatim and erasable-only settings [web:27][web:28]

export interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
} // standard erasable interface [web:27][web:28]

export interface MCQSet {
  id: string;
  title: string;
  questions: MCQQuestion[];
  timestamp: number;
} // no emitted code from interfaces [web:27][web:28]

export interface TermDefinition {
  term: string;
  definition: string;
} // erased at compile time [web:27][web:28]

export interface SummarySession {
  id: string;
  title: string;
  originalText: string;
  summary: string;
  keyPoints: string[];
  definitions: TermDefinition[];
  timestamp: number;
} // TS-only structure, OK with erasable-only [web:27][web:28]

export interface ChatAttachment {
  id: string;
  type: "image" | "file";
  name: string;
  mimeType?: string;
  data: string; // base64 for images, raw text for files
} // string literal unions are erasable [web:27][web:28]

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  text: string;
  timestamp: number;
  attachments?: ChatAttachment[];
} // no runtime impact [web:27][web:28]

export interface GeneratedImage {
  url: string;
  prompt: string;
  timestamp: number;
} // interface-only typing [web:27][web:28]
