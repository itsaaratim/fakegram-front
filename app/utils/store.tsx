"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User, Story } from "./mockData";
import { API_URL } from "./config";

interface FakegramContextType {
  currentUser: User | null;
  users: User[];
  stories: Story[];
  feedStories: Story[];
  isLoading: boolean;

  // Global modal state orchestration
  viewingUserProfileId: string | null;
  viewingStoryUserId: string | null;
  viewProfile: (userId: string | null) => void;
  viewStory: (userId: string | null) => void;

  login: (username: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    username: string,
    name: string,
    avatar: string,
    bio: string,
    password?: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (
    name: string,
    username: string,
    avatar: string,
    bio: string,
    statusEmoji?: string,
    statusText?: string,
    spotifyUrl?: string,
    pronouns?: string,
    birthday?: string,
  ) => Promise<boolean>;
  addStory: (
    type: "text" | "image",
    content: string,
    background: string,
  ) => Promise<void>;
  deleteStory: (storyId: string) => Promise<void>;
  likeStory: (storyId: string) => Promise<void>;
  followUser: (userId: string) => Promise<void>;
  unfollowUser: (userId: string) => Promise<void>;
  removeFollower: (userId: string) => Promise<void>;
}

const FakegramContext = createContext<FakegramContextType | undefined>(
  undefined,
);

export const useFakegram = () => {
  const context = useContext(FakegramContext);
  if (!context) {
    throw new Error("useFakegram must be used within a FakegramProvider");
  }
  return context;
};

function dataURItoBlob(dataURI: string): Blob {
  try {
    let byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
      byteString = atob(dataURI.split(',')[1]);
    else
      byteString = unescape(dataURI.split(',')[2] || dataURI.split(',')[1] || '');

    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    const ia = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], { type: mimeString });
  } catch (e) {
    console.error('Failed to convert base64 dataURI to Blob', e);
    return new Blob([], { type: 'image/png' });
  }
}

