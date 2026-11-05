import React from "react";
import { ArrowRight, ChevronRight, ChevronLeft, Trash2, CheckCircle } from "lucide-react";
import { IdeaCard as IdeaCardType } from "./useIdeas";

interface IdeaCardProps {
  card: IdeaCardType;
  onTurnIntoPost: (card: IdeaCardType) => void;
  onMoveStatus: (id: string, status: "UNASSIGNED" | "REVIEW" | "DONE") => void;
  onDelete: (id: string) => void;
}

export function IdeaCardItem({
  card,
  onTurnIntoPost,
  onMoveStatus,
  onDelete,
}: IdeaCardProps) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-zinc-200/90 shadow-sm hover:shadow-md transition-all group">
      {card.imageUrl && (
        <div className="aspect-[16/9] w-full rounded-xl overflow-hidden mb-3 bg-zinc-100">
          <img
            src={card.imageUrl}
            alt={card.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="flex items-start justify-between gap-2 mb-1">
        <h4 className="font-bold text-sm text-zinc-900 leading-snug">
          {card.title}
        </h4>
        <button
          onClick={() => onDelete(card.id)}
          className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-opacity p-0.5"
          title="Delete idea"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {Boolean(card.notes) && (
        <p className="text-xs text-zinc-500 leading-relaxed mb-3">
          {card.notes}
        </p>
      )}

      {/* Pastel Tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {card.tags.map((t, idx) => (
          <span
            key={idx}
            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${t.bg} ${t.color}`}
          >
            {t.text}
          </span>
        ))}
      </div>

      {/* Card Controls */}
      <div className="pt-2 border-t border-zinc-100 flex items-center justify-between text-xs">
        {card.status === "UNASSIGNED" && (
          <>
            <button
              onClick={() => onTurnIntoPost(card)}
              className="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Turn into Post <ArrowRight className="w-3 h-3" />
            </button>
            <button
              onClick={() => onMoveStatus(card.id, "REVIEW")}
              className="text-zinc-400 hover:text-zinc-900 font-semibold text-[11px] flex items-center gap-0.5"
              title="Move to Review"
            >
              Review <ChevronRight className="w-3 h-3" />
            </button>
          </>
        )}

        {card.status === "REVIEW" && (
          <>
            <button
              onClick={() => onMoveStatus(card.id, "UNASSIGNED")}
              className="text-zinc-400 hover:text-zinc-900 font-semibold text-[11px] flex items-center gap-0.5"
            >
              <ChevronLeft className="w-3 h-3" /> Back
            </button>
            <button
              onClick={() => onMoveStatus(card.id, "DONE")}
              className="text-blue-600 hover:text-blue-700 font-bold text-[11px] flex items-center gap-0.5"
            >
              Done <ChevronRight className="w-3 h-3" />
            </button>
          </>
        )}

        {card.status === "DONE" && (
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
            <CheckCircle className="w-3.5 h-3.5" />
            Completed
          </div>
        )}
      </div>
    </div>
  );
}
