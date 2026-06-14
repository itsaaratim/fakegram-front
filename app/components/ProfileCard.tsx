"use client";

import React from "react";
import { useFakegram } from "../utils/store";
import { Plus, Edit, LogOut } from "./Icons";

interface ProfileCardProps {
  setIsEditProfileOpen: (open: boolean) => void;
  setIsAddStoryOpen: (open: boolean) => void;
  openConnections: (tab: "followers" | "following") => void;
}

export default function ProfileCard({
  setIsEditProfileOpen,
  setIsAddStoryOpen,
  openConnections,
}: ProfileCardProps) {
  const { currentUser, logout } = useFakegram();

  if (!currentUser) return null;

  const getSpotifyEmbedUrl = (url?: string) => {
    if (!url) return null;
    const match = url.match(
      /open\.spotify\.com\/(?:[a-zA-Z-]+\/)?(track|playlist|album|artist)\/([a-zA-Z0-9]+)/,
    );
    if (match) {
      const type = match[1];
      const id = match[2];
      return `https://open.spotify.com/embed/${type}/${id}`;
    }
    return null;
  };

  const spotifyEmbedUrl = getSpotifyEmbedUrl(currentUser.spotifyUrl);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col items-center text-center">
        {/* Profile Image */}
        <div className="relative mb-4">
          <div className="h-24 w-24 overflow-hidden rounded-full border border-zinc-200 p-0.5 bg-white">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="h-full w-full rounded-full object-cover"
            />
          </div>
          {/* Status bubble emoji hovering on avatar in sidebar profile card */}
          {currentUser.statusEmoji && (
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-white border border-zinc-200 shadow-md text-sm cursor-pointer hover:scale-110 transition-transform"
              title={currentUser.statusText || "Edit Status"}
            >
              {currentUser.statusEmoji}
            </button>
          )}
        </div>

        {/* Name & Bio */}
        <h2 className="text-lg font-bold text-zinc-900">{currentUser.name}</h2>
        <span className="text-xs text-zinc-400 mb-3">
          @{currentUser.username}
        </span>

        {/* Pronouns and Birthday Row */}
        {((currentUser.pronouns && currentUser.pronouns.trim() !== "") ||
          (currentUser.birthday && currentUser.birthday.trim() !== "")) && (
          <div className="flex items-center justify-between w-full mb-3.5">
            {currentUser.pronouns && currentUser.pronouns.trim() !== "" ? (
              <span className="bg-zinc-100/70 text-zinc-550 text-[10px]  px-2 py-0.5 rounded-lg select-none">
                {currentUser.pronouns}
              </span>
            ) : (
              <span />
            )}
            {currentUser.birthday && currentUser.birthday.trim() !== "" ? (
              <span className="bg-zinc-100/70 text-zinc-550 text-[10px]  px-2 py-0.5 rounded-lg select-none">
                {currentUser.birthday}
              </span>
            ) : (
              <span />
            )}
          </div>
        )}

        <p className="text-xs text-zinc-655 max-w-[240px] leading-relaxed mb-3">
          {currentUser.bio ||
            "No description yet. Add a short bio about yourself!"}
        </p>

        {/* Spotify Embed Player */}
        {spotifyEmbedUrl && (
          <div className="w-full mb-5 overflow-hidden h-[122px]">
            <iframe
              style={{
                borderRadius: "12px",
                border: "none",
                overflow: "hidden",
                height: "152px",
                width: "125%",
                transform: "scale(0.8)",
                transformOrigin: "top left",
              }}
              src={`${spotifyEmbedUrl}?utm_source=generator&theme=1`}
              frameBorder="0"
              scrolling="no"
              allowFullScreen={false}
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            ></iframe>
          </div>
        )}

        {/* Profile Card Action Buttons */}
        <div className="flex flex-col gap-2.5 w-full mt-2">
          <button
            onClick={() => setIsAddStoryOpen(true)}
            className="w-full cursor-pointer flex items-center justify-center gap-2 rounded-xl bg-brand-blue py-3 text-xs font-semibold text-white hover:bg-brand-blue-hover transition-all shadow-sm"
          >
            <Plus size={14} className="stroke-[2.5]" />
            Share Story
          </button>

          <div className="flex gap-2.5 w-full">
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="flex-1 cursor-pointer flex items-center justify-center gap-1.5 rounded-xl border border-zinc-250 bg-zinc-50 py-2.5 text-xs font-semibold text-zinc-750 hover:bg-zinc-100 hover:text-zinc-900 transition-all"
            >
              <Edit size={12} />
              Edit Profile
            </button>

            <button
              onClick={logout}
              className="cursor-pointer flex items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 p-2.5 text-zinc-400 hover:bg-zinc-100 hover:text-rose-650 transition-all"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
