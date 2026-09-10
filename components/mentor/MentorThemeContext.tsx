'use client';

import React, { createContext, useContext, useState } from 'react';

interface MentorThemeContextType {
  isDark: boolean;
  toggleDark: () => void;
}

const MentorThemeContext = createContext<MentorThemeContextType>({
  isDark: false,
  toggleDark: () => {},
});

export function MentorThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  return (
    <MentorThemeContext.Provider value={{ isDark, toggleDark: () => setIsDark(d => !d) }}>
      {children}
    </MentorThemeContext.Provider>
  );
}

export const useMentorTheme = () => useContext(MentorThemeContext);
