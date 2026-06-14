'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useFakegram } from '../utils/store';
import { X, Plus } from './Icons';

const EMOJI_PAGES = [
  // Page 1: Moods & Expressions (32)
  [
    '😊', '😎', '🥳', '😴', '💭', '🤔', '🤯', '🤠', '👻', '😈', '🔥', '✨',
    '😂', '🥰', '😘', '🤪', '🤤', '🤫', '🥺', '😭', '😡', '💀', '👽', '👾',
    '🤖', '👑', '💄', '👀', '👋', '👍', '🙌', '💖'
  ],
  // Page 2: Hearts & Hand Gestures (32)
  [
    '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '💔', '❣️', '💕', '💞',
    '💓', '💗', '💘', '💝', '💟', '💌', '💋', '💪', '🤳', '🖕', '👊', '🤜',
    '🤛', '🤝', '🙏', '👏', '✍️', '💅', '🖖', '🤞'
  ],
  // Page 3: Activities, Sports & Hobbies (32)
  [
    '💻', '☕', '📚', '🎨', '🎧', '🎮', '📸', '🏃', '🚲', '🧘', '🎸', '⚽',
    '🏀', '🏈', '⚾', '🎾', '🥊', '🥋', '🛹', '🚴', '🏊', '🏋️', '🧗', '🎤',
    '🎬', '🎹', '🎷', '🎺', '🎻', '🎲', '🧩', '🎯'
  ],
  // Page 4: Places, Weather & Travel (32)
  [
    '🏡', '🌲', '🌴', '🏖️', '🏔️', '⛺', '🚗', '✈️', '🌍', '🏙️', '🎡', '🏟️',
    '🚢', '🚀', '⛵', '🚂', '🛴', '🚥', '🗺️', '⛲', '🏰', '🗼', '🗽', '⛪',
    '⛩️', '🌅', '🌃', '⛈️', '❄️', '☀️', '⭐', '🌈'
  ],
  // Page 5: Foods & Drinks (32)
  [
    '🍕', '🍔', '🍣', '🍦', '🍩', '🥞', '🍷', '🍺', '🍹', '🥤', '🍎', '🍿',
    '🍇', '🍉', '🍋', '🍌', '🍍', '🥭', '🍒', '🍓', '🥝', '🍅', '🥑', '🥕',
    '🌽', '🥐', '🥨', '🌮', '🍜', '🧁', '🍫', '🍪'
  ],
  // Page 6: Animals & Nature (32)
  [
    '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮',
    '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗',
    '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜'
  ],
  // Page 7: Tools, Objects & Office (32)
  [
    '💡', '🔑', '🎁', '🎈', '🎉', '📍', '💯', '🔔', '📢', '📣', '💰', '💳',
    '💎', '🔧', '🔨', '🏆', '🥇', '🥈', '🥉', '⏰', '🔋', '🔌', '📜', '📁',
    '📂', '📅', '🔒', '🔓', '🖊️', '✂️', '🗑️', '🧸'
  ],
  // Page 8: Flags, Symbols & Extras (32)
  [
    '🏁', '🚩', '🎌', '🏴', '🏳️', '💤', '🎵', '🎶', '💲', '⚕️', '♾️', '💬',
    '👁️‍🗨️', '🔇', '🔕', '⚛️', '🕉️', '☸️', '☯️', '✝️', '❌', '✅', '⭕', '❗',
    '❓', '➕', '➖', '✖️', '➗', '🔱', '🧿', '🛎️'
  ]
];

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { currentUser, updateProfile } = useFakegram();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState('');
  const [statusEmoji, setStatusEmoji] = useState('');
  const [emojiPage, setEmojiPage] = useState(0);
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [pronouns, setPronouns] = useState('');
  const [birthday, setBirthday] = useState('');
  const [avatarFileName, setAvatarFileName] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentUser && isOpen) {
      setName(currentUser.name);
      setUsername(currentUser.username);
      setBio(currentUser.bio || '');
      setAvatar(currentUser.avatar);
      setStatusEmoji(currentUser.statusEmoji || '');
      setSpotifyUrl(currentUser.spotifyUrl || '');
      setPronouns(currentUser.pronouns || '');
      setBirthday(currentUser.birthday || '');
      setAvatarFileName('');
      setError('');
    }
  }, [currentUser, isOpen]);

  if (!isOpen || !currentUser) return null;

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    if (file.size > 1024 * 1024) {
      setError('Image is too large. Please select an avatar under 1MB.');
      return;
    }

    setAvatarFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setAvatar(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!avatar) {
      setError('Please upload an avatar image.');
      return;
    }

    if (!name.trim() || !username.trim()) {
      setError('Name and username are required.');
      return;
    }

    // Pass statusEmoji, and statusText is now always empty or matches emoji description
    const ok = await updateProfile(name, username, avatar, bio, statusEmoji, '', spotifyUrl, pronouns, birthday);
    if (!ok) {
      setError('Username is already taken by another user.');
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-zinc-200 bg-white text-zinc-900 shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
          <h3 className="text-lg font-bold">Edit Profile</h3>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto scrollbar-thin">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-600">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="edit-name" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Display Name
            </label>
            <input
              id="edit-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 px-4 text-sm text-zinc-900 focus:border-zinc-350 focus:bg-white focus:outline-none"
              required
            />
          </div>

          <div>
            <label htmlFor="edit-username" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Username
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400 text-sm">
                @
              </span>
              <input
                id="edit-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 pl-8 pr-4 text-sm text-zinc-900 focus:border-zinc-350 focus:bg-white focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Bubble Status Editor (Emoji Only) */}
          <div className="space-y-3.5 p-3.5 border border-zinc-100 bg-zinc-50/50 rounded-2xl">
            <div className="flex items-center justify-between">
              <span className="block text-xs font-bold uppercase tracking-wider text-zinc-500">
                Status Bubble Emoji
              </span>
              <div className="flex items-center gap-1.5">
                {statusEmoji && (
                  <button
                    type="button"
                    onClick={() => setStatusEmoji('')}
                    className="cursor-pointer text-[10px] font-semibold text-rose-500 hover:text-rose-600 px-2 py-1 rounded-lg hover:bg-rose-50 transition-colors"
                  >
                    Clear
                  </button>
                )}
                <input
                  type="text"
                  maxLength={2}
                  value={statusEmoji}
                  onChange={(e) => setStatusEmoji(e.target.value)}
                  className="w-10 text-center rounded-lg border border-zinc-200 bg-white py-1 text-sm text-zinc-900 focus:border-zinc-350 focus:outline-none"
                  placeholder="✨"
                />
              </div>
            </div>
            {/* Flat Emoji Grid Selector - Carousel Grid */}
            <div className="pt-1 space-y-2.5">
              <div className="grid grid-cols-8 gap-1.5 justify-items-center min-h-[140px]">
                {EMOJI_PAGES[emojiPage].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setStatusEmoji(emoji)}
                    className={`h-8 w-8 text-base flex items-center justify-center rounded-xl border transition-all cursor-pointer ${
                      statusEmoji === emoji
                        ? 'border-brand-blue bg-brand-blue/10 text-brand-blue shadow-sm'
                        : 'border-zinc-200 bg-white hover:border-zinc-300'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Carousel Indicators */}
              <div className="flex justify-center items-center gap-1.5 border-t border-zinc-100 pt-2.5 mt-0.5">
                {EMOJI_PAGES.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setEmojiPage(i)}
                    className={`h-1.5 w-1.5 rounded-full transition-all cursor-pointer ${
                      i === emojiPage ? 'bg-brand-blue w-3.5' : 'bg-zinc-200 hover:bg-zinc-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="edit-bio" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
              Bio
            </label>
            <textarea
              id="edit-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 px-4 text-sm text-zinc-900 focus:border-zinc-350 focus:bg-white focus:outline-none resize-none"
              placeholder="Write something about yourself..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-pronouns" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Pronouns
              </label>
              <input
                id="edit-pronouns"
                type="text"
                value={pronouns}
                onChange={(e) => setPronouns(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 px-4 text-sm text-zinc-900 focus:border-zinc-350 focus:bg-white focus:outline-none"
                placeholder="e.g. they/them"
              />
            </div>
            
            <div>
              <label htmlFor="edit-birthday" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
                Birthday (day/month)
              </label>
              <input
                id="edit-birthday"
                type="text"
                value={birthday}
                onChange={(e) => setBirthday(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 px-4 text-sm text-zinc-900 focus:border-zinc-350 focus:bg-white focus:outline-none"
                placeholder="e.g. 14/10"
              />
            </div>
          </div>

          <div>
            <label htmlFor="edit-spotify" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Spotify Track/Playlist Link</span>
              <span className="text-[9px] text-zinc-400 font-normal lowercase tracking-normal">Automatically embeds</span>
            </label>
            <input
              id="edit-spotify"
              type="text"
              value={spotifyUrl}
              onChange={(e) => setSpotifyUrl(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 px-4 text-sm text-zinc-900 focus:border-zinc-350 focus:bg-white focus:outline-none"
              placeholder="https://open.spotify.com/track/..."
            />
          </div>

          {/* Avatar selector */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Profile Picture
            </label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleAvatarFileChange}
              className="hidden"
            />

            <div className="flex items-center gap-4">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-full border border-zinc-200 bg-zinc-50">
                <img 
                  src={avatar || 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="%23f4f4f5"><rect width="100" height="100"/></svg>'} 
                  alt="Avatar preview" 
                  className="h-full w-full object-cover" 
                />
              </div>
              <div className="flex-1 flex flex-col items-start gap-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="cursor-pointer rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
                >
                  Choose New Photo
                </button>
                <span className="text-[10px] text-zinc-400">
                  {avatarFileName ? `Selected: ${avatarFileName.slice(0, 15)}...` : 'PNG or JPG up to 1MB'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full cursor-pointer rounded-xl bg-brand-blue py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-blue-hover shadow-sm"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
