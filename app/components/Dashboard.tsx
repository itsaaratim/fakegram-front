"use client";

import React, { useState } from "react";
import { useFakegram } from "../utils/store";
import { Plus, Trash, User, Heart } from "./Icons";
import StoryViewer from "./StoryViewer";
import AddStoryModal from "./AddStoryModal";
import EditProfileModal from "./EditProfileModal";
import FollowersModal from "./FollowersModal";
import UserProfileModal from "./UserProfileModal";
import UserProfileTrigger from "./UserProfileTrigger";
import ProfileCard from "./ProfileCard";
import ChatModal from "./ChatModal";

export default function Dashboard() {
  const {
    currentUser,
    users,
    feedStories,
    deleteStory,
    unfollowUser,
    viewingUserProfileId,
    viewingStoryUserId,
    viewProfile,
    viewStory,
  } = useFakegram();

  // Modal open states (local to dashboard layout)
  const [isAddStoryOpen, setIsAddStoryOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isConnectionsOpen, setIsConnectionsOpen] = useState(false);
  const [connectionsTab, setConnectionsTab] = useState<
    "followers" | "following"
  >("followers");

  // Tab state for the feed: "All Stories" vs "My Stories Only"
  const [feedFilter, setFeedFilter] = useState<"all" | "mine">("all");

  if (!currentUser) return null;

  // Filter feed based on tab selection
  const filteredStories =
    feedFilter === "all"
      ? feedStories
      : feedStories.filter((s) => s.userId === currentUser.id);

  // Get unique users who have active stories, for the horizontal tray, with status metadata
  const uniqueStoryUsers = feedStories.reduce(
    (
      acc: {
        id: string;
        name: string;
        avatar: string;
        username: string;
        statusEmoji?: string;
        statusText?: string;
      }[],
      story,
    ) => {
      if (
        story.userId !== currentUser.id &&
        !acc.some((u) => u.id === story.userId)
      ) {
        const uDetails = users.find((u) => u.id === story.userId);
        acc.push({
          id: story.userId,
          name: story.userName,
          avatar: story.userAvatar,
          username: story.username,
          statusEmoji: uDetails?.statusEmoji,
          statusText: uDetails?.statusText,
        });
      }
      return acc;
    },
    [],
  );

  // Helper to open connections modal on specific tabs
  const openConnections = (tab: "followers" | "following") => {
    setConnectionsTab(tab);
    setIsConnectionsOpen(true);
  };

  // Helper to get formatted date string
  const formatStoryDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Helper to dynamically calculate contrast text color for solid backgrounds
  const getStoryTextColorClass = (hexColor: string) => {
    const hex = hexColor.trim();
    if (!hex.startsWith("#")) return "text-zinc-900"; // fallback
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luma > 140 ? "text-zinc-900" : "text-white";
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-zinc-200 selection:text-zinc-900">
      {/* Main Dashboard Layout (No top header) */}
      <main className="mx-auto grid max-w-6xl grid-cols-1 lg:grid-cols-12 gap-8 px-4 py-12">
        {/* Left Column: User Profile Panel & Branding */}
        <section className="lg:col-span-4 space-y-6">
          {/* Minimal Brand logo above the profile card - updated text color to brand-blue */}
          <div className="pb-2 pl-2 flex flex-col items-center lg:items-start text-center lg:text-left">
            <h1
              className="text-3xl font-extrabold tracking-tight text-brand-blue cursor-pointer"
              onClick={() => setFeedFilter("all")}
            >
              momotaro
            </h1>
          </div>

          {/* Profile Details Card */}
          <ProfileCard
            setIsEditProfileOpen={setIsEditProfileOpen}
            setIsAddStoryOpen={setIsAddStoryOpen}
            openConnections={openConnections}
          />
          <div className="grid grid-cols-2 gap-4 w-full border-y border-zinc-100 py-4 mb-6">
            <button
              onClick={() => openConnections("followers")}
              className="flex cursor-pointer flex-col items-center group"
            >
              <span className="text-sm font-extrabold text-zinc-800 group-hover:text-zinc-900">
                {currentUser.followers.length}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium mt-0.5">
                Followers
              </span>
            </button>
            <button
              onClick={() => openConnections("following")}
              className="flex cursor-pointer flex-col items-center group"
            >
              <span className="text-sm font-extrabold text-zinc-800 group-hover:text-zinc-900">
                {currentUser.following.length}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium mt-0.5">
                Following
              </span>
            </button>
          </div>
        </section>

        {/* Right/Center Column: Stories Tray & Feed */}
        <section className="lg:col-span-8 space-y-6">
          {/* Stories Tray */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3.5">
              Stories
            </h3>
            <div className="flex items-center gap-4 overflow-x-auto pb-1 scrollbar-none">
              {/* Current User Story Bubble */}
              <div className="flex flex-col items-center shrink-0">
                <div className="relative">
                  <button
                    onClick={() => {
                      if (
                        feedStories.some((s) => s.userId === currentUser.id)
                      ) {
                        viewStory(currentUser.id);
                      } else {
                        setIsAddStoryOpen(true);
                      }
                    }}
                    className={`cursor-pointer h-16 w-16 overflow-hidden rounded-full border p-0.5 bg-white transition-all active:scale-95 ${
                      feedStories.some((s) => s.userId === currentUser.id)
                        ? "border-brand-blue ring-2 ring-zinc-200"
                        : "border-zinc-200 hover:border-zinc-400"
                    }`}
                  >
                    <img
                      src={currentUser.avatar}
                      alt="You"
                      className="h-full w-full rounded-full object-cover"
                    />
                  </button>

                  {/* Status Bubble Emoji Overlay for Current User */}
                  {currentUser.statusEmoji && (
                    <div
                      className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white border border-zinc-200 shadow-sm text-xs cursor-pointer transition-transform hover:scale-110"
                      title={currentUser.statusText || "Edit Status"}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsEditProfileOpen(true);
                      }}
                    >
                      {currentUser.statusEmoji}
                    </div>
                  )}

                  {/* Plus Badge */}
                  <button
                    onClick={() => setIsAddStoryOpen(true)}
                    className="absolute bottom-0 right-0 cursor-pointer flex h-5 w-5 items-center justify-center rounded-full bg-zinc-900 text-white shadow transition-transform hover:scale-105"
                  >
                    <Plus size={10} className="stroke-[3]" />
                  </button>
                </div>
                <span className="text-[10px] text-zinc-500 font-medium mt-1.5">
                  Your Story
                </span>
              </div>

              {/* Friends Story Bubbles */}
              {uniqueStoryUsers.length > 0
                ? uniqueStoryUsers.map((user) => (
                    <div
                      key={user.id}
                      className="flex flex-col items-center shrink-0 relative"
                    >
                      <div className="relative">
                        <button
                          onClick={() => viewStory(user.id)}
                          className="cursor-pointer h-16 w-16 overflow-hidden rounded-full border-2 border-brand-blue p-0.5 bg-white transition-all hover:scale-[1.02] active:scale-95 ring-2 ring-zinc-100"
                        >
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="h-full w-full rounded-full object-cover"
                          />
                        </button>

                        {/* Status Bubble Emoji Overlay */}
                        {user.statusEmoji && (
                          <div
                            className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white border border-zinc-200 shadow-sm text-xs cursor-pointer transition-transform hover:scale-110"
                            title={user.statusText || "Status"}
                            onClick={(e) => {
                              e.stopPropagation(); // Stop opening story viewer
                              viewProfile(user.id); // View user profile details instead!
                            }}
                          >
                            {user.statusEmoji}
                          </div>
                        )}
                      </div>
                      {/* Clickable user profile trigger name */}
                      <UserProfileTrigger
                        userId={user.id}
                        className="text-[10px] text-zinc-655 font-medium mt-1.5 truncate max-w-[64px] hover:underline"
                      >
                        {user.name.split(" ")[0]}
                      </UserProfileTrigger>
                    </div>
                  ))
                : ""}
            </div>
          </div>

          {/* Feed Filter Header */}
          <div className="flex items-center justify-between| pb-3">
            <div className="flex gap-4">
              <button
                onClick={() => setFeedFilter("all")}
                className={`text-sm font-semibold transition-all relative pb-2.5 cursor-pointer ${
                  feedFilter === "all"
                    ? "text-zinc-900"
                    : "text-zinc-400 hover:text-zinc-655"
                }`}
              >
                All Stories
                {feedFilter === "all" && (
                  <span className="absolute bottom-0 inset-x-0 h-0.5 bg-zinc-900 rounded-full" />
                )}
              </button>
              <button
                onClick={() => setFeedFilter("mine")}
                className={`text-sm font-semibold transition-all relative pb-2.5 cursor-pointer ${
                  feedFilter === "mine"
                    ? "text-zinc-900"
                    : "text-zinc-400 hover:text-zinc-655"
                }`}
              >
                My Posts (
                {feedStories.filter((s) => s.userId === currentUser.id).length})
                {feedFilter === "mine" && (
                  <span className="absolute bottom-0 inset-x-0 h-0.5 bg-zinc-900 rounded-full" />
                )}
              </button>
            </div>
          </div>

          {/* Stories Grid/Feed */}
          {filteredStories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredStories.map((story) => (
                <div
                  key={story.id}
                  className="group relative flex flex-col rounded-3xl border border-zinc-200 bg-white p-4 transition-all hover:border-zinc-300 hover:shadow-sm overflow-hidden shadow-sm"
                >
                  {/* Post Header with Clickable User Profile Trigger */}
                  <div className="flex items-center justify-between mb-4">
                    <UserProfileTrigger
                      userId={story.userId}
                      className="flex items-center gap-2.5 hover:opacity-90 group/header"
                    >
                      <div className="relative">
                        <img
                          src={story.userAvatar}
                          alt={story.userName}
                          className="h-7 w-7 rounded-full object-cover border border-zinc-200"
                        />
                        {/* Status badge in post header */}
                        {(() => {
                          const u = users.find(
                            (usr) => usr.id === story.userId,
                          );
                          return u?.statusEmoji ? (
                            <span
                              className="absolute -top-1 -right-1 text-[8px] bg-white rounded-full h-3.5 w-3.5 flex items-center justify-center border border-zinc-200 shadow-sm"
                              title={u.statusText}
                            >
                              {u.statusEmoji}
                            </span>
                          ) : null;
                        })()}
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-xs font-semibold text-zinc-800 group-hover/header:underline">
                          {story.userName}
                        </span>
                        <span className="text-[9px] text-zinc-400">
                          @{story.username}
                        </span>
                      </div>
                    </UserProfileTrigger>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] text-zinc-455">
                        {formatStoryDate(story.createdAt)}
                      </span>
                      {currentUser.id === story.userId ? (
                        <button
                          onClick={() => deleteStory(story.id)}
                          title="Delete Story"
                          className="cursor-pointer rounded-lg p-1 text-zinc-400 hover:text-rose-500 hover:bg-zinc-50 transition-colors"
                        >
                          <Trash size={13} />
                        </button>
                      ) : (
                        <button
                          onClick={() => unfollowUser(story.userId)}
                          title="Unfollow user"
                          className="cursor-pointer text-[9px] font-bold text-zinc-500 hover:text-rose-600 bg-zinc-100/60 rounded px-1.5 py-0.5 border border-zinc-200"
                        >
                          Unfollow
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Post Visual Content */}
                  <div
                    onClick={() => viewStory(story.userId)}
                    className="cursor-pointer relative aspect-[3/4] rounded-2xl overflow-hidden border border-zinc-150 flex items-center justify-center bg-zinc-50"
                  >
                    {story.type === "image" ? (
                      <img
                        src={story.content}
                        alt="Story Content"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-102"
                      />
                    ) : (
                      <div
                        className={`h-full w-full p-6 flex flex-col justify-center items-center text-center ${getStoryTextColorClass(story.background)}`}
                        style={{ backgroundColor: story.background }}
                      >
                        <p className="font-sans font-medium text-sm break-words leading-relaxed">
                          {story.content}
                        </p>
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="rounded-full bg-white px-3.5 py-1.5 text-[10px] font-semibold text-zinc-800 shadow border border-zinc-200">
                        View Story
                      </span>
                    </div>
                  </div>

                  {/* Mini actions row */}
                  <div className="flex items-center justify-between mt-3 text-zinc-400 px-1 text-[10px]">
                    <div className="flex items-center gap-1">
                      <Heart
                        size={12}
                        className="text-zinc-305 hover:text-rose-500 transition-colors cursor-pointer"
                      />
                      <span>Tap to view</span>
                    </div>
                    {currentUser.id === story.userId && (
                      <span className="text-[9px] text-zinc-455">
                        Your Story
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center border border-dashed border-zinc-200 bg-white rounded-3xl py-16 text-center text-zinc-455 shadow-sm">
              <User size={36} className="text-zinc-300 mb-3" />
              <h4 className="text-sm font-semibold text-zinc-650">
                No stories to show
              </h4>
              <button
                onClick={() => setIsAddStoryOpen(true)}
                className="cursor-pointer mt-4 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2 text-xs font-semibold text-zinc-600 hover:border-zinc-350 hover:text-zinc-900 transition-all shadow-sm"
              >
                Create Your First Story
              </button>
            </div>
          )}
        </section>
      </main>

      {/* Story Viewer Modal */}
      {viewingStoryUserId && (
        <StoryViewer
          initialUserId={viewingStoryUserId}
          onClose={() => viewStory(null)}
        />
      )}

      {/* Add Story Modal */}
      <AddStoryModal
        isOpen={isAddStoryOpen}
        onClose={() => setIsAddStoryOpen(false)}
      />

      {/* Edit Profile Modal */}
      {isEditProfileOpen && (
        <EditProfileModal
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
        />
      )}

      {/* Connections Modal */}
      {isConnectionsOpen && (
        <FollowersModal
          isOpen={isConnectionsOpen}
          onClose={() => setIsConnectionsOpen(false)}
          initialTab={connectionsTab}
        />
      )}

      {/* Single User Profile Viewer Modal */}
      {viewingUserProfileId && (
        <UserProfileModal
          userId={viewingUserProfileId}
          onClose={() => viewProfile(null)}
          onSelectStory={(userId) => {
            viewStory(userId);
          }}
        />
      )}

      {/* Chat Modal */}
      <ChatModal />
    </div>
  );
}
