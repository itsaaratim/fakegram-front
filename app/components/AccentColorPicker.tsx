'use client';

import React, { useState, useEffect } from 'react';

// Helper to darken a hex color for the hover state
function darkenColor(hex: string, percent: number): string {
  let color = hex.replace(/^\s*#|\s*$/g, '');
  if (color.length === 3) {
    color = color.replace(/(.)/g, '$1$1');
  }
  let r = parseInt(color.substring(0, 2), 16);
  let g = parseInt(color.substring(2, 4), 16);
  let b = parseInt(color.substring(4, 6), 16);

  r = Math.max(0, Math.min(255, Math.round(r * (1 - percent / 100))));
  g = Math.max(0, Math.min(255, Math.round(g * (1 - percent / 100))));
  b = Math.max(0, Math.min(255, Math.round(b * (1 - percent / 100))));

  const rHex = r.toString(16).padStart(2, '0');
  const gHex = g.toString(16).padStart(2, '0');
  const bHex = b.toString(16).padStart(2, '0');

  return `#${rHex}${gHex}${bHex}`;
}

export default function AccentColorPicker() {
  const [color, setColor] = useState('#7baadc');

  useEffect(() => {
    // Load from localStorage on mount
    const savedColor = localStorage.getItem('fakegram_accent_color');
    if (savedColor) {
      setColor(savedColor);
      updateRootColors(savedColor);
    }
  }, []);

  const updateRootColors = (newColor: string) => {
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--color-brand-blue', newColor);
      const hoverColor = darkenColor(newColor, 15);
      document.documentElement.style.setProperty('--color-brand-blue-hover', hoverColor);
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setColor(newColor);
    updateRootColors(newColor);
    localStorage.setItem('fakegram_accent_color', newColor);
  };

  return (
    <div className="fixed bottom-24 md:bottom-8 right-6 z-50">
      <label 
        htmlFor="global-accent-picker" 
        className="relative cursor-pointer flex h-12 w-12 items-center justify-center rounded-full bg-white border border-zinc-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
        title="Customize Accent Color"
      >
        <span 
          className="h-7 w-7 rounded-full border border-black/5 shadow-inner transition-colors" 
          style={{ backgroundColor: color }}
        />
        <input
          id="global-accent-picker"
          type="color"
          value={color}
          onChange={handleColorChange}
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
        />
      </label>
    </div>
  );
}
