import { useState, useRef } from "react";
import { useStore } from "../store";
import type { MCQSet } from "../types";
import { generateMCQ } from "../services/gemini";
import { extractTextFromFile } from "../utils/documentParser";
import { jsPDF } from "jspdf";
import {
  Upload,
  ListChecks,
  Loader2,
  Download,
  FileText,
  Trash2,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

export const MCQGenerator = () => {
  const { addMCQSet, mcqSets, deleteMCQSet } = useStore();

  // State
  const [file, setFile] = useState<File | null>(null);
  const [questionCount, setQuestionCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generatedSet, setGeneratedSet] = useState<MCQSet | null>(null);
  const [revealedAnswers, setRevealedAnswers] = useState<Set<string>>(
    new Set()
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate Logic
  const handleGenerate = async () => {
    if (!file) {
      setError("Please upload a document first.");
      return;
    }

    setLoading(true);
    setError("");
    setGeneratedSet(null);

    try {
      const text = await extractTextFromFile(file);

      if (text.trim().length < 50) {
        throw new Error("Document is too short or empty.");
      }

      const questions = await generateMCQ(text, questionCount);

      const newSet: MCQSet = {
        id: Date.now().toString(),
        title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
        questions: questions.map((q: any, i: number) => ({
          id: `${Date.now()}-${i}`,
          ...q,
        })),
        timestamp: Date.now(),
      };

      setGeneratedSet(newSet);
      addMCQSet(newSet); // Auto save
    } catch (err) {
      console.error(err);
      setError(
        "Failed to generate questions. " +
          (err instanceof Error ? err.message : "")
      );
    } finally {
      setLoading(false);
    }
  };

  // PDF Download Logic
  const handleDownloadPDF = () => {
    if (!generatedSet) return;

    const doc = new jsPDF();
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // const lineHeight = 10;
    let cursorY = 20;

    // -------------------------
    // HEADER (Letterhead)
    // -------------------------
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text("Student AI Workspace", margin, cursorY);

    cursorY += 10;

    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text("Automated MCQ Generator", margin, cursorY);

    // Divider Line
    cursorY += 8;
    doc.setDrawColor(180);
    doc.line(margin, cursorY, pageWidth - margin, cursorY);

    cursorY += 12;

    // -------------------------
    // QUIZ TITLE
    // -------------------------
    doc.setFontSize(16);
    doc.setTextColor(20, 20, 20);
    doc.text(`Quiz: ${generatedSet.title}`, margin, cursorY);

    cursorY += 12;

    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);

    // -------------------------
    // QUESTIONS
    // -------------------------
    const addFooter = () => {
      doc.setFontSize(10);
      doc.setTextColor(120);

      doc.text(
        "Student AI • Developed by Iresh Nimantha",
        margin,
        pageHeight - 20
      );

      doc.textWithLink("GitHub", margin, pageHeight - 14, {
        url: "https://github.com/Iresh-Nimantha",
      });

      doc.textWithLink("LinkedIn", margin + 25, pageHeight - 14, {
        url: "https://www.linkedin.com/in/ireshnimantha/",
      });
    };

    generatedSet.questions.forEach((q, idx) => {
      if (cursorY > pageHeight - 30) {
        addFooter();
        doc.addPage();
        cursorY = 20;
      }

      const questionText = `${idx + 1}. ${q.question}`;
      const splitQuestion = doc.splitTextToSize(
        questionText,
        pageWidth - margin * 2
      );
      doc.text(splitQuestion, margin, cursorY);
      cursorY += splitQuestion.length * 7;

      q.options.forEach((opt, oIdx) => {
        if (cursorY > pageHeight - 30) {
          addFooter();
          doc.addPage();
          cursorY = 20;
        }

        const label = String.fromCharCode(65 + oIdx);
        doc.text(`   ${label}) ${opt}`, margin, cursorY);
        cursorY += 6;
      });

      cursorY += 6;
    });

    // -------------------------
    // ANSWER KEY
    // -------------------------
    doc.addPage();
    cursorY = 20;

    doc.setFontSize(18);
    doc.text("Answer Key", margin, cursorY);
    cursorY += 12;

    doc.setFontSize(12);

    generatedSet.questions.forEach((q, idx) => {
      if (cursorY > pageHeight - 30) {
        addFooter();
        doc.addPage();
        cursorY = 20;
      }

      doc.text(`${idx + 1}. ${q.correctAnswer}`, margin, cursorY);
      cursorY += 6;

      const explanation = `Explanation: ${q.explanation}`;
      const splitExpl = doc.splitTextToSize(
        explanation,
        pageWidth - margin * 2
      );

      doc.text(splitExpl, margin, cursorY);
      cursorY += splitExpl.length * 6 + 6;
    });

    // Final footer
    addFooter();

    // -------------------------
    // SAVE FILE
    // -------------------------
    doc.save(`${generatedSet.title}-quiz.pdf`);
  };

  const toggleAnswer = (id: string) => {
    const newSet = new Set(revealedAnswers);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setRevealedAnswers(newSet);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            MCQ Generator
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Turn any document into a multiple-choice quiz with explanations.
          </p>
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700">
        <div className="grid md:grid-cols-2 gap-8">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Upload Document
            </label>
            {!file ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer h-48 flex flex-col items-center justify-center"
              >
                <Upload className="text-slate-400 mb-3" size={32} />
                <span className="text-brand-500 font-medium">
                  Click to upload
                </span>
                <span className="text-xs text-slate-400 mt-1">
                  PDF, DOCX, TXT
                </span>
              </div>
            ) : (
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex items-center justify-between bg-slate-50 dark:bg-slate-900 h-48">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                    <FileText size={24} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate text-slate-900 dark:text-white">
                      {file.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setFile(null);
                    setGeneratedSet(null);
                  }}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 size={20} />
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

          {/* Settings */}
          <div className="flex flex-col justify-center">
            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Number of Questions: {questionCount}
              </label>
              <input
                type="range"
                min="3"
                max="15"
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-2">
                <span>3</span>
                <span>15</span>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !file}
              className="w-full py-4 bg-brand-500 hover:bg-brand-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg shadow-lg shadow-brand-500/25 transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" /> Generating...
                </>
              ) : (
                <>
                  <ListChecks size={20} /> Generate Quiz
                </>
              )}
            </button>

            {error && (
              <p className="text-red-500 text-sm mt-3 text-center">{error}</p>
            )}
          </div>
        </div>
      </div>

      {/* Results Area */}
      {generatedSet && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <CheckCircle className="text-emerald-500" />
              Quiz Ready: {generatedSet.questions.length} Questions
            </h2>
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Download size={18} /> Download PDF
            </button>
          </div>

          <div className="grid gap-6">
            {generatedSet.questions.map((q, idx) => (
              <div
                key={q.id}
                className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700"
              >
                <div className="flex gap-4">
                  <span className="flex-shrink-0 w-8 h-8 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-full flex items-center justify-center font-bold text-sm">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-4">
                      {q.question}
                    </h3>

                    <div className="space-y-3 mb-6">
                      {q.options.map((opt, optIdx) => (
                        <div
                          key={optIdx}
                          className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 text-sm"
                        >
                          <span className="font-semibold mr-2">
                            {String.fromCharCode(65 + optIdx)}.
                          </span>
                          {opt}
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => toggleAnswer(q.id)}
                      className="text-sm font-medium text-brand-500 flex items-center gap-1 hover:underline"
                    >
                      {revealedAnswers.has(q.id) ? (
                        <>
                          Hide Answer <ChevronUp size={16} />
                        </>
                      ) : (
                        <>
                          Show Answer <ChevronDown size={16} />
                        </>
                      )}
                    </button>

                    {revealedAnswers.has(q.id) && (
                      <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/30 rounded-xl">
                        <p className="font-bold text-emerald-700 dark:text-emerald-400 mb-1 flex items-center gap-2">
                          <CheckCircle size={16} /> Correct Answer:{" "}
                          {q.correctAnswer}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          <span className="font-semibold">Explanation:</span>{" "}
                          {q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History (Optional: Shows saved sets) */}
      {mcqSets.length > 0 && !generatedSet && (
        <div className="mt-12">
          <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">
            Saved Quizzes
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {mcqSets.map((set) => (
              <div
                key={set.id}
                className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center cursor-pointer hover:shadow-md transition-all"
                onClick={() => setGeneratedSet(set)}
              >
                <div>
                  <h4 className="font-bold">{set.title}</h4>
                  <p className="text-xs text-slate-500">
                    {new Date(set.timestamp).toLocaleDateString()} •{" "}
                    {set.questions.length} Qs
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteMCQSet(set.id);
                  }}
                  className="p-2 text-slate-400 hover:text-red-500"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
