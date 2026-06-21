export interface User {
  id: string;
  username: string;
  name: string;
  avatar: string;
  bio?: string;
  statusEmoji?: string;
  statusText?: string;
  followers: string[];
  following: string[];
  spotifyUrl?: string;
  pronouns?: string;
  birthday?: string;
}

export interface StoryComment {
  id: string;
  storyId: string;
  userId: string;
  username: string;
  userAvatar: string;
  userName: string;
  content: string;
  createdAt: string;
}

export interface Story {
  id: string;
  userId: string;
  username: string;
  userAvatar: string;
  userName: string;
  type: "text" | "image";
  content: string;
  background: string;
  createdAt: string;
  likes?: string[];
  comments?: StoryComment[];
}

export const STORY_COLORS = [
  { id: "slate", name: "Slate", hex: "#f8fafc", text: "text-slate-900" },
  { id: "cream", name: "Cream", hex: "#fafaf9", text: "text-stone-900" },
  { id: "sage", name: "Sage", hex: "#f0fdf4", text: "text-emerald-900" },
  { id: "sky", name: "Sky", hex: "#f0f9ff", text: "text-sky-900" },
  { id: "lavender", name: "Lavender", hex: "#faf5ff", text: "text-purple-900" },
  { id: "rose", name: "Rose", hex: "#fff1f2", text: "text-rose-900" },
  { id: "dark-minimal", name: "Dark", hex: "#18181b", text: "text-zinc-100" },
];

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}
