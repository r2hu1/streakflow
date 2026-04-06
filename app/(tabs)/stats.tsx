import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Heatmap } from "@/modules/habits";
import { useColors } from "@/hooks/useColors";
import {
  calculateLongestStreak,
  calculateStreak,
  getAllHabitsHeatmapData,
  getCompletionRate,
  getHeatmapData,
  getTodayDate,
  isCompleted,
} from "@/lib/database";
import { useHabits } from "@/store/habitsStore";

function StatCard({
  label,
  value,
  icon,
  colors,
}: {
  label: string;
  value: string | number;
  icon: string;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <View
      style={[
        statCardStyles.card,
        {
          backgroundColor: colors.card,
          borderRadius: 16,
          borderColor: colors.border,
          borderWidth: 1,
        },
      ]}
    >
      <Feather name={icon as any} size={20} color={colors.primary} />
      <Text style={[statCardStyles.value, { color: colors.foreground }]}>
        {value}
      </Text>
      <Text style={[statCardStyles.label, { color: colors.mutedForeground }]}>
        {label}
      </Text>
    </View>
  );
}

const statCardStyles = StyleSheet.create({
  card: { flex: 1, padding: 16, gap: 8, alignItems: "center" },
  value: { fontSize: 28, fontWeight: "700" },
  label: { fontSize: 12, textAlign: "center" },
});

