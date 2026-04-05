import { Feather } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { HabitCard } from "@/components/HabitCard";
import { useColors } from "@/hooks/useColors";
import { getTodayDate, isCompleted } from "@/lib/database";
import { useHabits } from "@/store/habitsStore";

const MOTIVATIONAL_MESSAGES = [
  "You're on fire! Keep the streak alive.",
  "Consistency is the key to greatness.",
  "Small steps every day build big results.",
  "You've got this! One habit at a time.",
  "Progress, not perfection.",
  "The best time to start is now.",
  "Champions are made in the daily grind.",
];

function getMotivationalMessage(
  completedCount: number,
  totalCount: number,
): string {
  if (totalCount === 0) return "Add your first habit to get started!";
  if (completedCount === totalCount)
    return "Amazing! You've completed all habits today!";
  if (completedCount === 0) return MOTIVATIONAL_MESSAGES[new Date().getDay()];
  const ratio = completedCount / totalCount;
  if (ratio >= 0.5) return "More than halfway there — finish strong!";
  return MOTIVATIONAL_MESSAGES[completedCount % MOTIVATIONAL_MESSAGES.length];
}

export default function TodayScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { habits, completions, toggleHabitCompletion, getStreakForHabit } =
    useHabits();

  const today = getTodayDate();
  const todayDayOfWeek = new Date().getDay(); // 0 = Sunday, 1-6 = Monday-Saturday

  // Filter habits that should be shown today:
  // - All daily habits
  // - Weekly habits where the user selects which day
  const todayHabits = habits.filter((h) => {
    if (h.frequency === "daily") return true;
    // For weekly habits, show them every day (user can complete on any day)
    if (h.frequency === "weekly") return true;
    return false;
  });

  const completedCount = useMemo(
    () =>
      todayHabits.filter((h) => isCompleted(completions, h.id, today)).length,
    [todayHabits, completions, today],
  );

  const message = getMotivationalMessage(completedCount, todayHabits.length);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPad + 24, paddingBottom: bottomPad + 80 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Today
          </Text>
          <Text style={[styles.date, { color: colors.mutedForeground }]}>
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </Text>
        </View>

        <View
          style={[
            styles.progressCard,
            { backgroundColor: colors.card, borderRadius: 20 },
          ]}
        >
          <View style={styles.progressHeader}>
            <Text
              style={[styles.progressLabel, { color: colors.mutedForeground }]}
            >
              Progress
            </Text>
            <Text style={[styles.progressCount, { color: colors.primary }]}>
              {completedCount}/{todayHabits.length}
            </Text>
          </View>
          <View
            style={[styles.progressBar, { backgroundColor: colors.border }]}
          >
            <View
              style={[
                styles.progressFill,
                {
                  backgroundColor: colors.primary,
                  width:
                    todayHabits.length > 0
                      ? `${(completedCount / todayHabits.length) * 100}%`
                      : "0%",
                },
              ]}
            />
          </View>
          <Text
            style={[styles.motivationalText, { color: colors.mutedForeground }]}
          >
            {message}
          </Text>
        </View>

        {todayHabits.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="check-circle" size={48} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              No habits yet
            </Text>
            <Text
              style={[styles.emptySubtitle, { color: colors.mutedForeground }]}
            >
              Go to Home to add your first habit
            </Text>
          </View>
        ) : (
          <View style={styles.habitList}>
            {todayHabits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                completed={isCompleted(completions, habit.id, today)}
                streak={getStreakForHabit(habit.id)}
                onToggle={() => toggleHabitCompletion(habit.id, today)}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, gap: 20 },
  header: { gap: 4 },
  title: { fontSize: 32, fontWeight: "700" },
  date: { fontSize: 15 },
  progressCard: { padding: 20, gap: 12 },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressLabel: { fontSize: 14, fontWeight: "500" },
  progressCount: { fontSize: 16, fontWeight: "700" },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  motivationalText: { fontSize: 14, lineHeight: 20 },
  habitList: { gap: 12 },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: { fontSize: 20, fontWeight: "600" },
  emptySubtitle: { fontSize: 15, textAlign: "center" },
});
