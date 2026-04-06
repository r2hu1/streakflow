import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import type { Habit } from "@/lib/database";
import { HabitCheckButton } from "./HabitCheckButton";

interface HabitCardProps {
  habit: Habit;
  completed: boolean;
  streak: number;
  onToggle: () => void;
  onLongPress?: () => void;
}

export function HabitCard({
  habit,
  completed,
  streak,
  onToggle,
  onLongPress,
}: HabitCardProps) {
  const colors = useColors();

  return (
    <Pressable
      onPress={onLongPress}
      onLongPress={onLongPress}
      delayLongPress={500}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderRadius: 16,
          borderColor: completed ? colors.primary + "33" : colors.border,
          borderWidth: 1,
          opacity: pressed && onLongPress ? 0.7 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: colors.primary + "22", borderRadius: 12 },
        ]}
      >
        <Feather name={habit.icon as any} size={20} color={colors.primary} />
      </View>

      <View style={styles.content}>
        <Text
          style={[styles.name, { color: colors.foreground }]}
          numberOfLines={1}
        >
          {habit.name}
        </Text>
        {streak > 0 && (
          <View style={styles.streakRow}>
            <Feather name="zap" size={12} color={colors.primary} />
            <Text style={[styles.streakText, { color: colors.primary }]}>
              {streak} day streak
            </Text>
          </View>
        )}
      </View>

      <HabitCheckButton completed={completed} onPress={onToggle} size={44} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 14,
  },
  iconContainer: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
  },
  streakRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  streakText: {
    fontSize: 12,
    fontWeight: "500",
  },
});
