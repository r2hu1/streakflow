import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { generateId, getTodayDate, type Habit } from "@/lib/database";
import { useHabits } from "@/store/habitsStore";
import { useSubscription } from "@/lib/revenuecat";
import { ProBanner } from "@/components/ProBanner";

const ICONS = [
  "activity",
  "book",
  "coffee",
  "droplet",
  "feather",
  "heart",
  "moon",
  "music",
  "sun",
  "zap",
  "briefcase",
  "camera",
  "check-circle",
  "clock",
  "compass",
  "cpu",
  "database",
  "edit",
  "eye",
  "flag",
  "globe",
  "headphones",
  "home",
  "layers",
  "leaf",
  "map",
  "mic",
  "monitor",
  "phone",
  "pie-chart",
  "radio",
  "scissors",
  "shield",
  "shopping-bag",
  "smile",
  "star",
  "target",
  "thermometer",
  "trending-up",
  "users",
];

const FREE_HABIT_LIMIT = 3;

export default function AddHabitScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { habits, addHabit } = useHabits();
  const { isSubscribed } = useSubscription();

  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("activity");
  const [frequency, setFrequency] = useState<"daily" | "weekly">("daily");
  const [showPro, setShowPro] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;

    if (!isSubscribed && habits.length >= FREE_HABIT_LIMIT) {
      setShowPro(true);
      return;
    }

    const habit: Habit = {
      id: generateId(),
      name: name.trim(),
      icon: selectedIcon,
      frequency,
      createdAt: getTodayDate(),
    };

    await addHabit(habit);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View
          style={[
            styles.header,
            { paddingTop: topPad + 16, borderBottomColor: colors.border },
          ]}
        >
          <Pressable onPress={() => router.back()}>
            <Feather name="x" size={24} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            New Habit
          </Text>
          <Pressable
            onPress={handleSave}
            disabled={!name.trim()}
            style={[
              styles.saveBtn,
              {
                backgroundColor: name.trim() ? colors.primary : colors.border,
                borderRadius: 12,
              },
            ]}
          >
            <Text
              style={[
                styles.saveBtnText,
                {
                  color: name.trim()
                    ? colors.primaryForeground
                    : colors.mutedForeground,
                },
              ]}
            >
              Save
            </Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingBottom: bottomPad + 40 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>
              Habit Name
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Morning run, Read 10 pages..."
              placeholderTextColor={colors.mutedForeground}
              style={[
                styles.input,
                {
                  backgroundColor: colors.card,
                  color: colors.foreground,
                  borderColor: colors.border,
                  borderRadius: 14,
                },
              ]}
              maxLength={50}
              returnKeyType="done"
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>
              Frequency
            </Text>
            <View
              style={[
                styles.toggle,
                {
                  backgroundColor: colors.card,
                  borderRadius: 14,
                  borderColor: colors.border,
                  borderWidth: 1,
                },
              ]}
            >
              {(["daily", "weekly"] as const).map((f) => (
                <Pressable
                  key={f}
                  onPress={() => setFrequency(f)}
                  style={[
                    styles.toggleOption,
                    {
                      backgroundColor:
                        frequency === f ? colors.primary : "transparent",
                      borderRadius: 11,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      {
                        color:
                          frequency === f
                            ? colors.primaryForeground
                            : colors.mutedForeground,
                      },
                    ]}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.mutedForeground }]}>
              Icon
            </Text>
            <View
              style={[
                styles.iconGrid,
                {
                  backgroundColor: colors.card,
                  borderRadius: 16,
                  borderColor: colors.border,
                  borderWidth: 1,
                  justifyContent: "center",
                },
              ]}
            >
              {ICONS.map((icon) => (
                <Pressable
                  key={icon}
                  onPress={() => setSelectedIcon(icon)}
                  style={[
                    styles.iconBtn,
                    {
                      backgroundColor:
                        selectedIcon === icon
                          ? colors.primary + "22"
                          : "transparent",
                      borderRadius: 10,
                      borderWidth: selectedIcon === icon ? 1.5 : 0,
                      borderColor: colors.primary,
                    },
                  ]}
                >
                  <Feather
                    name={icon as any}
                    size={20}
                    color={
                      selectedIcon === icon
                        ? colors.primary
                        : colors.mutedForeground
                    }
                  />
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>

      <ProBanner
        visible={showPro}
        onClose={() => setShowPro(false)}
        mode="upgrade"
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 17, fontWeight: "600" },
  saveBtn: { paddingHorizontal: 18, paddingVertical: 8 },
  saveBtnText: { fontSize: 15, fontWeight: "600" },
  scroll: { padding: 20, gap: 24 },
  formGroup: { gap: 10 },
  label: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  input: {
    height: 52,
    paddingHorizontal: 16,
    fontSize: 16,
    borderWidth: 1,
  },
  toggle: {
    flexDirection: "row",
    padding: 4,
    gap: 4,
  },
  toggleOption: { flex: 1, paddingVertical: 10, alignItems: "center" },
  toggleText: { fontSize: 15, fontWeight: "600" },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 12,
    gap: 8,
  },
  iconBtn: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
});
