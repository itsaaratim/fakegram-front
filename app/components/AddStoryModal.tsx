"use client";

import React, { useState, useRef } from "react";
import { useFakegram } from "../utils/store";
import { STORY_COLORS } from "../utils/mockData";
import { X, Check, Plus } from "./Icons";

interface AddStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AddStoryModal({ isOpen, onClose }: AddStoryModalProps) {
  const { addStory } = useFakegram();
  const [activeTab, setActiveTab] = useState<"text" | "image">("text");
  const [textContent, setTextContent] = useState("");

  // Solid color states
  const [selectedColorHex, setSelectedColorHex] = useState(STORY_COLORS[0].hex);
  const [selectedColorTextClass, setSelectedColorTextClass] = useState(
    STORY_COLORS[0].text,
  );
  const [customColor, setCustomColor] = useState("#f8fafc");

  // File upload states
  const [fileBase64, setFileBase64] = useState("");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle color change (presets)
  const handlePresetSelect = (hex: string, textClass: string) => {
    setSelectedColorHex(hex);
    setSelectedColorTextClass(textClass);
  };

  // Handle custom color picker change
  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    setCustomColor(hex);
    setSelectedColorHex(hex);
    // Dynamically compute basic brightness to decide text color (dark text for light colors, vice versa)
    // Formula: L = 0.2126 * R + 0.7152 * G + 0.0722 * B
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    setSelectedColorTextClass(luma > 140 ? "text-zinc-900" : "text-white");
  };

  // File change handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file (PNG, JPG, WEBP).");
      return;
    }

    // Size limit: 2MB to prevent localStorage quota exhaustion
    if (file.size > 2 * 1024 * 1024) {
      setError("Image is too large. Please select an image under 2MB.");
      return;
    }

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFileBase64(event.target.result as string);
      }
    };
    reader.onerror = () => {
      setError("Failed to read file.");
    };
    reader.readAsDataURL(file);
  };

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (activeTab === "text") {
      if (!textContent.trim()) {
        setError("Please enter some text for your story.");
        return;
      }
      if (textContent.length > 180) {
        setError("Text is too long (maximum 180 characters).");
        return;
      }
      addStory("text", textContent.trim(), selectedColorHex);
    } else {
      if (!fileBase64) {
        setError("Please select an image file to upload.");
        return;
      }
      addStory("image", fileBase64, "#ffffff");
    }

    // Reset fields and close
    setTextContent("");
    setFileBase64("");
    setFileName("");
    setSelectedColorHex(STORY_COLORS[0].hex);
    setSelectedColorTextClass(STORY_COLORS[0].text);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-zinc-200 bg-white text-zinc-900 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            Create Story
          </h3>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-zinc-100 text-sm">
          <button
            type="button"
            onClick={() => {
              setActiveTab("text");
              setError("");
            }}
            className={`flex-1 py-3 text-center font-medium border-b-2 transition-all cursor-pointer ${
              activeTab === "text"
                ? "border-zinc-900 text-zinc-900 font-semibold"
                : "border-transparent text-zinc-450 hover:text-zinc-700"
            }`}
          >
            Text Story
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("image");
              setError("");
            }}
            className={`flex-1 py-3 text-center font-medium border-b-2 transition-all cursor-pointer ${
              activeTab === "image"
                ? "border-zinc-900 text-zinc-900 font-semibold"
                : "border-transparent text-zinc-450 hover:text-zinc-700"
            }`}
          >
            Image Story
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handlePublish} className="p-6 space-y-6">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-600">
              {error}
            </div>
          )}

          {/* Text Story Editor */}
          {activeTab === "text" && (
            <div className="space-y-4">
              <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Compose Story
              </span>

              {/* Real-time Story Compose/Preview Card */}
              <div
                className={`relative aspect-[9/16] max-h-[280px] w-full rounded-2xl p-6 flex flex-col justify-between items-center shadow-inner border border-zinc-200 overflow-hidden ${selectedColorTextClass}`}
                style={{ backgroundColor: selectedColorHex }}
              >
                <div className="w-full flex items-center justify-between text-[10px] opacity-65 font-bold uppercase tracking-wider select-none">
                  <span>compose story</span>
                  <span>just now</span>
                </div>

                <textarea
                  placeholder="Share what is on your mind... (max 180 characters)"
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value.slice(0, 180))}
                  className="w-full flex-1 text-center px-4 font-sans font-medium text-lg md:text-xl break-words leading-relaxed overflow-y-auto scrollbar-none bg-transparent border-0 outline-none focus:outline-none focus:ring-0 focus:border-transparent resize-none placeholder:text-current placeholder:opacity-40 mt-4"
                  style={{ color: 'inherit' }}
                />

                <div className="w-full flex items-center justify-between text-[10px] opacity-65 font-bold uppercase tracking-wider select-none mt-2">
                  <span />
                  <span>{textContent.length}/180</span>
                </div>
              </div>

              {/* Color Presets & Picker */}
              <div className="space-y-2">
                <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Select Solid Color Background
                </span>
                <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
                  {STORY_COLORS.map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => handlePresetSelect(color.hex, color.text)}
                      className={`h-8 w-8 rounded-full border shrink-0 relative transition-all cursor-pointer ${
                        selectedColorHex === color.hex
                          ? "border-zinc-900 scale-105 ring-2 ring-zinc-950/10"
                          : "border-zinc-200 hover:scale-105"
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    >
                      {selectedColorHex === color.hex && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <Check size={12} className={color.text} />
                        </span>
                      )}
                    </button>
                  ))}

                  {/* Color Picker Divider */}
                  <div className="h-6 w-px bg-zinc-200 shrink-0" />

                  {/* Custom color picker */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <label
                      htmlFor="custom-picker"
                      className="text-[10px] font-bold text-zinc-400 uppercase cursor-pointer"
                    >
                      Custom:
                    </label>
                    <div className="relative h-8 w-8 rounded-full border border-zinc-200 overflow-hidden cursor-pointer">
                      <input
                        id="custom-picker"
                        type="color"
                        value={customColor}
                        onChange={handleCustomColorChange}
                        className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
                      />
                      <div
                        className="h-full w-full rounded-full"
                        style={{ backgroundColor: customColor }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Image Story Editor (file upload only, no presets) */}
          {activeTab === "image" && (
            <div className="space-y-4">
              <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Upload Photo Story
              </span>

              {/* Upload Input Area */}
              <div className="space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {!fileBase64 ? (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full cursor-pointer flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 hover:border-zinc-400 bg-zinc-50 rounded-2xl py-12 px-4 text-center transition-all hover:bg-zinc-100/40"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-zinc-500 border border-zinc-200 shadow-sm mb-3">
                      <Plus size={20} />
                    </div>
                    <span className="text-xs font-bold text-zinc-700">
                      Select Image File
                    </span>
                    <span className="text-[10px] text-zinc-400 mt-1">
                      PNG, JPG, WEBP up to 2MB
                    </span>
                  </button>
                ) : (
                  <div className="flex items-center justify-between rounded-xl bg-zinc-50 border border-zinc-200 p-3">
                    <div className="flex items-center gap-3 truncate">
                      <img
                        src={fileBase64}
                        alt="Upload preview"
                        className="h-10 w-10 rounded-lg object-cover border border-zinc-200"
                      />
                      <div className="flex flex-col text-left truncate">
                        <span className="text-xs font-semibold text-zinc-700 truncate">
                          {fileName}
                        </span>
                        <span className="text-[9px] text-zinc-400">
                          Ready to share
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setFileBase64("");
                        setFileName("");
                      }}
                      className="cursor-pointer text-[10px] font-semibold text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 rounded px-2 py-1"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Image Preview Window */}
              {fileBase64 && (
                <div className="space-y-2">
                  <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Story Preview
                  </span>
                  <div className="relative aspect-[9/16] max-h-[240px] w-full overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 flex items-center justify-center shadow-inner">
                    <img
                      src={fileBase64}
                      alt="Full upload preview"
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              className="w-full cursor-pointer rounded-xl bg-brand-blue py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-hover shadow-sm"
            >
              Share Story
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
