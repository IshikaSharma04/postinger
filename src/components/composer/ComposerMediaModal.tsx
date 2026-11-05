import React from "react";
import { Image as ImageIcon, X, Upload, Check } from "lucide-react";
import { MediaAssetItem } from "./useComposerData";

interface ComposerMediaModalProps {
  isOpen: boolean;
  onClose: () => void;
  mediaAssets: MediaAssetItem[];
  selectedMediaIds: string[];
  isUploading: boolean;
  onToggleMedia: (id: string) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ComposerMediaModal({
  isOpen,
  onClose,
  mediaAssets,
  selectedMediaIds,
  isUploading,
  onToggleMedia,
  onFileUpload,
}: ComposerMediaModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white border border-zinc-200 rounded-2xl max-w-xl w-full p-6 shadow-xl space-y-4 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-blue-600" />
            <h3 className="text-sm font-bold text-zinc-900">Attach Media</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Upload banner */}
        <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-zinc-900">Upload from Device</p>
            <p className="text-[11px] text-zinc-500">JPG, PNG, WEBP, MP4</p>
          </div>
          <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 text-xs font-semibold hover:bg-blue-100">
            <input
              type="file"
              className="sr-only"
              onChange={onFileUpload}
              accept="image/*,video/*"
            />
            {isUploading ? (
              <div className="w-3.5 h-3.5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
            ) : (
              <Upload className="w-3.5 h-3.5" />
            )}
            Choose File
          </label>
        </div>

        <div className="flex-1 overflow-y-auto">
          {mediaAssets.length === 0 ? (
            <div className="p-10 text-center text-zinc-400 text-xs">
              No media uploaded yet.
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {mediaAssets.map((asset) => {
                const isSelected = selectedMediaIds.includes(asset.id);
                return (
                  <button
                    key={asset.id}
                    onClick={() => onToggleMedia(asset.id)}
                    className={`relative rounded-xl overflow-hidden aspect-square border transition-all ${
                      isSelected
                        ? "border-blue-600 ring-2 ring-blue-500/20"
                        : "border-zinc-200 hover:border-blue-300"
                    }`}
                  >
                    {asset.mimeType?.startsWith("image/") ? (
                      <img
                        src={asset.url}
                        alt={asset.originalName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-[10px] text-zinc-500 font-bold">
                        VIDEO
                      </div>
                    )}
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center">
                        <Check className="w-3 h-3" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
          <span className="text-xs text-zinc-500">{selectedMediaIds.length} attached</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
