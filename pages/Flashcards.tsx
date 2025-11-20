import { useState, useRef } from "react";
import { useStore } from "../store";
import type { FlashcardSet } from "../types";
import { generateFlashcards } from "../services/gemini";
import { extractTextFromFile } from "../utils/documentParser";
import {
  Plus,
  Upload,
  BookOpen,
  BrainCircuit,
  Trash2,
  Loader2,
  ArrowLeft,
  ArrowRight,
  RotateCw,
  Library,
  FileText,
} from "lucide-react";

export const Flashcards = () => {
  const { flashcardSets, addFlashcardSet, deleteFlashcardSet } = useStore();
  const [view, setView] = useState<"list" | "create" | "study">("list");
  const [currentSet, setCurrentSet] = useState<FlashcardSet | null>(null);

  // Creation State
  const [title, setTitle] = useState("");
  const [cardCount, setCardCount] = useState(5);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Study State
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const resetCreation = () => {
    setTitle("");
    setFile(null);
    setError("");
    setCardCount(5);
  };

  const handleCreateSet = async () => {
    if (!title) {
      setError("Please enter a title/topic for your set.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      let contextText = "";
      if (file) {
        contextText = await extractTextFromFile(file);
      }

      const result = await generateFlashcards(title, cardCount, contextText);
      const cardsData = result!;

      const newSet: FlashcardSet = {
        id: Date.now().toString(),
        title: title,
        cards: cardsData.map((c: any, i: number) => ({
          id: `${Date.now()}-${i}`,
          front: c.front,
          back: c.back,
          setId: Date.now().toString(),
        })),
      };

      addFlashcardSet(newSet);
      setCurrentSet(newSet);
      setCurrentCardIndex(0);
      setIsFlipped(false);
      setView("study");
      resetCreation();
    } catch (err) {
      setError("Failed to generate flashcards. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStudy = (set: FlashcardSet) => {
    setCurrentSet(set);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setView("study");
  };

  const handleNextCard = () => {
    if (!currentSet) return;
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex((prev) => (prev + 1) % currentSet.cards.length);
    }, 150);
  };

  const handlePrevCard = () => {
    if (!currentSet) return;
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentCardIndex(
        (prev) => (prev - 1 + currentSet.cards.length) % currentSet.cards.length
      );
    }, 150);
  };

  const renderListView = () => (
    <div className="space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Flashcards
          </h1>
          <p className="text-slate-500 mt-1">
            Review your decks or create new ones from documents.
          </p>
        </div>
        <button
          onClick={() => setView("create")}
          className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-medium transition-colors shadow-md shadow-brand-500/20"
        >
          <Plus size={20} />
          Create New Set
        </button>
      </header>

      {flashcardSets.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="w-20 h-20 bg-brand-100 dark:bg-brand-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Library size={40} className="text-brand-600 dark:text-brand-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            No Flashcards Yet
          </h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-8">
            Upload a document or pick a topic, and our AI will generate a study
            set for you instantly.
          </p>
          <button
            onClick={() => setView("create")}
            className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-medium"
          >
            Get Started
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flashcardSets.map((set) => (
            <div
              key={set.id}
              className="group relative bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-200 dark:border-slate-700 cursor-pointer flex flex-col"
              onClick={() => handleStudy(set)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <BrainCircuit size={24} />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFlashcardSet(set.id);
                  }}
                  className="text-slate-400 hover:text-red-500 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-1">
                {set.title}
              </h3>
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mt-auto">
                <BookOpen size={16} />
                <span>{set.cards.length} cards</span>
              </div>

              <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-brand-500 to-indigo-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-b-2xl" />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderCreateView = () => (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => setView("list")}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        Back to Library
      </button>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
          <BrainCircuit className="text-brand-500" />
          Generate New Set
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Set Title / Topic
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Photosynthesis, World War II, React Hooks"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Source Material (Optional)
            </label>

            {!file ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
              >
                <Upload className="mx-auto h-10 w-10 text-slate-400 mb-2" />
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Click to upload a PDF or DOCX
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  We'll generate questions based on your file content
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <FileText size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-slate-900 dark:text-white">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setFile(null)}
                  className="text-slate-400 hover:text-red-500 p-2"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => e.target.files && setFile(e.target.files[0])}
              accept=".pdf,.docx,.txt"
              className="hidden"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Number of Cards: {cardCount}
            </label>
            <input
              type="range"
              min="3"
              max="20"
              value={cardCount}
              onChange={(e) => setCardCount(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/30">
              {error}
            </p>
          )}

          <button
            onClick={handleCreateSet}
            disabled={loading || !title}
            className="w-full py-4 bg-brand-500 hover:bg-brand-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" /> Generating...
              </>
            ) : (
              "Generate Flashcards"
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const renderStudyView = () => {
    if (!currentSet) return null;
    const currentCard = currentSet.cards[currentCardIndex];

    return (
      <div className="max-w-3xl mx-auto h-full flex flex-col">
        <button
          onClick={() => setView("list")}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Library
        </button>

        <div className="flex-1 flex flex-col items-center justify-center min-h-[500px]">
          {/* Progress */}
          <div className="w-full mb-8 flex items-center justify-between text-sm font-medium text-slate-500">
            <span>
              Card {currentCardIndex + 1} of {currentSet.cards.length}
            </span>
            <span>{currentSet.title}</span>
          </div>

          {/* Card Container */}
          <div className="relative w-full max-w-xl aspect-[3/2] perspective-1000 group">
            <div
              className={`relative w-full h-full transition-all duration-500 transform-style-3d cursor-pointer ${
                isFlipped ? "rotate-y-180" : ""
              }`}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              {/* Front */}
              <div className="absolute inset-0 w-full h-full bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 backface-hidden flex items-center justify-center p-10 text-center">
                <div>
                  <p className="text-xs uppercase tracking-widest text-brand-500 font-bold mb-4">
                    Question
                  </p>
                  <p className="text-2xl font-medium text-slate-900 dark:text-white leading-relaxed">
                    {currentCard.front}
                  </p>
                </div>
                <p className="absolute bottom-6 text-slate-400 text-xs flex items-center gap-1">
                  <RotateCw size={12} /> Click to flip
                </p>
              </div>

              {/* Back */}
              <div className="absolute inset-0 w-full h-full bg-slate-900 dark:bg-black rounded-3xl shadow-xl backface-hidden rotate-y-180 flex items-center justify-center p-10 text-center text-white">
                <div>
                  <p className="text-xs uppercase tracking-widest text-emerald-400 font-bold mb-4">
                    Answer
                  </p>
                  <p className="text-xl leading-relaxed">{currentCard.back}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-8 mt-12">
            <button
              onClick={handlePrevCard}
              className="p-4 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:scale-110 transition-transform shadow-sm"
            >
              <ArrowLeft size={24} />
            </button>

            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="px-8 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl font-medium shadow-lg shadow-brand-500/25 transition-colors"
            >
              {isFlipped ? "Show Question" : "Show Answer"}
            </button>

            <button
              onClick={handleNextCard}
              className="p-4 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:scale-110 transition-transform shadow-sm"
            >
              <ArrowRight size={24} />
            </button>
          </div>
        </div>

        {/* Tailwind Utilities for 3D flip */}
        <style>{`
          .perspective-1000 { perspective: 1000px; }
          .transform-style-3d { transform-style: preserve-3d; }
          .backface-hidden { backface-visibility: hidden; }
          .rotate-y-180 { transform: rotateY(180deg); }
        `}</style>
      </div>
    );
  };

  return (
    <div>
      {view === "list" && renderListView()}
      {view === "create" && renderCreateView()}
      {view === "study" && renderStudyView()}
    </div>
  );
};
