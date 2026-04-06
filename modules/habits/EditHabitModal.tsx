import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState, useEffect } from "react";
import {
  Modal,
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
import type { Habit } from "@/lib/database";

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

interface EditHabitModalProps {
  visible: boolean;
  habit: Habit | null;
  onSave: (habit: Habit) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onClose: () => void;
}

export function EditHabitModal({
  visible,
  habit,
  onSave,
  onDelete,
  onClose,
}: EditHabitModalProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("activity");
  const [frequency, setFrequency] = useState<"daily" | "weekly">("daily");

  // Update form when habit changes
  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setSelectedIcon(habit.icon);
      setFrequency(habit.frequency);
    }
  }, [habit]);

  const handleSave = async () => {
    if (!habit || !name.trim()) return;

    const updatedHabit: Habit = {
      ...habit,
      name: name.trim(),
      icon: selectedIcon,
      frequency,
    };

    await onSave(updatedHabit);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onClose();
  };

  const handleDelete = async () => {
    if (!habit) return;

    await onDelete(habit.id);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onClose();
  };

  if (!habit) return null;

  const topPad = Platform.OS === "web" ? 67 : insets.top + 20;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            paddingTop: topPad,
          },
        ]}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable onPress={onClose}>
            <Feather name="x" size={24} color={colors.foreground} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            Edit Habit
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
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Name Input */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.foreground }]}>
              Habit Name
            </Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g., Morning Run"
              placeholderTextColor={colors.mutedForeground}
              style={[
                styles.input,
                {
                  backgroundColor: colors.card,
                  color: colors.foreground,
                  borderColor: colors.border,
                  borderRadius: 12,
                },
              ]}
              autoFocus
            />
          </View>

          {/* Icon Selection */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.foreground }]}>
              Icon
            </Text>
            <View style={styles.iconGrid}>
              {ICONS.map((icon) => (
                <Pressable
                  key={icon}
                  onPress={() => setSelectedIcon(icon)}
                  style={[
                    styles.iconOption,
                    {
                      backgroundColor:
                        selectedIcon === icon ? colors.primary + "22" : colors.card,
                      borderColor:
                        selectedIcon === icon ? colors.primary : colors.border,
                      borderRadius: 12,
                    },
                  ]}
                >
                  <Feather
                    name={icon as any}
                    size={20}
                    color={
                      selectedIcon === icon ? colors.primary : colors.mutedForeground
                    }
                  />
                </Pressable>
              ))}
            </View>
          </View>

          {/* Frequency Selection */}
          <View style={styles.section}>
            <Text style={[styles.label, { color: colors.foreground }]}>
              Frequency
            </Text>
            <View style={styles.frequencyRow}>
              {(["daily", "weekly"] as const).map((freq) => (
                <Pressable
                  key={freq}
                  onPress={() => setFrequency(freq)}
                  style={[
                    styles.frequencyOption,
                    {
                      backgroundColor:
                        frequency === freq ? colors.primary + "22" : colors.card,
                      borderColor:
                        frequency === freq ? colors.primary : colors.border,
                      borderRadius: 12,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.frequencyText,
                      {
                        color:
                          frequency === freq ? colors.primary : colors.foreground,
                      },
                    ]}
                  >
                    {freq.charAt(0).toUpperCase() + freq.slice(1)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Delete Button */}
          <View style={styles.section}>
            <Pressable
              onPress={handleDelete}
              style={[
                styles.deleteBtn,
                {
                  backgroundColor: colors.destructive + "11",
                  borderColor: colors.destructive + "33",
                  borderRadius: 12,
                },
              ]}
            >
              <Feather name="trash-2" size={20} color={colors.destructive} />
              <Text style={[styles.deleteText, { color: colors.destructive }]}>
                Delete Habit
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  saveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  saveBtnText: {
    fontSize: 15,
    fontWeight: "600",
  },
  scroll: {
    padding: 20,
    gap: 24,
  },
  section: {
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  iconOption: {
    width: 50,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  frequencyRow: {
    flexDirection: "row",
    gap: 12,
  },
  frequencyOption: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 2,
  },
  frequencyText: {
    fontSize: 15,
    fontWeight: "600",
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 14,
    borderWidth: 1,
  },
  deleteText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
