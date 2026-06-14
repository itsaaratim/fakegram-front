'use client';

import React from 'react';
import { useFakegram } from '../utils/store';
import { STORY_COLORS } from '../utils/mockData';
import { X, User, Heart } from './Icons';

interface UserProfileModalProps {
  userId: string;
  onClose: () => void;
  onSelectStory: (userId: string) => void;
}

export default function UserProfileModal({ userId, onClose, onSelectStory }: UserProfileModalProps) {
  const { currentUser, users, feedStories, followUser, unfollowUser } = useFakegram();

  // Load the target user details
  const targetUser = users.find((u) => u.id === userId);
  if (!targetUser || !currentUser) return null;

  // Filter stories active in the last 24h for this specific user
  const userStories = feedStories.filter((s) => s.userId === userId);

  // Check if current user is following the target user
  const isFollowing = currentUser.following.includes(userId);

  const getSpotifyEmbedUrl = (url?: string) => {
    if (!url) return null;
    const match = url.match(/open\.spotify\.com\/(?:[a-zA-Z-]+\/)?(track|playlist|album|artist)\/([a-zA-Z0-9]+)/);
    if (match) {
      const type = match[1];
      const id = match[2];
      return `https://open.spotify.com/embed/${type}/${id}`;
    }
    return null;
  };

  const spotifyEmbedUrl = getSpotifyEmbedUrl(targetUser.spotifyUrl);

  // Helper to dynamically calculate contrast text color for solid backgrounds
  const getStoryTextColorClass = (hexColor: string) => {
    const hex = hexColor.trim();
    if (!hex.startsWith('#')) return 'text-zinc-900'; // fallback
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luma > 140 ? 'text-zinc-900' : 'text-white';
  };

  return (
    <div className="fixed inset-0 z-45 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-zinc-200 bg-white text-zinc-900 shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
          <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">User Profile</h3>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto scrollbar-thin">
          
          {/* Profile Details Header */}
          <div className="flex flex-col items-center text-center pb-4 border-b border-zinc-100">
            
            {/* Avatar & Bubble Status */}
            <div className="relative mb-4">
              <button
                onClick={() => {
                  if (userStories.length > 0) {
                    onSelectStory(userId);
                  }
                }}
                disabled={userStories.length === 0}
                className={`h-24 w-24 overflow-hidden rounded-full border p-0.5 bg-white transition-all ${
                  userStories.length > 0 
                    ? 'border-brand-blue ring-2 ring-zinc-100 cursor-pointer active:scale-95 hover:scale-102' 
                    : 'border-zinc-200'
                }`}
              >
                <img src={targetUser.avatar} alt={targetUser.name} className="h-full w-full rounded-full object-cover" />
              </button>

              {/* Status Bubble Badge (hovering on bottom-right of avatar) */}
              {targetUser.statusEmoji && (
                <div 
                  className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-white border border-zinc-200 shadow-md text-sm cursor-help transition-transform hover:scale-110"
                  title={targetUser.statusText || 'Bubble Status'}
                >
                  {targetUser.statusEmoji}
                </div>
              )}
            </div>

            {/* Name & Username */}
            <h2 className="text-lg font-bold text-zinc-900">{targetUser.name}</h2>
            <span className="text-xs text-zinc-400 mb-4">@{targetUser.username}</span>

            {/* Pronouns and Birthday Row */}
            {((targetUser.pronouns && targetUser.pronouns.trim() !== '') || (targetUser.birthday && targetUser.birthday.trim() !== '')) && (
              <div className="flex items-center justify-between w-full max-w-[280px] mb-3">
                {targetUser.pronouns && targetUser.pronouns.trim() !== '' ? (
                  <span className="bg-zinc-100/70 text-zinc-550 text-[10px] font-bold px-2 py-0.5 rounded-lg select-none">
                    {targetUser.pronouns}
                  </span>
                ) : <span />}
                {targetUser.birthday && targetUser.birthday.trim() !== '' ? (
                  <span className="bg-zinc-100/70 text-zinc-550 text-[10px] font-bold px-2 py-0.5 rounded-lg select-none">
                    {targetUser.birthday}
                  </span>
                ) : <span />}
              </div>
            )}

            {/* Bio */}
            <p className="text-xs text-zinc-650 max-w-[280px] leading-relaxed mb-3">
              {targetUser.bio || "No description yet."}
            </p>

            {/* Spotify Embed Player */}
            {spotifyEmbedUrl && (
              <div className="w-full max-w-xs mb-4 px-2 overflow-hidden h-[122px]">
                <iframe
                  style={{
                    borderRadius: '12px',
                    border: 'none',
                    overflow: 'hidden',
                    height: '152px',
                    width: '125%',
                    transform: 'scale(0.8)',
                    transformOrigin: 'top left'
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
            <div className="grid grid-cols-2 gap-8 w-full max-w-xs border-t border-zinc-100 pt-4 mb-4">
              <div className="flex flex-col items-center">
                <span className="text-sm font-extrabold text-zinc-800">{targetUser.followers.length}</span>
                <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-medium">Followers</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-sm font-extrabold text-zinc-800">{targetUser.following.length}</span>
                <span className="text-[9px] uppercase tracking-wider text-zinc-400 font-medium">Following</span>
              </div>
            </div>

            {/* Follow / Unfollow CTA */}
            {currentUser.id !== targetUser.id && (
              <button
                onClick={() => {
                  if (isFollowing) {
                    unfollowUser(targetUser.id);
                  } else {
                    followUser(targetUser.id);
                  }
                }}
                className={`cursor-pointer mt-2 w-full max-w-[200px] rounded-xl py-2 text-xs font-semibold transition-all ${
                  isFollowing
                    ? 'border border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900'
                    : 'bg-brand-blue text-white hover:bg-brand-blue-hover shadow-sm'
                }`}
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            )}


          </div>

          {/* Active Stories List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
              Active Stories ({userStories.length})
            </h4>

            {userStories.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {userStories.map((story) => (
                  <div
                    key={story.id}
                    onClick={() => {
                      onClose();
                      onSelectStory(userId);
                    }}
                    className="group relative aspect-[3/4] rounded-xl overflow-hidden border border-zinc-200 bg-zinc-50 cursor-pointer shadow-sm"
                  >
                    {story.type === 'image' ? (
                      <img
                        src={story.content}
                        alt="Story preview"
                        className="h-full w-full object-cover transition-transform group-hover:scale-102"
                      />
                    ) : (
                      <div 
                        className={`h-full w-full p-2.5 flex flex-col justify-center items-center text-center ${getStoryTextColorClass(story.background)}`}
                        style={{ backgroundColor: story.background }}
                      >
                        <p className="font-sans font-medium text-[9px] line-clamp-4 break-words leading-tight">
                          {story.content}
                        </p>
                      </div>
                    )}

                    {/* Hover view */}
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="rounded-full bg-white/90 p-1.5 text-[8px] font-bold text-zinc-850 shadow">
                        View
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center border border-dashed border-zinc-200 rounded-2xl py-8 text-center text-zinc-400 bg-zinc-50/50">
                <User size={24} className="text-zinc-250 mb-2" />
                <p className="text-[10px] text-zinc-450">No active stories in the last 24 hours.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
