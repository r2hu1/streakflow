import { useColorScheme as useDeviceColorScheme } from "react-native";
import { useThemeStore } from "@/store/themeStore";
import colors from "@/constants/colors";

/**
 * Returns the design tokens for the current color scheme.
 *
 * The returned object contains all color tokens for the active palette
 * plus scheme-independent values like `radius`.
 *
 * Respects the user's theme preference (light, dark, or system).
 * Falls back to the light palette when no dark key is defined in
 * constants/colors.ts (the scaffold ships light-only by default).
 */
export function useColors() {
  const { theme } = useThemeStore();
  const deviceScheme = useDeviceColorScheme();

  // Determine the effective scheme based on user preference
  const scheme = theme === "system" ? deviceScheme : theme;

  const palette =
    scheme === "dark" && "dark" in colors ? colors.dark : colors.light;
  return { ...palette, radius: colors.radius };
}
