import { useState } from "react";
import { generateImage } from "../services/gemini";
import { Image as ImageIcon, Wand2, Loader2, Download } from "lucide-react";

export const ImageGen = () => {
  const [prompt, setPrompt] = useState("");
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setError("");
    setImageSrc(null);

    try {
      const result = await generateImage(prompt);
      setImageSrc(result);
    } catch (err) {
      setError("Failed to generate image. Please try a different prompt.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 px-4 sm:px-6 lg:px-0">
      {/* Header */}
      <div className="text-center mb-4 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 text-slate-900 dark:text-white">
          AI Image Generator
        </h1>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 px-2">
          Create visual aids, diagrams, or artwork for your projects using FLUX.
        </p>
      </div>

      {/* Main Content Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl sm:rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-4 sm:p-6">
        {/* Input Section */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4 sm:mb-6">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && !loading && prompt && handleGenerate()
            }
            placeholder="Describe the image (e.g., 'A diagram of a plant cell')..."
            className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-brand-500 transition-all"
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !prompt}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-pink-600 hover:bg-pink-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2 shadow-md shadow-pink-600/20"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={18} />
                <span className="sm:inline">Generating...</span>
              </>
            ) : (
              <>
                <Wand2 size={18} />
                <span>Generate</span>
              </>
            )}
          </button>
        </div>

        {/* Image Display Area */}
        <div className="aspect-square w-full max-w-lg mx-auto bg-slate-100 dark:bg-slate-900 rounded-xl sm:rounded-2xl flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 overflow-hidden relative">
          {/* Loading Overlay */}
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm z-10">
              <Loader2
                size={40}
                className="sm:w-12 sm:h-12 animate-spin text-pink-600 mb-3 sm:mb-4"
              />
              <p className="font-medium text-sm sm:text-base text-slate-600 dark:text-slate-300 px-4 text-center">
                Creating masterpiece...
              </p>
            </div>
          )}

          {/* Generated Image */}
          {imageSrc ? (
            <div className="relative group w-full h-full">
              <img
                src={imageSrc}
                alt="Generated"
                className="w-full h-full object-cover"
              />

              {/* Desktop Hover Overlay */}
              <div className="hidden sm:flex absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity items-center justify-center">
                <a
                  href={imageSrc}
                  download={`student-ai-${Date.now()}.jpg`}
                  className="bg-white text-slate-900 px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-slate-100 transition-colors"
                >
                  <Download size={18} /> Download
                </a>
              </div>

              {/* Mobile Download Button */}
              <div className="sm:hidden absolute bottom-3 right-3">
                <a
                  href={imageSrc}
                  download={`student-ai-${Date.now()}.jpg`}
                  className="bg-white/90 backdrop-blur-sm text-slate-900 p-3 rounded-full shadow-lg flex items-center justify-center hover:bg-white transition-colors"
                  aria-label="Download image"
                >
                  <Download size={20} />
                </a>
              </div>
            </div>
          ) : (
            // Placeholder
            <div className="text-center text-slate-400 p-4 sm:p-8">
              <ImageIcon
                size={48}
                className="sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 opacity-50"
              />
              <p className="text-sm sm:text-base px-4">
                Your generated image will appear here
              </p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg">
            <p className="text-red-600 dark:text-red-400 text-center text-sm sm:text-base">
              {error}
            </p>
          </div>
        )}

        {/* Tips Section (Optional) */}
        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 text-center">
            <span className="font-semibold">💡 Tip:</span> Be specific in your
            descriptions for better results
          </p>
        </div>
      </div>

      {/* Mobile Keyboard Spacer */}
      <div className="h-4 sm:hidden" />
    </div>
  );
};