function WeeklyBar({
  completions,
  habitId,
  colors,
}: {
  completions: any[];
  habitId: string;
  colors: ReturnType<typeof useColors>;
}) {
  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const today = new Date();
  const weekData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split("T")[0];
    return {
      label: days[d.getDay() === 0 ? 6 : d.getDay() - 1],
      done: isCompleted(completions, habitId, dateStr),
    };
  });

  return (
    <View style={barStyles.container}>
      {weekData.map((day, i) => (
        <View key={i} style={barStyles.dayCol}>
          <View
            style={[
              barStyles.dot,
              {
                backgroundColor: day.done ? colors.primary : colors.border,
                borderRadius: 6,
              },
            ]}
          />
          <Text style={[barStyles.label, { color: colors.mutedForeground }]}>
            {day.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const barStyles = StyleSheet.create({
  container: { flexDirection: "row", gap: 4, justifyContent: "center" },
  dayCol: { alignItems: "center", gap: 4 },
  dot: { width: 28, height: 28 },
  label: { fontSize: 10 },
});

export default function StatsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { habits, completions } = useHabits();
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null);

  const selectedHabit =
    habits.find((h) => h.id === selectedHabitId) ?? habits[0];

  const overallStats = useMemo(() => {
    const today = getTodayDate();
    const completedToday = habits.filter((h) =>
      isCompleted(completions, h.id, today),
    ).length;
    const longestStreakAll = habits.reduce(
      (max, h) => Math.max(max, calculateLongestStreak(completions, h.id)),
      0,
    );
    const currentStreakAll = habits.reduce(
      (max, h) => Math.max(max, calculateStreak(completions, h.id)),
      0,
    );
    return { completedToday, longestStreakAll, currentStreakAll };
  }, [habits, completions]);

  const habitStats = useMemo(() => {
    if (!selectedHabit) return null;
    return {
      streak: calculateStreak(completions, selectedHabit.id),
      longest: calculateLongestStreak(completions, selectedHabit.id),
      rate: getCompletionRate(completions, selectedHabit.id, 30),
      heatmap: getHeatmapData(completions, selectedHabit.id, 26),
    };
  }, [selectedHabit, completions]);

  const allHeatmap = useMemo(
    () => getAllHabitsHeatmapData(completions, 26),
    [completions],
  );

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
        <Text style={[styles.title, { color: colors.foreground }]}>Stats</Text>

        <View style={styles.statsRow}>
          <StatCard
            label="Today"
            value={`${overallStats.completedToday}/${habits.length}`}
            icon="check-circle"
            colors={colors}
          />
          <StatCard
            label="Best Streak"
            value={`${overallStats.longestStreakAll}d`}
            icon="award"
            colors={colors}
          />
          <StatCard
            label="Streak"
            value={`${overallStats.currentStreakAll}d`}
            icon="zap"
            colors={colors}
          />
        </View>

        <View
          style={[
            styles.card,
            { backgroundColor: colors.card, borderRadius: 20 },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            All Habits Activity
          </Text>
          <Heatmap data={allHeatmap} autoScrollToLatest />
        </View>

        {habits.length > 0 && (
          <View
            style={[
              styles.card,
              { backgroundColor: colors.card, borderRadius: 20 },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Per Habit
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.selector}
            >
              {habits.map((h) => (
                <Pressable
                  key={h.id}
                  onPress={() => setSelectedHabitId(h.id)}
                  style={[
                    styles.habitChip,
                    {
                      backgroundColor:
                        (selectedHabit?.id ?? habits[0]?.id) === h.id
                          ? colors.primary
                          : colors.secondary,
                      borderRadius: 20,
                    },
                  ]}
                >
                  <Feather
                    name={h.icon as any}
                    size={14}
                    color={
                      (selectedHabit?.id ?? habits[0]?.id) === h.id
                        ? colors.primaryForeground
                        : colors.mutedForeground
                    }
                  />
                  <Text
                    style={[
                      styles.habitChipText,
                      {
                        color:
                          (selectedHabit?.id ?? habits[0]?.id) === h.id
                            ? colors.primaryForeground
                            : colors.mutedForeground,
                      },
                    ]}
                  >
                    {h.name}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>

            {habitStats && (
              <>
                <View style={styles.habitStatsRow}>
                  <View style={styles.habitStat}>
                    <Text
                      style={[styles.habitStatValue, { color: colors.primary }]}
                    >
                      {habitStats.streak}
                    </Text>
                    <Text
                      style={[
                        styles.habitStatLabel,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      Current
                    </Text>
                  </View>
                  <View style={styles.habitStat}>
                    <Text
                      style={[styles.habitStatValue, { color: colors.primary }]}
                    >
                      {habitStats.longest}
                    </Text>
                    <Text
                      style={[
                        styles.habitStatLabel,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      Best
                    </Text>
                  </View>
                  <View style={styles.habitStat}>
                    <Text
                      style={[styles.habitStatValue, { color: colors.primary }]}
                    >
                      {habitStats.rate}%
                    </Text>
                    <Text
                      style={[
                        styles.habitStatLabel,
                        { color: colors.mutedForeground },
                      ]}
                    >
                      30-day rate
                    </Text>
                  </View>
                </View>

                <Text
                  style={[styles.weekLabel, { color: colors.mutedForeground }]}
                >
                  Last 7 days
                </Text>
                <WeeklyBar
                  completions={completions}
                  habitId={selectedHabit!.id}
                  colors={colors}
                />

                <Text
                  style={[styles.weekLabel, { color: colors.mutedForeground }]}
                >
                  Last 6 months
                </Text>
                <Heatmap
                  autoScrollToLatest
                  data={habitStats.heatmap}
                  maxCount={1}
                />
              </>
            )}
          </View>
        )}

        {habits.length === 0 && (
          <View style={styles.emptyState}>
            <Feather name="bar-chart-2" size={48} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              No data yet
            </Text>
            <Text
              style={[styles.emptySubtitle, { color: colors.mutedForeground }]}
            >
              Add habits and start tracking to see your stats
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, gap: 20 },
  title: { fontSize: 32, fontWeight: "700" },
  statsRow: { flexDirection: "row", gap: 12 },
  card: { padding: 20, gap: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "700" },
  selector: { flexDirection: "row" },
  habitChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
  },
  habitChipText: { fontSize: 13, fontWeight: "500" },
  habitStatsRow: { flexDirection: "row" },
  habitStat: { flex: 1, alignItems: "center", gap: 4 },
  habitStatValue: { fontSize: 28, fontWeight: "700" },
  habitStatLabel: { fontSize: 12 },
  weekLabel: { fontSize: 13, fontWeight: "500" },
  emptyState: { alignItems: "center", paddingVertical: 60, gap: 12 },
  emptyTitle: { fontSize: 20, fontWeight: "600" },
  emptySubtitle: { fontSize: 15, textAlign: "center" },
});
