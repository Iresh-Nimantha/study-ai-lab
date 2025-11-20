import { useState, useRef } from "react";
import { Upload, Loader2, BookOpen, List, Type, Trash2 } from "lucide-react";
import { extractTextFromFile } from "../utils/documentParser";
import { generateSummary, generateFlashcards } from "../services/gemini";
import { useStore } from "../store";
import type { SummarySession, FlashcardSet } from "../types";

export const Summary = () => {
  const { addSummary, deleteSummary, summaries, addFlashcardSet } = useStore();
  const [, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("");
  const [currentSummary, setCurrentSummary] = useState<SummarySession | null>(
    null
  );
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setError("");

      // Auto-process file selection
      await processFile(selectedFile);
    }
  };

  const processFile = async (selectedFile: File) => {
    setLoading(true);
    setProcessingStatus("Extracting text from document...");
    setError("");

    try {
      const text = await extractTextFromFile(selectedFile);

      if (text.trim().length < 50) {
        throw new Error(
          "The document appears to be empty or could not be read clearly."
        );
      }

      setProcessingStatus("Analyzing with Gemini AI...");
      const analysis = await generateSummary(text);

      const newSummary: SummarySession = {
        id: Date.now().toString(),
        title: selectedFile.name,
        originalText: text,
        summary: analysis.summary,
        keyPoints: analysis.keyPoints,
        definitions: analysis.definitions,
        timestamp: Date.now(),
      };

      setCurrentSummary(newSummary);
      addSummary(newSummary);
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setLoading(false);
      setProcessingStatus("");
    }
  };

  const handleConvertToFlashcards = async () => {
    if (!currentSummary) return;

    setLoading(true);
    setProcessingStatus("Generating flashcards from summary...");

    try {
      // Use the key terms to generate flashcards
      const flashcardDataString = await generateFlashcards(
        `the following terms: ${currentSummary.definitions
          .map((d) => d.term)
          .join(", ")}. Context: ${currentSummary.summary}`,
        currentSummary.definitions.length > 0
          ? currentSummary.definitions.length
          : 5
      );

      let flashcards = [];
      try {
        if (typeof flashcardDataString === "string") {
          flashcards = JSON.parse(flashcardDataString);
        } else if (Array.isArray(flashcardDataString)) {
          flashcards = flashcardDataString;
        } else {
          throw new Error("Flashcard data is not in a recognized format.");
        }
      } catch (e) {
        // Fallback if raw text
        console.error("Failed to parse flashcards JSON", e);
        throw new Error("Failed to generate structured flashcards.");
      }

      const newSet: FlashcardSet = {
        id: Date.now().toString(),
        title: `Study Set: ${currentSummary.title}`,
        cards: flashcards.map((fc: any, idx: number) => ({
          id: `${Date.now()}-${idx}`,
          front: fc.front,
          back: fc.back,
          setId: Date.now().toString(),
        })),
      };

      addFlashcardSet(newSet);
      alert("Flashcard set created! Check the Flashcards tab.");
    } catch (err) {
      setError("Failed to convert to flashcards.");
    } finally {
      setLoading(false);
      setProcessingStatus("");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            AI Summarizer
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Upload documents to get instant summaries, key points, and study
            terms.
          </p>
        </div>
      </div>

      {/* Upload Section */}
      {!currentSummary && !loading && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-12 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer group"
        >
          <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900/30 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Upload className="text-brand-600 dark:text-brand-400" size={32} />
          </div>
          <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200 mb-2">
            Click to upload document
          </h3>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Supports PDF, DOCX, and TXT files
          </p>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,.docx,.txt"
            className="hidden"
          />
          <button className="px-6 py-2.5 bg-brand-500 text-white rounded-xl font-medium shadow-sm hover:bg-brand-600 transition-colors">
            Select File
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="animate-spin text-brand-500 mb-4" size={48} />
          <h3 className="text-xl font-medium text-slate-700 dark:text-slate-200 animate-pulse">
            {processingStatus}
          </h3>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl border border-red-100 dark:border-red-900/30 text-center">
          {error}
          <button
            onClick={() => setError("")}
            className="block mx-auto mt-2 text-sm underline hover:no-underline"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Results Section */}
      {currentSummary && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Summary Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-4 text-brand-600 dark:text-brand-400">
                <BookOpen size={24} />
                <h2 className="text-xl font-bold">Summary</h2>
              </div>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {currentSummary.summary}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-4 text-emerald-600 dark:text-emerald-400">
                <List size={24} />
                <h2 className="text-xl font-bold">Key Points</h2>
              </div>
              <ul className="space-y-3">
                {currentSummary.keyPoints.map((point, idx) => (
                  <li
                    key={idx}
                    className="flex gap-3 text-slate-700 dark:text-slate-300"
                  >
                    <span className="mt-1.5 w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
              <div className="flex items-center gap-3 mb-4 text-purple-600 dark:text-purple-400">
                <Type size={24} />
                <h2 className="text-xl font-bold">Key Terms & Definitions</h2>
              </div>
              <div className="grid gap-4">
                {currentSummary.definitions.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 bg-slate-50 dark:bg-slate-700/30 rounded-xl border border-slate-100 dark:border-slate-700"
                  >
                    <span className="font-bold text-slate-900 dark:text-white block mb-1">
                      {item.term}
                    </span>
                    <span className="text-slate-600 dark:text-slate-400 text-sm">
                      {item.definition}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Actions & History */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 sticky top-6">
              <h3 className="font-bold text-slate-900 dark:text-white mb-4">
                Actions
              </h3>
              <div className="space-y-3">
                <button
                  onClick={handleConvertToFlashcards}
                  className="w-full py-3 px-4 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-md shadow-brand-500/20"
                >
                  <List size={18} />
                  Convert to Flashcards
                </button>
                <button
                  onClick={() => {
                    setCurrentSummary(null);
                    setFile(null);
                  }}
                  className="w-full py-3 px-4 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <Upload size={18} />
                  Upload New File
                </button>
              </div>

              <h3 className="font-bold text-slate-900 dark:text-white mt-8 mb-4">
                Recent Summaries
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {summaries.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => setCurrentSummary(s)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all text-sm flex justify-between items-center group
                      ${
                        currentSummary.id === s.id
                          ? "bg-brand-50 dark:bg-brand-900/20 border-brand-200 dark:border-brand-800"
                          : "bg-slate-50 dark:bg-slate-700/30 border-transparent hover:bg-slate-100 dark:hover:bg-slate-700"
                      }
                    `}
                  >
                    <div className="truncate mr-2">
                      <p className="font-medium truncate text-slate-800 dark:text-slate-200">
                        {s.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(s.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteSummary(s.id);
                        if (currentSummary.id === s.id) setCurrentSummary(null);
                      }}
                      className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {summaries.length === 0 && (
                  <p className="text-sm text-slate-400 text-center py-2">
                    No saved summaries
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
