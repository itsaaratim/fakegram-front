'use client';

import React, { useState, useEffect } from 'react';
import { useFakegram } from '../utils/store';
import { API_URL } from '../utils/config';
import { X, Search, User } from './Icons';

interface FollowersModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'followers' | 'following';
}

export default function FollowersModal({ isOpen, onClose, initialTab = 'followers' }: FollowersModalProps) {
  const { currentUser, users, followUser, unfollowUser, removeFollower, fetchUsers } = useFakegram();
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>(
    initialTab === 'followers' ? 'followers' : 'following'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Sync latest users from backend when modal is opened to show new connections immediately
  useEffect(() => {
    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !currentUser) return;
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`${API_URL}/api/users/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          // Filter out current user from search results
          setSearchResults(data.filter((u: any) => u.id !== currentUser.id));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, isOpen, currentUser?.id]);

  if (!isOpen || !currentUser) return null;

  // Filter users lists based on tabs (when not searching)
  const getFollowersList = () => {
    return users.filter(u => currentUser.followers.includes(u.id));
  };

  const getFollowingList = () => {
    return users.filter(u => currentUser.following.includes(u.id));
  };

  const getActiveList = () => {
    switch (activeTab) {
      case 'followers':
        return getFollowersList();
      case 'following':
        return getFollowingList();
    }
  };

  // If search query is active, display searchResults. Otherwise, display the active tab list.
  const isSearchingActive = searchQuery.trim() !== '';
  const displayList = isSearchingActive ? searchResults : getActiveList();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-zinc-200 bg-white text-zinc-900 shadow-2xl animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 px-6 py-4">
          <h3 className="text-lg font-bold">Connections</h3>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab triggers */}
        <div className="flex border-b border-zinc-100 text-sm">
          <button
            onClick={() => {
              setActiveTab('followers');
              setSearchQuery('');
            }}
            className={`flex-1 py-3 text-center font-medium border-b-2 transition-all cursor-pointer ${
              activeTab === 'followers' && !isSearchingActive
                ? 'border-zinc-900 text-zinc-900 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-700'
            }`}
          >
            Followers ({currentUser.followers.length})
          </button>
          <button
            onClick={() => {
              setActiveTab('following');
              setSearchQuery('');
            }}
            className={`flex-1 py-3 text-center font-medium border-b-2 transition-all cursor-pointer ${
              activeTab === 'following' && !isSearchingActive
                ? 'border-zinc-900 text-zinc-900 font-semibold'
                : 'border-transparent text-zinc-400 hover:text-zinc-700'
            }`}
          >
            Following ({currentUser.following.length})
          </button>
        </div>

        {/* Search */}
        <div className="p-4">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search users by name or username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-2 pl-9 pr-4 text-xs text-zinc-900 placeholder-zinc-400 focus:border-zinc-350 focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* List Content */}
        <div className="px-4 pb-6 max-h-[45vh] overflow-y-auto min-h-[200px] space-y-3 scrollbar-thin">
          {isSearching && displayList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center text-zinc-400 animate-pulse">
              <p className="text-xs">Searching...</p>
            </div>
          ) : displayList.length > 0 ? (
            displayList.map((user) => (
              <div key={user.id} className="flex items-center justify-between rounded-xl bg-zinc-50 border border-zinc-100 p-2.5 hover:bg-zinc-100/60 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 overflow-hidden rounded-full border border-zinc-200 bg-zinc-150">
                    <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-semibold text-zinc-800">{user.name}</span>
                    <span className="text-[10px] text-zinc-400">@{user.username}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isSearchingActive ? (
                    currentUser.following.includes(user.id) ? (
                      <button
                        onClick={() => unfollowUser(user.id)}
                        className="cursor-pointer text-[10px] font-semibold text-zinc-550 bg-zinc-100 hover:bg-zinc-200 hover:text-zinc-900 rounded-lg px-2.5 py-1 transition-colors"
                      >
                        Unfollow
                      </button>
                    ) : (
                      <button
                        onClick={() => followUser(user.id)}
                        className="cursor-pointer text-[10px] font-semibold text-white bg-brand-blue hover:bg-brand-blue-hover rounded-lg px-2.5 py-1 transition-colors"
                      >
                        Follow
                      </button>
                    )
                  ) : (
                    <>
                      {activeTab === 'followers' && (
                        <>
                          {currentUser.following.includes(user.id) ? (
                            <span className="text-[10px] text-zinc-400 bg-zinc-200/50 rounded-lg px-2.5 py-1">Friends</span>
                          ) : (
                            <button
                              onClick={() => followUser(user.id)}
                              className="cursor-pointer text-[10px] font-semibold text-white bg-brand-blue hover:bg-brand-blue-hover rounded-lg px-2.5 py-1 transition-colors"
                            >
                              Follow Back
                            </button>
                          )}
                          <button
                            onClick={() => removeFollower(user.id)}
                            className="cursor-pointer text-[10px] font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg px-2.5 py-1 border border-rose-200/60 transition-colors"
                          >
                            Remove
                          </button>
                        </>
                      )}

                      {activeTab === 'following' && (
                        <button
                          onClick={() => unfollowUser(user.id)}
                          className="cursor-pointer text-[10px] font-semibold text-zinc-550 bg-zinc-100 hover:bg-zinc-200 hover:text-zinc-900 rounded-lg px-2.5 py-1 transition-colors"
                        >
                          Unfollow
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center text-zinc-400">
              <User size={36} className="text-zinc-300 mb-2" />
              <p className="text-xs">
                {searchQuery ? 'No matches found.' : 'No users in this list yet.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
