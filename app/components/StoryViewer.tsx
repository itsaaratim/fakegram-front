"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useFakegram } from "../utils/store";
import { Story, User, StoryComment } from "../utils/mockData";
import {
  X,
  Trash,
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
} from "./Icons";
import UserProfileTrigger from "./UserProfileTrigger";

interface StoryViewerProps {
  initialUserId: string; // The user whose story was clicked
  onClose: () => void;
}

export default function StoryViewer({
  initialUserId,
  onClose,
}: StoryViewerProps) {
  const {
    currentUser,
    feedStories,
    deleteStory,
    likeStory,
    users,
    addComment,
    deleteComment,
  } = useFakegram();

  const storiesByUser: { [userId: string]: Story[] } = {};
  const activeStories = [...feedStories].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );

  activeStories.forEach((story) => {
    if (!storiesByUser[story.userId]) {
      storiesByUser[story.userId] = [];
    }
    storiesByUser[story.userId].push(story);
  });

  // Get list of users with stories in the feed. Put the initial user first.
  const userIdsWithStories = Object.keys(storiesByUser);
  const orderedUserIds = [
    initialUserId,
    ...userIdsWithStories.filter((id) => id !== initialUserId),
  ].filter((id) => storiesByUser[id] && storiesByUser[id].length > 0);

  // States
  const [userIndex, setUserIndex] = useState(0);
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLikesListOpen, setIsLikesListOpen] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [commentContent, setCommentContent] = useState("");
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 60000);
    return () => clearInterval(timeInterval);
  }, []);

  // Ref for progress timer
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const STORY_DURATION = 5000; // 5 seconds per story

  const activeUserId = orderedUserIds[userIndex];
  const userStories = useMemo(
    () => (activeUserId ? storiesByUser[activeUserId] : []),
    [activeUserId, storiesByUser],
  );
  const currentStory = userStories ? userStories[storyIndex] : null;

  // Handle advancing stories
  const nextStory = useCallback(() => {
    if (!userStories) return;

    if (storyIndex < userStories.length - 1) {
      // Go to next story of same user
      setIsLikesListOpen(false);
      setIsCommentsOpen(false);
      setStoryIndex(storyIndex + 1);
      setProgress(0);
    } else if (userIndex < orderedUserIds.length - 1) {
      // Go to first story of next user
      setIsLikesListOpen(false);
      setIsCommentsOpen(false);
      setUserIndex(userIndex + 1);
      setStoryIndex(0);
      setProgress(0);
    } else {
      // No more stories, close
      setIsLikesListOpen(false);
      setIsCommentsOpen(false);
      onClose();
    }
  }, [userStories, storyIndex, userIndex, orderedUserIds.length, onClose]);

  // Handle going back
  const prevStory = () => {
    if (storyIndex > 0) {
      // Go to previous story of same user
      setIsLikesListOpen(false);
      setIsCommentsOpen(false);
      setStoryIndex(storyIndex - 1);
      setProgress(0);
    } else if (userIndex > 0) {
      // Go to last story of previous user
      const prevUserStories = storiesByUser[orderedUserIds[userIndex - 1]];
      setIsLikesListOpen(false);
      setIsCommentsOpen(false);
      setUserIndex(userIndex - 1);
      setStoryIndex(prevUserStories.length - 1);
      setProgress(0);
    } else {
      // Already at the very first story, restart it
      setProgress(0);
    }
  };

  // Delete current story
  const handleDelete = () => {
    if (!currentStory) return;
    setIsLikesListOpen(false);
    setIsCommentsOpen(false);
    deleteStory(currentStory.id);

    // Adjust indices if this was the last story or user
    if (userStories.length <= 1) {
      // This was the only story for this user
      if (orderedUserIds.length <= 1) {
        // Only user left, close viewer
        onClose();
      } else {
        // Go to next user
        setUserIndex((prev) => Math.min(prev, orderedUserIds.length - 2));
        setStoryIndex(0);
        setProgress(0);
      }
    } else {
      // User has more stories
      setStoryIndex((prev) => Math.min(prev, userStories.length - 2));
      setProgress(0);
    }
  };

  useEffect(() => {
    if (isPaused || isLikesListOpen || isCommentsOpen || !currentStory) {
      if (progressInterval.current) clearInterval(progressInterval.current);
      return;
    }

    const intervalStep = 50;
    const stepIncrement = (intervalStep / STORY_DURATION) * 100;

    progressInterval.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextStory();
          return 0;
        }
        return prev + stepIncrement;
      });
    }, intervalStep);

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [
    userIndex,
    storyIndex,
    isPaused,
    isLikesListOpen,
    currentStory,
    nextStory,
  ]);

  if (!currentStory || !activeUserId) return null;

  const getStoryTextColorClass = (hexColor: string) => {
    const hex = hexColor.trim();
    if (!hex.startsWith("#")) return "text-zinc-900"; // fallback
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luma > 140 ? "text-zinc-900" : "text-white";
  };

  // Format creation time
  const getRelativeTime = (isoString: string) => {
    const time = new Date(isoString).getTime();
    const diff = currentTime - time;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) {
      const mins = Math.floor(diff / (1000 * 60));
      return `${mins}m ago`;
    }
    return `${hours}h ago`;
  };

  const isLiked =
    currentStory && currentUser
      ? (currentStory.likes || []).includes(currentUser.id)
      : false;
  const likingUsers = currentStory
    ? (currentStory.likes || [])
        .map((id) => users.find((u) => u.id === id))
        .filter((u): u is User => !!u)
    : [];

  const handleAddComment = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!commentContent.trim() || !currentStory) return;
    await addComment(currentStory.id, commentContent.trim());
    setCommentContent("");
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!currentStory) return;
    await deleteComment(currentStory.id, commentId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-0 sm:p-4 backdrop-blur-md">
      {/* Background blur representation of the story */}
      <div className="absolute inset-0 -z-10 opacity-30 blur-2xl filter overflow-hidden">
        {currentStory.type === "image" ? (
          <img
            src={currentStory.content}
            alt=""
            className="h-full w-full object-cover scale-150"
          />
        ) : (
          <div
            className="h-full w-full"
            style={{ backgroundColor: currentStory.background }}
          />
        )}
      </div>

      {/* Desktop Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 hidden sm:flex cursor-pointer items-center justify-center rounded-full bg-zinc-900/80 p-3 text-zinc-455 border border-zinc-800 hover:text-white hover:bg-zinc-800 transition-colors"
      >
        <X size={24} />
      </button>

      {/* Main Story Container Card */}
      <div className="relative flex h-full w-full max-w-md flex-col justify-between bg-zinc-950 sm:h-[85vh] sm:rounded-3xl sm:border sm:border-zinc-850 overflow-hidden shadow-2xl">
        {/* Top Story Header & Bars */}
        <div className="absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/85 via-black/40 to-transparent z-20 flex flex-col gap-3">
          {/* Progress Indicators */}
          <div className="flex gap-1.5 w-full">
            {userStories.map((story, idx) => {
              let width = "0%";
              if (idx < storyIndex) width = "100%";
              else if (idx === storyIndex) width = `${progress}%`;

              return (
                <div
                  key={story.id}
                  className="h-1 flex-1 bg-zinc-700/60 rounded-full overflow-hidden"
                >
                  <div
                    className="h-full bg-white transition-all duration-[50ms] ease-linear rounded-full"
                    style={{ width }}
                  />
                </div>
              );
            })}
          </div>

          {/* User Info Bar */}
          <div className="flex items-center justify-between">
            {/* Clickable Profile Trigger - Header Avatar & Name */}
            <UserProfileTrigger
              userId={currentStory.userId}
              className="flex items-center gap-3 hover:opacity-90"
            >
              <div className="h-9 w-9 overflow-hidden rounded-full border border-white/20 bg-zinc-850">
                <img
                  src={currentStory.userAvatar}
                  alt={currentStory.userName}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-white">
                  {currentStory.userName}
                </span>
                <span className="text-[10px] text-zinc-350 flex items-center gap-1.5">
                  @{currentStory.username}
                  <span className="h-1 w-1 rounded-full bg-zinc-550" />
                  {getRelativeTime(currentStory.createdAt)}
                </span>
              </div>
            </UserProfileTrigger>

            <div className="flex items-center gap-2 text-white z-20">
              {currentUser && currentUser.id === currentStory.userId && (
                <button
                  onClick={handleDelete}
                  title="Delete story"
                  className="cursor-pointer rounded-lg p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-zinc-900/50 transition-colors"
                >
                  <Trash size={16} />
                </button>
              )}
              <button
                onClick={onClose}
                className="flex sm:hidden cursor-pointer rounded-lg p-1.5 text-zinc-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Click/Hold Intercept Overlay Areas */}
        <div className="absolute inset-0 z-10 flex">
          {/* Left tap area (prev story) */}
          <div
            onClick={prevStory}
            onMouseDown={() => setIsPaused(true)}
            onMouseUp={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
            className="w-[30%] h-full cursor-w-resize"
          />
          {/* Middle hold area (pause) */}
          <div
            onMouseDown={() => setIsPaused(true)}
            onMouseUp={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
            className="w-[40%] h-full"
          />
          {/* Right tap area (next story) */}
          <div
            onClick={nextStory}
            onMouseDown={() => setIsPaused(true)}
            onMouseUp={() => setIsPaused(false)}
            onTouchStart={() => setIsPaused(true)}
            onTouchEnd={() => setIsPaused(false)}
            className="w-[30%] h-full cursor-e-resize"
          />
        </div>

        {/* Story Content Area */}
        <div className="flex-1 flex items-center justify-center relative w-full h-full">
          {currentStory.type === "image" ? (
            <img
              src={currentStory.content}
              alt="Story"
              className="h-full w-full object-contain bg-zinc-95"
            />
          ) : (
            <div
              className={`h-full w-full flex flex-col justify-center items-center p-8 text-center ${getStoryTextColorClass(currentStory.background)}`}
              style={{ backgroundColor: currentStory.background }}
            >
              <p className="font-sans font-medium text-xl md:text-2xl break-words max-w-xs leading-relaxed">
                {currentStory.content}
              </p>
            </div>
          )}
        </div>

        {/* Bottom Reaction Bar */}
        <div className="relative z-20 flex items-center justify-between p-4 bg-zinc-950 border-t border-zinc-900">
          {/* Likes & Comments Info Triggers */}
          <div className="flex-1 flex items-center gap-2 flex-wrap">
            {/* Likes trigger */}
            {currentStory.likes && currentStory.likes.length > 0 ? (
              <button
                onClick={() => {
                  setIsLikesListOpen(true);
                  setIsCommentsOpen(false);
                }}
                className="cursor-pointer flex items-center gap-1.5 rounded-full bg-zinc-900/60 hover:bg-zinc-900 px-3 py-1.5 text-xs text-white border border-zinc-800 transition-colors"
              >
                <span className="text-rose-500">❤️</span>
                <span className="font-semibold">
                  {currentStory.likes.length}
                </span>
              </button>
            ) : (
              <span className="text-[10px] text-zinc-500 font-medium">
                0 likes
              </span>
            )}

            {/* Comments trigger */}
            <button
              onClick={() => {
                setIsCommentsOpen(true);
                setIsLikesListOpen(false);
              }}
              className="cursor-pointer flex items-center gap-1.5 rounded-full bg-zinc-900/60 hover:bg-zinc-900 px-3 py-1.5 text-xs text-white border border-zinc-800 transition-colors"
            >
              <span className="text-blue-400">💬</span>
              <span className="font-semibold">
                {currentStory.comments ? currentStory.comments.length : 0}
              </span>
            </button>
          </div>

          {/* Like & Comment Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => likeStory(currentStory.id)}
              className="cursor-pointer flex items-center justify-center rounded-full bg-zinc-900/60 p-2.5 text-zinc-400 hover:text-white border border-zinc-800 hover:bg-zinc-800 transition-colors"
              title={isLiked ? "Unlike" : "Like"}
            >
              {isLiked ? (
                <Heart size={18} className="fill-rose-500 stroke-rose-500" />
              ) : (
                <Heart size={18} className="stroke-zinc-300" />
              )}
            </button>

            <button
              onClick={() => {
                setIsCommentsOpen(!isCommentsOpen);
                setIsLikesListOpen(false);
              }}
              className={`cursor-pointer flex items-center justify-center rounded-full p-2.5 border transition-colors ${
                isCommentsOpen
                  ? "bg-white text-zinc-950 border-white"
                  : "bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:text-white hover:bg-zinc-800"
              }`}
              title="Comment"
            >
              <MessageCircle size={18} />
            </button>
          </div>
        </div>

        {/* Likes Drawer Panel */}
        {isLikesListOpen && (
          <div className="absolute bottom-0 inset-x-0 bg-zinc-900 border-t border-zinc-800 rounded-t-3xl z-30 p-5 max-h-[60%] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
              <h4 className="text-sm font-bold text-white">Liked by</h4>
              <button
                onClick={() => setIsLikesListOpen(false)}
                className="cursor-pointer text-xs text-zinc-400 hover:text-white px-2.5 py-1 bg-zinc-800 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {likingUsers.map((u) => (
                <UserProfileTrigger
                  key={u.id}
                  userId={u.id}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-zinc-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="h-8 w-8 rounded-full object-cover border border-zinc-800"
                    />
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-semibold text-white">
                        {u.name}
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        @{u.username}
                      </span>
                    </div>
                  </div>
                </UserProfileTrigger>
              ))}
            </div>
          </div>
        )}

        {/* Comments Drawer Panel */}
        {isCommentsOpen && (
          <div className="absolute bottom-0 inset-x-0 bg-zinc-900 border-t border-zinc-800 rounded-t-3xl z-30 p-4 max-h-[70%] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-3">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Comments</span>
                {currentStory.comments && currentStory.comments.length > 0 && (
                  <span className="bg-zinc-800 text-zinc-400 text-xs px-2 py-0.5 rounded-full">
                    {currentStory.comments.length}
                  </span>
                )}
              </h4>
              <button
                onClick={() => setIsCommentsOpen(false)}
                className="cursor-pointer text-xs text-zinc-400 hover:text-white px-2.5 py-1 bg-zinc-800 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>

            {/* Comments List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-3 min-h-[120px]">
              {!currentStory.comments || currentStory.comments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <span className="text-2xl mb-1">💬</span>
                  <p className="text-xs text-zinc-400 font-medium">
                    No comments yet
                  </p>
                  <p className="text-[10px] text-zinc-500">
                    Be the first to share your thoughts!
                  </p>
                </div>
              ) : (
                currentStory.comments.map((c) => (
                  <div
                    key={c.id}
                    className="flex items-start justify-between gap-3 p-2 rounded-xl hover:bg-zinc-850/50 transition-colors"
                  >
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <UserProfileTrigger
                        userId={c.userId}
                        className="flex-shrink-0"
                      >
                        <img
                          src={c.userAvatar}
                          alt={c.userName}
                          className="h-7 w-7 rounded-full object-cover border border-zinc-800"
                        />
                      </UserProfileTrigger>
                      <div className="flex flex-col text-left min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <UserProfileTrigger
                            userId={c.userId}
                            className="text-xs font-bold text-white hover:underline truncate"
                          >
                            {c.userName}
                          </UserProfileTrigger>
                          <span className="text-[10px] text-zinc-400">
                            @{c.username}
                          </span>
                          <span className="text-[9px] text-zinc-500">
                            • {getRelativeTime(c.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-300 mt-1 whitespace-pre-wrap break-words leading-relaxed">
                          {c.content}
                        </p>
                      </div>
                    </div>

                    {(currentUser?.id === c.userId ||
                      currentUser?.id === currentStory.userId) && (
                      <button
                        onClick={() => handleDeleteComment(c.id)}
                        className="cursor-pointer text-zinc-500 hover:text-rose-400 p-1 rounded-lg hover:bg-zinc-800 transition-colors flex-shrink-0"
                        title="Delete comment"
                      >
                        <Trash size={14} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Comment Input Box */}
            <form
              onSubmit={handleAddComment}
              className="flex items-center gap-2 border-t border-zinc-800 pt-3 bg-zinc-900"
            >
              {currentUser && (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="h-6 w-6 rounded-full object-cover border border-zinc-800 flex-shrink-0 hidden xs:block"
                />
              )}
              <input
                type="text"
                placeholder="Add a comment..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                className="flex-1 bg-zinc-950 text-white placeholder-zinc-500 text-xs px-3 py-2 rounded-xl border border-zinc-800 focus:outline-none focus:border-zinc-700 transition-colors"
              />
              <button
                type="submit"
                disabled={!commentContent.trim()}
                className="cursor-pointer text-xs font-bold text-white bg-zinc-800 hover:bg-zinc-750 px-3.5 py-2 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Post
              </button>
            </form>
          </div>
        )}

        {/* Desktop Side Navigation Chevrons */}
        <button
          onClick={prevStory}
          className="absolute left-[-60px] top-1/2 -translate-y-1/2 hidden md:flex cursor-pointer items-center justify-center rounded-full bg-zinc-900/60 p-2.5 text-zinc-400 border border-zinc-800 hover:text-white hover:bg-zinc-800 transition-colors z-20"
        >
          <ChevronLeft size={22} />
        </button>
        <button
          onClick={nextStory}
          className="absolute right-[-60px] top-1/2 -translate-y-1/2 hidden md:flex cursor-pointer items-center justify-center rounded-full bg-zinc-900/60 p-2.5 text-zinc-400 border border-zinc-800 hover:text-white hover:bg-zinc-800 transition-colors z-20"
        >
          <ChevronRight size={22} />
        </button>
      </div>
    </div>
  );
}