export const FakegramProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Global UI modal states
  const [viewingUserProfileId, setViewingUserProfileId] = useState<
    string | null
  >(null);
  const [viewingStoryUserId, setViewingStoryUserId] = useState<string | null>(
    null,
  );

  const viewProfile = (userId: string | null) => {
    setViewingUserProfileId(userId);
    if (userId !== null) {
      setViewingStoryUserId(null); // Close story viewer when viewing profile
    }
  };

  const viewStory = (userId: string | null) => {
    setViewingStoryUserId(userId);
    if (userId !== null) {
      setViewingUserProfileId(null); // Close profile view when starting story
    }
  };

  // Initialize data from backend API
  useEffect(() => {
    const initData = async () => {
      try {
        setIsLoading(true);
        
        // Sync token first
        const storedToken = localStorage.getItem("fakegram_token");
        if (storedToken) {
          setToken(storedToken);
        }

        // Fetch users
        const usersRes = await fetch(`${API_URL}/api/users`);
        if (usersRes.ok) {
          const loadedUsers = await usersRes.json();
          setUsers(loadedUsers);
        }

        // Fetch stories
        const storiesRes = await fetch(`${API_URL}/api/stories`);
        if (storiesRes.ok) {
          const loadedStories = await storiesRes.json();
          setStories(loadedStories);
        }

        // Sync logged in user if stored
        const storedCurrentUser = localStorage.getItem("fakegram_current_user");
        if (storedCurrentUser) {
          const parsedUser = JSON.parse(storedCurrentUser);
          
          // Re-fetch latest users to keep in-memory context correct
          const userRes = await fetch(`${API_URL}/api/users`);
          if (userRes.ok) {
            const allUsers = await userRes.json();
            const syncedUser = allUsers.find((u: any) => u.id === parsedUser.id) || parsedUser;
            setCurrentUser(syncedUser);
            localStorage.setItem("fakegram_current_user", JSON.stringify(syncedUser));
          } else {
            setCurrentUser(parsedUser);
          }
        }
      } catch (err) {
        console.error('Failed to load backend data:', err);
        // Fallback to local storage session if server is offline
        const cachedCurrentUser = localStorage.getItem('fakegram_current_user');
        if (cachedCurrentUser) setCurrentUser(JSON.parse(cachedCurrentUser));
        
        const cachedToken = localStorage.getItem('fakegram_token');
        if (cachedToken) setToken(cachedToken);
      } finally {
        setIsLoading(false);
      }
    };

    initData();
  }, []);

  // Sync state changes helper
  const saveState = (
    updatedUsers: User[],
    updatedStories: Story[],
    updatedCurrentUser: User | null,
  ) => {
    setUsers(updatedUsers);
    setStories(updatedStories);
    setCurrentUser(updatedCurrentUser);
  };

  const login = async (username: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.replace("@", ""),
          password: password || 'password123', // fallback for seed demo buttons
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        return { success: false, error: data.error || 'Login failed' };
      }

      const data = await res.json();
      setToken(data.token);
      localStorage.setItem('fakegram_token', data.token);
      setCurrentUser(data.user);
      localStorage.setItem('fakegram_current_user', JSON.stringify(data.user));
      
      // Update stories in memory
      const storiesRes = await fetch(`${API_URL}/api/stories`);
      if (storiesRes.ok) {
        setStories(await storiesRes.json());
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Server error' };
    }
  };

  const register = async (
    username: string,
    name: string,
    avatar: string,
    bio: string,
    password?: string,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const formData = new FormData();
      formData.append('id', `user-${Date.now()}`);
      formData.append('username', username.replace("@", ""));
      formData.append('name', name.trim());
      formData.append('bio', bio.trim());
      formData.append('password', password || 'password123');

      if (avatar && avatar.startsWith('data:image')) {
        const blob = dataURItoBlob(avatar);
        formData.append('avatarFile', blob, 'avatar.png');
      } else {
        formData.append('avatar', avatar);
      }

      const res = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        return { success: false, error: data.error || 'Registration failed' };
      }

      const data = await res.json();
      setToken(data.token);
      localStorage.setItem('fakegram_token', data.token);
      setCurrentUser(data.user);
      localStorage.setItem('fakegram_current_user', JSON.stringify(data.user));

      // Re-fetch users
      const usersRes = await fetch(`${API_URL}/api/users`);
      if (usersRes.ok) {
        setUsers(await usersRes.json());
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Server error' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem("fakegram_current_user");
    localStorage.removeItem("fakegram_token");
    setViewingUserProfileId(null);
    setViewingStoryUserId(null);
  };

  const updateProfile = async (
    name: string,
    username: string,
    avatar: string,
    bio: string,
    statusEmoji?: string,
    statusText?: string,
    spotifyUrl?: string,
    pronouns?: string,
    birthday?: string,
  ): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      const activeToken = token;
      const formData = new FormData();
      formData.append('id', currentUser.id);
      formData.append('name', name.trim());
      formData.append('username', username.replace("@", ""));
      formData.append('bio', bio.trim());
      formData.append('statusEmoji', statusEmoji || '');
      formData.append('statusText', statusText || '');
      formData.append('spotifyUrl', spotifyUrl?.trim() || '');
      formData.append('pronouns', pronouns?.trim() || '');
      formData.append('birthday', birthday?.trim() || '');

      if (avatar && avatar.startsWith('data:image')) {
        const blob = dataURItoBlob(avatar);
        formData.append('avatarFile', blob, 'avatar.png');
      } else {
        formData.append('avatar', avatar);
      }

      const res = await fetch(`${API_URL}/api/auth/update-profile`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${activeToken}`
        },
        body: formData,
      });

      if (!res.ok) return false;

      const updatedUser = await res.json();
      setCurrentUser(updatedUser);
      localStorage.setItem('fakegram_current_user', JSON.stringify(updatedUser));

      // Refresh users and stories
      const usersRes = await fetch(`${API_URL}/api/users`);
      if (usersRes.ok) setUsers(await usersRes.json());

      const storiesRes = await fetch(`${API_URL}/api/stories`);
      if (storiesRes.ok) setStories(await storiesRes.json());

      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  };

  const addStory = async (
    type: "text" | "image",
    content: string,
    background: string,
  ): Promise<void> => {
    if (!currentUser) return;

    try {
      const activeToken = token;
      const formData = new FormData();
      formData.append('userId', currentUser.id);
      formData.append('type', type);
      formData.append('background', background);

      if (type === 'image' && content.startsWith('data:image')) {
        const blob = dataURItoBlob(content);
        formData.append('imageFile', blob, 'story.png');
      } else {
        formData.append('content', content);
      }

      const res = await fetch(`${API_URL}/api/stories`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${activeToken}`
        },
        body: formData,
      });

      if (res.ok) {
        const updatedStories = await res.json();
        setStories(updatedStories);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteStory = async (storyId: string): Promise<void> => {
    if (!currentUser) return;
    try {
      const activeToken = token;
      const res = await fetch(`${API_URL}/api/stories/${storyId}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify({ userId: currentUser.id }),
      });

      if (res.ok) {
        setStories((prev) => prev.filter((s) => s.id !== storyId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const likeStory = async (storyId: string): Promise<void> => {
    if (!currentUser) return;
    try {
      const activeToken = token;
      const res = await fetch(`${API_URL}/api/stories/${storyId}/like`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify({ userId: currentUser.id }),
      });

      if (res.ok) {
        const data = await res.json();
        setStories((prev) =>
          prev.map((s) => (s.id === storyId ? { ...s, likes: data.likes } : s))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const followUser = async (userIdToFollow: string): Promise<void> => {
    if (!currentUser || currentUser.id === userIdToFollow) return;
    try {
      const activeToken = token;
      const res = await fetch(`${API_URL}/api/users/${userIdToFollow}/follow`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify({ followerId: currentUser.id }),
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.currentUser);
        localStorage.setItem('fakegram_current_user', JSON.stringify(data.currentUser));
        setUsers((prev) =>
          prev.map((u) => {
            if (u.id === currentUser.id) return data.currentUser;
            if (u.id === userIdToFollow) return data.targetUser;
            return u;
          })
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const unfollowUser = async (userIdToUnfollow: string): Promise<void> => {
    await followUser(userIdToUnfollow);
  };

  const removeFollower = async (followerIdToRemove: string): Promise<void> => {
    if (!currentUser) return;
    try {
      const activeToken = token;
      const res = await fetch(`${API_URL}/api/users/${followerIdToRemove}/remove-follower`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${activeToken}`
        },
        body: JSON.stringify({ currentUserId: currentUser.id }),
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.currentUser);
        localStorage.setItem('fakegram_current_user', JSON.stringify(data.currentUser));
        setUsers((prev) =>
          prev.map((u) => {
            if (u.id === currentUser.id) return data.currentUser;
            if (u.id === followerIdToRemove) return data.targetUser;
            return u;
          })
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getFeedStories = (): Story[] => {
    if (!currentUser) return [];

    const now = new Date().getTime();
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;

    return stories.filter((story) => {
      const storyTime = new Date(story.createdAt).getTime();
      const isRecent = storyTime >= twentyFourHoursAgo;
      const isAllowedUser =
        story.userId === currentUser.id ||
        currentUser.following.includes(story.userId);
      return isRecent && isAllowedUser;
    });
  };

  return (
    <FakegramContext.Provider
      value={{
        currentUser,
        users,
        stories,
        feedStories: getFeedStories(),
        isLoading,
        viewingUserProfileId,
        viewingStoryUserId,
        viewProfile,
        viewStory,
        login,
        register,
        logout,
        updateProfile,
        addStory,
        deleteStory,
        likeStory,
        followUser,
        unfollowUser,
        removeFollower,
      }}
    >
      {children}
    </FakegramContext.Provider>
  );
};
