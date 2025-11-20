import { useState, useRef, useEffect } from "react";
import { useStore } from "../store";
import {
  Send,
  Loader2,
  Bot,
  User,
  Trash2,
  Paperclip,
  X,
  Copy,
  Download,
  Check,
  FileText,
} from "lucide-react";
import { generateChatResponse } from "../services/gemini"; // unchanged import path to preserve wiring
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { extractTextFromFile } from "../utils/documentParser";
import type { ChatAttachment } from "../types";

export const Chat = () => {
  const { chatHistory, addChatMessage, clearChat } = useStore();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, attachments, loading]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIsProcessingFile(true);

      try {
        // Allow image/*, and treat others as text docs already parsed by extractTextFromFile.
        if (file.type.startsWith("image/")) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            if (ev.target?.result) {
              const newAtt: ChatAttachment = {
                id: Date.now().toString(),
                name: file.name,
                type: "image",
                mimeType: file.type,
                data: ev.target.result as string, // data URL
              };
              setAttachments((prev) => [...prev, newAtt]);
            }
          };
          reader.readAsDataURL(file);
        } else {
          const text = await extractTextFromFile(file);
          const newAtt: ChatAttachment = {
            id: Date.now().toString(),
            name: file.name,
            type: "file",
            data: text,
          };
          setAttachments((prev) => [...prev, newAtt]);
        }
      } catch (err) {
        console.error("File processing failed", err);
        alert("Could not process file. Please try a different file.");
      } finally {
        setIsProcessingFile(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSend = async () => {
    if ((!input.trim() && attachments.length === 0) || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      role: "user" as const,
      text: input,
      timestamp: Date.now(),
      attachments: [...attachments],
    };

    addChatMessage(userMsg);
    setInput("");
    setAttachments([]);
    setLoading(true);

    try {
      const recentHistory = chatHistory
        .slice(-10)
        .map((msg) => ({ role: msg.role, text: msg.text }));

      const responseText = await generateChatResponse(
        userMsg.text,
        recentHistory,
        userMsg.attachments
      );

      if (responseText) {
        addChatMessage({
          id: (Date.now() + 1).toString(),
          role: "model",
          text: responseText,
          timestamp: Date.now(),
        });
      }
    } catch (error: any) {
      // Friendly hint: HF free endpoints can rate-limit or be busy.
      console.error("Error generating chat response:", error);
      const friendly =
        "Sorry, a temporary processing issue occurred. Please retry in a moment or simplify the request.";
      addChatMessage({
        id: (Date.now() + 1).toString(),
        role: "model",
        text: friendly,
        timestamp: Date.now(),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownload = (text: string, id: string) => {
    const blob = new Blob([text], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-response-${id}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-[calc(100vh-2rem)] md:h-[calc(100vh-6rem)] flex flex-col bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
      {/* Chat Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-600 dark:text-brand-400">
            <Bot size={20} />
          </div>
          <div>
            <h2 className="font-bold text-sm md:text-base">Study Tutor</h2>
            <p className="text-xs text-slate-500">
              Powered by open-source models
            </p>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
          title="Clear Chat"
        >
          <Trash2 size={18} />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50/50 dark:bg-slate-900/50">
        {chatHistory.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
            <Bot size={48} className="mb-4 text-slate-400" />
            <h3 className="text-lg font-semibold">How can I help you study?</h3>
            <p className="text-sm max-w-xs mt-2">
              Upload notes to analyze, ask complex questions, or generate study
              guides.
            </p>
          </div>
        )}

        {chatHistory.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-4 ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "model" && (
              <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/30 flex-shrink-0 flex items-center justify-center mt-1">
                <Bot size={14} className="text-brand-600 dark:text-brand-400" />
              </div>
            )}

            <div
              className={`flex flex-col max-w-[85%] ${
                msg.role === "user" ? "items-end" : "items-start"
              }`}
            >
              {/* Attachments in history */}
              {msg.attachments && msg.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2 justify-end">
                  {msg.attachments.map((att) => (
                    <div
                      key={att.id}
                      className="bg-slate-100 dark:bg-slate-700 rounded-lg p-2 border border-slate-200 dark:border-slate-600 flex items-center gap-2"
                    >
                      {att.type === "image" ? (
                        <div className="relative group cursor-pointer">
                          <img
                            src={att.data}
                            alt={att.name}
                            className="w-16 h-16 object-cover rounded-md"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs px-2 py-1">
                          <FileText size={14} className="text-slate-500" />
                          <span className="truncate max-w-[150px]">
                            {att.name}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Message Bubble */}
              <div
                className={`
                  rounded-2xl px-5 py-4 shadow-sm text-sm leading-relaxed w-full
                  ${
                    msg.role === "user"
                      ? "bg-brand-500 text-white rounded-tr-sm"
                      : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-tl-sm"
                  }
                `}
              >
                {msg.role === "user" ? (
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                ) : (
                  <div className="markdown-body prose dark:prose-invert max-w-none prose-sm">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                )}
              </div>

              {/* Actions for model messages */}
              {msg.role === "model" && (
                <div className="flex gap-2 mt-2 ml-2">
                  <button
                    onClick={() => handleCopy(msg.text, msg.id)}
                    className="p-1.5 text-slate-400 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                    title="Copy Text"
                  >
                    {copiedId === msg.id ? (
                      <Check size={14} />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                  <button
                    onClick={() => handleDownload(msg.text, msg.id)}
                    className="p-1.5 text-slate-400 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
                    title="Download Markdown"
                  >
                    <Download size={14} />
                  </button>
                </div>
              )}
            </div>

            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex-shrink-0 flex items-center justify-center mt-1">
                <User
                  size={14}
                  className="text-slate-600 dark:text-slate-300"
                />
              </div>
            )}
          </div>
        ))}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900/30 flex-shrink-0 flex items-center justify-center">
              <Loader2
                size={14}
                className="animate-spin text-brand-600 dark:text-brand-400"
              />
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <span
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                ></span>
                <span
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                ></span>
                <span
                  className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                ></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Attachment Draft Preview */}
      {attachments.length > 0 && (
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex gap-2 overflow-x-auto">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="relative flex-shrink-0 bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-200 dark:border-slate-600 shadow-sm group"
            >
              <button
                onClick={() => removeAttachment(att.id)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                <X size={12} />
              </button>
              {att.type === "image" ? (
                <div className="w-16 h-16 rounded-md overflow-hidden">
                  <img
                    src={att.data}
                    alt={att.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-16 h-16 flex flex-col items-center justify-center text-xs text-center overflow-hidden">
                  <FileText size={20} className="text-slate-400 mb-1" />
                  <span className="truncate w-full">{att.name}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
        <div className="flex gap-2 items-end">
          {/* File Upload */}
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading || isProcessingFile}
            className="p-3 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors disabled:opacity-50"
            title="Attach file"
          >
            {isProcessingFile ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Paperclip size={20} />
            )}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            // Keep PDF/DOCX/TXT and images; HF captioning handles images, text is pre-extracted
            accept=".pdf,.docx,.txt,image/*"
          />

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={
              attachments.length > 0
                ? "Ask something about the file..."
                : "Ask anything..."
            }
            className="flex-1 resize-none max-h-32 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 transition-all"
            rows={1}
          />
          <button
            onClick={handleSend}
            disabled={
              (!input.trim() && attachments.length === 0) ||
              loading ||
              isProcessingFile
            }
            className="p-3 bg-brand-500 hover:bg-brand-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl transition-colors shadow-sm"
          >
            <Send size={20} />
          </button>
        </div>

        {/* Optional: small hint for free-tier limits */}
        <div className="mt-2 text-[11px] text-slate-400">
          Tip: If responses fail intermittently, please retry after a few
          seconds.
        </div>
      </div>
    </div>
  );
};
