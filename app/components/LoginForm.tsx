"use client";

import React, { useState, useRef } from "react";
import { useFakegram } from "../utils/store";
import { User, Plus } from "./Icons";

export default function LoginForm() {
  const { login, register } = useFakegram();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [avatarFileName, setAvatarFileName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleFormMode = () => {
    setIsLogin(!isLogin);
    setUsername("");
    setPassword("");
    setName("");
    setBio("");
    setAvatar("");
    setAvatarFileName("");
    setError("");
    setSuccess("");
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username || !password) {
      setError("Please enter both username and password.");
      return;
    }

    const res = await login(username, password);
    if (!res.success) {
      setError(res.error || "Invalid username or password.");
    }
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      return;
    }

    if (file.size > 1024 * 1024) {
      setError("Image is too large. Please choose an avatar under 1MB.");
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

  const generateInitialsAvatar = (displayName: string) => {
    const initials = displayName.trim().slice(0, 2).toUpperCase() || "U";
    return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="%23f4f4f5" stroke="%23e4e4e7" stroke-width="2"/><text x="50" y="55" font-family="sans-serif" font-size="36" font-weight="bold" fill="%2371717a" text-anchor="middle" dominant-baseline="middle">${initials}</text></svg>`;
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!username || !password) {
      setError("Please fill in both username and password.");
      return;
    }

    if (username.length < 3) {
      setError("Username must be at least 3 characters.");
      return;
    }

    if (password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }

    const res = await register(username, username, "", "", password);
    if (!res.success) {
      setError(res.error || "Username is already taken.");
    } else {
      setSuccess("Account created successfully!");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4 py-12 text-zinc-900 selection:bg-zinc-205 selection:text-zinc-900">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-zinc-200 bg-white p-8 sm:p-10 shadow-xl">
        {/* Ambient background glow */}
        <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-violet-500/5 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-cyan-500/5 blur-3xl" />

        <div className="flex flex-col items-center mb-8">
          {/* Logo text updated to brand-blue */}
          <h2 className="text-3xl font-extrabold tracking-tight text-brand-blue">
            momotaro
          </h2>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-600">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-600">
            {success}
          </div>
        )}

        {isLogin ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5"
              >
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                  @
                </span>
                <input
                  id="username"
                  type="text"
                  placeholder="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pl-8 pr-4 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-zinc-350 focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 px-4 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-zinc-350 focus:bg-white focus:outline-none"
                required
              />
            </div>

            {/* Submit Button updated to brand-blue */}
            <button
              type="submit"
              className="w-full cursor-pointer rounded-xl bg-brand-blue py-3 text-sm font-semibold text-white transition-all hover:bg-brand-blue-hover active:scale-[0.98] shadow-sm"
            >
              Sign In
            </button>

            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setError("");
                }}
                className="cursor-pointer text-xs text-zinc-400 transition-colors hover:text-zinc-650"
              >
                Don't have an account?{" "}
                <span className="font-semibold text-indigo-650">Register</span>
              </button>
            </div>
          </form>
        ) : (
          <form
            onSubmit={handleRegisterSubmit}
            className="space-y-4 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin"
          >
            <div>
              <label
                htmlFor="reg-username"
                className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5"
              >
                Username *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-400">
                  @
                </span>
                <input
                  id="reg-username"
                  type="text"
                  placeholder="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 pl-8 pr-4 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-zinc-350 focus:bg-white focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="reg-password"
                className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5"
              >
                Password *
              </label>
              <input
                id="reg-password"
                type="password"
                placeholder="At least 4 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 py-3 px-4 text-sm text-zinc-900 placeholder-zinc-400 transition-colors focus:border-zinc-350 focus:bg-white focus:outline-none"
                required
              />
            </div>

            {/* Create Account Button updated to brand-blue */}
            <button
              type="submit"
              className="w-full cursor-pointer rounded-xl bg-brand-blue py-3 text-sm font-semibold text-white transition-all hover:bg-brand-blue-hover active:scale-[0.98] shadow-sm"
            >
              Create Account
            </button>

            <div className="text-center mt-6">
              <button
                type="button"
                onClick={toggleFormMode}
                className="cursor-pointer text-xs text-zinc-400 transition-colors hover:text-zinc-655"
              >
                Already have an account?{" "}
                <span className="font-semibold text-indigo-650">Sign In</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
