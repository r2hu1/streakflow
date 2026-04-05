import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";

type Theme = "light" | "dark" | "system";

interface ThemeStore {
  theme: Theme;
  setTheme: (theme: Theme) => Promise<void>;
  loadTheme: () => Promise<void>;
}

const THEME_STORAGE_KEY = "@streakflow_theme";

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: "system",
  setTheme: async (theme) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
      set({ theme });
    } catch (error) {
      console.error("Failed to save theme:", error);
    }
  },
  loadTheme: async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === "light" || savedTheme === "dark" || savedTheme === "system") {
        set({ theme: savedTheme });
      }
    } catch (error) {
      console.error("Failed to load theme:", error);
    }
  },
}));
