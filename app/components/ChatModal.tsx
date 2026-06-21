"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useFakegram } from "../utils/store";
import { X, MessageCircle, Search, ChevronLeft } from "./Icons";

export default function ChatModal() {
  const {
    currentUser,
    users,
    messages,
    sendMessage,
    isChatOpen,
    chatActiveUserId,
    openChat,
    closeChat,
    viewProfile,
  } = useFakegram();

  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [viewportHeight, setViewportHeight] = useState<string>("100dvh");

  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;

    const viewport = window.visualViewport;

    const updateHeight = () => {
      setViewportHeight(`${viewport.height}px`);
    };

    viewport.addEventListener("resize", updateHeight);
    viewport.addEventListener("scroll", updateHeight);
    updateHeight();

    // Trigger update after keyboard is fully focused
    const timer = setTimeout(updateHeight, 300);

    return () => {
      viewport.removeEventListener("resize", updateHeight);
      viewport.removeEventListener("scroll", updateHeight);
      clearTimeout(timer);
    };
  }, [isChatOpen]);

  // Get active conversations and contacts
  const contacts = useMemo(() => {
    if (!currentUser) return [];

    const connectionIds = new Set<string>([
      ...currentUser.following,
      ...currentUser.followers,
    ]);

    // Also include anyone we have messages with
    messages.forEach((msg) => {
      if (msg.senderId !== currentUser.id) connectionIds.add(msg.senderId);
      if (msg.receiverId !== currentUser.id) connectionIds.add(msg.receiverId);
    });

    return users.filter((u) => u.id !== currentUser.id && connectionIds.has(u.id));
  }, [currentUser, users, messages]);

  // Sort contacts by latest message timestamp
  const sortedContacts = useMemo(() => {
    if (!currentUser) return [];

    return [...contacts].sort((a, b) => {
      const aMsgs = messages.filter(
        (m) =>
          (m.senderId === currentUser.id && m.receiverId === a.id) ||
          (m.senderId === a.id && m.receiverId === currentUser.id)
      );
      const aLatest =
        aMsgs.length > 0
          ? new Date(aMsgs[aMsgs.length - 1].createdAt).getTime()
          : 0;

      const bMsgs = messages.filter(
        (m) =>
          (m.senderId === currentUser.id && m.receiverId === b.id) ||
          (m.senderId === b.id && m.receiverId === currentUser.id)
      );
      const bLatest =
        bMsgs.length > 0
          ? new Date(bMsgs[bMsgs.length - 1].createdAt).getTime()
          : 0;

      if (aLatest !== bLatest) {
        return bLatest - aLatest; // latest first
      }

      return a.name.localeCompare(b.name);
    });
  }, [contacts, messages, currentUser]);

  // Filter contacts by search query
  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return sortedContacts;
    const query = searchQuery.toLowerCase();
    return sortedContacts.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.username.toLowerCase().includes(query)
    );
  }, [sortedContacts, searchQuery]);

  const activeContact = useMemo(() => {
    return users.find((u) => u.id === chatActiveUserId) || null;
  }, [users, chatActiveUserId]);

  const activeChatMessages = useMemo(() => {
    if (!currentUser || !chatActiveUserId) return [];
    return messages.filter(
      (m) =>
        (m.senderId === currentUser.id && m.receiverId === chatActiveUserId) ||
        (m.senderId === chatActiveUserId && m.receiverId === currentUser.id)
    );
  }, [messages, currentUser, chatActiveUserId]);

  // Auto scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeChatMessages.length, isChatOpen, chatActiveUserId]);

  if (!isChatOpen || !currentUser) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatActiveUserId || !inputText.trim()) return;

    const ok = await sendMessage(chatActiveUserId, inputText.trim());
    if (ok) {
      setInputText("");
    }
  };

  const getLatestSnippet = (contactId: string) => {
    if (!currentUser) return { content: "", time: "" };

    const contactMsgs = messages.filter(
      (m) =>
        (m.senderId === currentUser.id && m.receiverId === contactId) ||
        (m.senderId === contactId && m.receiverId === currentUser.id)
    );

    if (contactMsgs.length === 0) {
      return { content: "No messages yet", time: "" };
    }

    const latest = contactMsgs[contactMsgs.length - 1];
    const prefix = latest.senderId === currentUser.id ? "You: " : "";
    return {
      content: prefix + latest.content,
      time: formatTime(latest.createdAt),
    };
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const isToday = date.toDateString() === now.toDateString();
      if (isToday) {
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      }
      return (
        date.toLocaleDateString([], { month: "short", day: "numeric" }) +
        " " +
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    } catch {
      return "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-0 sm:p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        style={{ height: typeof window !== "undefined" && window.innerWidth < 640 ? viewportHeight : undefined }}
        className="relative w-full max-w-4xl h-full sm:h-[80vh] overflow-hidden sm:rounded-3xl border border-zinc-200 bg-white text-zinc-900 shadow-2xl flex flex-col animate-in zoom-in-95 duration-200"
      >
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4 flex-shrink-0 bg-white">
          <div className="flex items-center gap-2">
            <MessageCircle size={20} className="text-brand-blue" />
            <h3 className="text-lg font-bold flex items-center gap-2">
              Direct Messages
            </h3>
          </div>
          <button
            onClick={closeChat}
            className="cursor-pointer rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex flex-1 overflow-hidden relative">
          
          {/* Left panel: Contacts (Hidden on mobile when chat is active) */}
          <div
            className={`w-full md:w-80 border-r border-zinc-100 flex flex-col flex-shrink-0 bg-zinc-50/40 ${
              chatActiveUserId ? "hidden md:flex" : "flex"
            }`}
          >
            {/* Search connection bar */}
            <div className="p-4 border-b border-zinc-100 bg-white flex-shrink-0">
              <div className="relative flex items-center">
                <Search size={14} className="absolute left-3 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Search connection..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-4 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-300 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            {/* Contacts Scroll list */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredContacts.length > 0 ? (
                filteredContacts.map((contact) => {
                  const isActive = chatActiveUserId === contact.id;
                  const snippet = getLatestSnippet(contact.id);

                  return (
                    <button
                      key={contact.id}
                      onClick={() => openChat(contact.id)}
                      className={`w-full text-left flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer ${
                        isActive
                          ? "bg-zinc-100/80 font-medium"
                          : "hover:bg-zinc-100/50"
                      }`}
                    >
                      <div className="h-10 w-10 rounded-full border border-zinc-100 overflow-hidden shrink-0">
                        <img
                          src={contact.avatar}
                          alt={contact.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col text-left">
                        <div className="flex justify-between items-baseline">
                          <span className="text-xs font-bold text-zinc-800 truncate">
                            {contact.name}
                          </span>
                          <span className="text-[9px] text-zinc-400 select-none">
                            {snippet.time}
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-450 truncate mt-0.5">
                          {snippet.content}
                        </span>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="text-center p-6 text-zinc-400">
                  <span className="text-xs">No connections found.</span>
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Chat messages (Hidden on mobile if no active chat) */}
          <div
            className={`flex-1 flex flex-col bg-white ${
              chatActiveUserId ? "flex" : "hidden md:flex"
            }`}
          >
            {activeContact ? (
              <>
                {/* Chat Partner Header */}
                <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3 flex-shrink-0 bg-white">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => openChat(null)}
                      className="md:hidden p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 rounded-lg"
                      title="Back to Chats"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <div className="h-9 w-9 rounded-full border border-zinc-200 overflow-hidden">
                      <img
                        src={activeContact.avatar}
                        alt={activeContact.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-zinc-800">
                        {activeContact.name}
                      </span>
                      <span className="text-[9px] text-zinc-400">
                        @{activeContact.username}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => viewProfile(activeContact.id)}
                    className="cursor-pointer text-[10px] font-extrabold text-brand-blue uppercase tracking-wider hover:underline"
                  >
                    View Profile
                  </button>
                </div>

                {/* Messages scroll area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-zinc-50/20">
                  {activeChatMessages.length > 0 ? (
                    activeChatMessages.map((m) => {
                      const isMe = m.senderId === currentUser.id;
                      return (
                        <div
                          key={m.id}
                          className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-inner text-xs break-words leading-relaxed text-left ${
                              isMe
                                ? "bg-brand-blue text-white rounded-tr-none"
                                : "bg-zinc-100 text-zinc-800 rounded-tl-none"
                            }`}
                          >
                            {m.content}
                            <span
                              className={`block text-[8px] text-right mt-1.5 select-none ${
                                isMe ? "text-white/70" : "text-zinc-400"
                              }`}
                            >
                              {formatTime(m.createdAt)}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="h-full flex items-center justify-center text-center text-zinc-400 p-6">
                      <div className="flex flex-col items-center">
                        <MessageCircle size={24} className="text-zinc-300 mb-2" />
                        <span className="text-[11px]">
                          Say hello to {activeContact.name}!
                        </span>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input form */}
                <form
                  onSubmit={handleSend}
                  className="border-t border-zinc-100 p-4 flex gap-2 flex-shrink-0 bg-white"
                >
                  <input
                    type="text"
                    placeholder="Write a message..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="flex-1 rounded-xl border border-zinc-200 bg-zinc-50 py-2.5 px-4 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-350 focus:bg-white focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="cursor-pointer rounded-xl bg-brand-blue px-4 py-2 text-xs font-semibold text-white hover:bg-brand-blue-hover transition-colors disabled:opacity-50"
                  >
                    Send
                  </button>
                </form>
              </>
            ) : (
              <div className="hidden md:flex flex-col items-center justify-center flex-1 p-6 text-center text-zinc-400 bg-zinc-50/20">
                <div className="h-16 w-16 rounded-full bg-zinc-100 flex items-center justify-center mb-4 text-zinc-350 shadow-inner">
                  <MessageCircle size={32} />
                </div>
                <h4 className="text-sm font-bold text-zinc-700 mb-1">Your Messages</h4>
                <p className="text-xs text-zinc-400 max-w-[280px]">
                  Select a connection from the left list to view conversation details and start chatting.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
