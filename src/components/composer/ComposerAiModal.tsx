import React, { useState } from "react";
import { Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface ComposerAiModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBody: string;
  onApplySuggestion: (text: string) => void;
}

export function ComposerAiModal({
  isOpen,
  onClose,
  currentBody,
  onApplySuggestion,
}: ComposerAiModalProps) {
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiTone, setAiTone] = useState("Punchy");
  const [aiAction, setAiAction] = useState<"REWRITE" | "HOOKS" | "IDEAS" | "SUMMARIZE">("REWRITE");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleGenerate() {
    setLoading(true);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: aiPrompt || currentBody || "Excited about our product launch today!",
          action: aiAction,
          tone: aiTone,
          platform: "TWITTER",
        }),
      });
      const json = await res.json();
      if (json.success && Array.isArray(json.data?.suggestions)) {
        setSuggestions(json.data.suggestions);
      }
    } catch {
      // Fallback suggestions
      setSuggestions([
        `🔥 ${currentBody || "Big updates on the horizon!"} #buildinpublic`,
        `💡 Three takeaways you shouldn't miss: \n1. Consistency wins\n2. Iterate rapidly\n3. Engage directly.`,
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white border border-zinc-200 rounded-2xl max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-zinc-900">AI Assistant</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3 overflow-y-auto flex-1">
          {/* Tone */}
          <div>
            <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Tone</label>
            <div className="flex flex-wrap gap-1.5">
              {["Punchy", "Professional", "Casual", "Thought-Leadership"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setAiTone(t)}
                  className={`text-xs px-2.5 py-1 rounded-full font-semibold border transition-all ${
                    aiTone === t
                      ? "bg-purple-50 text-purple-700 border-purple-200"
                      : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Action */}
          <div>
            <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Action</label>
            <div className="grid grid-cols-3 gap-1.5">
              {(["REWRITE", "HOOKS", "IDEAS"] as const).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setAiAction(a)}
                  className={`text-xs py-1.5 rounded-xl font-bold border transition-all text-center ${
                    aiAction === a
                      ? "bg-purple-600 text-white border-purple-600"
                      : "bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-600 mb-1.5">Custom Prompt (optional)</label>
            <textarea
              rows={2}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. Focus on our 50% discount announcement..."
              className="w-full text-xs bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-purple-600/20 resize-none"
            />
          </div>

          <Button
            size="sm"
            onClick={handleGenerate}
            loading={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            Generate Suggestions
          </Button>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-zinc-100">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                Click a suggestion to use it:
              </span>
              {suggestions.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    onApplySuggestion(s);
                    onClose();
                  }}
                  className="w-full text-left p-3 rounded-xl border border-zinc-200 bg-zinc-50/50 hover:bg-purple-50/50 hover:border-purple-200 text-xs text-zinc-800 transition-all font-sans leading-relaxed"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
