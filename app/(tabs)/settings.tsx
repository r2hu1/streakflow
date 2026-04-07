import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect } from "react";
import {
  Alert,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useHabits } from "@/store/habitsStore";
import { useThemeStore } from "@/store/themeStore";
import { useUser } from "@/store/userStore";

function SettingsRow({
  icon,
  label,
  value,
  onPress,
  rightElement,
  colors,
}: {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { opacity: pressed && onPress ? 0.7 : 1 },
      ]}
    >
      <View
        style={[
          styles.rowIcon,
          { backgroundColor: colors.primary + "22", borderRadius: 10 },
        ]}
      >
        <Feather name={icon as any} size={18} color={colors.primary} />
      </View>
      <Text style={[styles.rowLabel, { color: colors.foreground }]}>
        {label}
      </Text>
      <View style={styles.rowRight}>
        {value && (
          <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>
            {value}
          </Text>
        )}
        {rightElement}
        {onPress && !rightElement && (
          <Feather
            name="chevron-right"
            size={16}
            color={colors.mutedForeground}
          />
        )}
      </View>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const deviceColorScheme = useColorScheme();
  const { theme, setTheme, loadTheme } = useThemeStore();
  const { habits } = useHabits();
  const { userName } = useUser();
  const router = useRouter();

  useEffect(() => {
    loadTheme();
  }, []);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const themeLabel =
    theme === "system" ? "System" : theme === "dark" ? "Dark" : "Light";

  const handleResetOnboarding = () => {
    Alert.alert(
      "Reset Onboarding",
      "This will restart the onboarding flow. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("streakflow_onboarding_complete");
              await AsyncStorage.removeItem("streakflow_user_name");
              router.replace("/onboarding");
            } catch (error) {
              console.error("Reset error:", error);
              Alert.alert("Error", "Failed to reset onboarding");
            }
          },
        },
      ],
    );
  };

  const handleExportData = async () => {
    try {
      const exportData = {
        user: {
          name: userName,
          exportedAt: new Date().toISOString(),
        },
        habits: habits.map((habit) => ({
          id: habit.id,
          name: habit.name,
          color: habit.color,
          icon: habit.icon,
          createdAt: habit.createdAt,
          frequency: habit.frequency,
        })),
        summary: {
          totalHabits: habits.length,
        },
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const filename = `streakflow_export_${new Date().toISOString().split("T")[0]}.json`;

      if (Platform.OS === "web") {
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } else {
        try {
          await Share.share({
            message: jsonString,
            title: "Export StreakFlow Data",
          });
        } catch (error) {
          await Clipboard.setStringAsync(jsonString);
          Alert.alert("Success", "Data copied to clipboard");
        }
      }
    } catch (error) {
      console.error("Export error:", error);
      Alert.alert("Error", "Failed to export data. Please try again.");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 24, paddingBottom: bottomPad + 80 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>
          Settings
        </Text>

        <View
          style={[
            styles.section,
            { backgroundColor: colors.card, borderRadius: 16 },
          ]}
        >
          <Text
            style={[styles.sectionHeader, { color: colors.mutedForeground }]}
          >
            Appearance
          </Text>
          <Pressable
            onPress={() => {
              const nextTheme =
                theme === "light"
                  ? "dark"
                  : theme === "dark"
                    ? "system"
                    : "light";
              setTheme(nextTheme);
            }}
            style={({ pressed }) => [
              styles.row,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <View
              style={[
                styles.rowIcon,
                { backgroundColor: colors.primary + "22", borderRadius: 10 },
              ]}
            >
              <Feather name="moon" size={18} color={colors.primary} />
            </View>
            <Text style={[styles.rowLabel, { color: colors.foreground }]}>
              Theme
            </Text>
            <View style={styles.rowRight}>
              <Text
                style={[styles.rowValue, { color: colors.mutedForeground }]}
              >
                {themeLabel}
              </Text>
              <Feather
                name="chevron-right"
                size={16}
                color={colors.mutedForeground}
              />
            </View>
          </Pressable>
        </View>

        <View
          style={[
            styles.section,
            { backgroundColor: colors.card, borderRadius: 16 },
          ]}
        >
          <Text
            style={[styles.sectionHeader, { color: colors.mutedForeground }]}
          >
            Data & Privacy
          </Text>
          <Pressable
            onPress={handleExportData}
            style={({ pressed }) => [
              styles.row,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <View
              style={[
                styles.rowIcon,
                { backgroundColor: colors.primary + "22", borderRadius: 10 },
              ]}
            >
              <Feather name="download" size={18} color={colors.primary} />
            </View>
            <Text style={[styles.rowLabel, { color: colors.foreground }]}>
              Export Data
            </Text>
            <View style={styles.rowRight}>
              <Feather
                name="chevron-right"
                size={16}
                color={colors.mutedForeground}
              />
            </View>
          </Pressable>
        </View>

        <View
          style={[
            styles.section,
            { backgroundColor: colors.card, borderRadius: 16 },
          ]}
        >
          <Text
            style={[styles.sectionHeader, { color: colors.mutedForeground }]}
          >
            About
          </Text>
          <SettingsRow
            icon="info"
            label="Version"
            value="1.0.0"
            colors={colors}
          />
          <SettingsRow
            icon="zap"
            label="StreakFlow"
            value="Made with focus"
            colors={colors}
          />
          <Pressable
            onPress={handleResetOnboarding}
            style={({ pressed }) => [
              styles.row,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <View
              style={[
                styles.rowIcon,
                {
                  backgroundColor: colors.destructive + "22",
                  borderRadius: 10,
                },
              ]}
            >
              <Feather
                name="refresh-ccw"
                size={18}
                color={colors.destructive}
              />
            </View>
            <Text style={[styles.rowLabel, { color: colors.destructive }]}>
              Reset Onboarding
            </Text>
            <View style={styles.rowRight}>
              <Feather
                name="chevron-right"
                size={16}
                color={colors.mutedForeground}
              />
            </View>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, gap: 20 },
  title: { fontSize: 32, fontWeight: "700" },
  section: { overflow: "hidden" },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  rowIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: { flex: 1, fontSize: 15 },
  rowRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  rowValue: { fontSize: 14 },
});
