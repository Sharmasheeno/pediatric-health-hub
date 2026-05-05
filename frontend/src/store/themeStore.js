import { create } from 'zustand';

// Read initial state synchronously from localStorage
const getInitialDark = () => {
  try {
    return localStorage.getItem('phh-dark') === 'true';
  } catch {
    return false;
  }
};

const applyTheme = (isDark) => {
  if (isDark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
};

// Apply immediately on import (before React renders)
applyTheme(getInitialDark());

const useThemeStore = create((set) => ({
  isDark: getInitialDark(),
  toggleTheme: () => set((state) => {
    const newDark = !state.isDark;
    applyTheme(newDark);
    localStorage.setItem('phh-dark', String(newDark));
    return { isDark: newDark };
  }),
}));

export default useThemeStore;
