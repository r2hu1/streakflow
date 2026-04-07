import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Heatmap, HabitCard, EditHabitModal } from "@/modules/habits";
import { useColors } from "@/hooks/useColors";
import {
  getAllHabitsHeatmapData,
  getTodayDate,
  isCompleted,
  type Habit,
} from "@/lib/database";
import { useHabits } from "@/store/habitsStore";
import { useUser } from "@/store/userStore";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    habits,
    completions,
    toggleHabitCompletion,
    updateHabit,
    removeHabit,
    getTotalStreak,
    getStreakForHabit,
  } = useHabits();
  const { userName } = useUser();
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const today = getTodayDate();
  const totalStreak = getTotalStreak();
  const heatmapData = useMemo(
    () => getAllHabitsHeatmapData(completions, 26),
    [completions],
  );
  const completedToday = habits.filter((h) =>
    isCompleted(completions, h.id, today),
  ).length;

  const handleAddHabit = () => {
    router.push("/add-habit");
  };

  const handleEditHabit = (habit: Habit) => {
    setEditingHabit(habit);
    setShowEditModal(true);
  };

  const handleSaveHabit = async (updatedHabit: Habit) => {
    await updateHabit(updatedHabit);
    setShowEditModal(false);
    setEditingHabit(null);
  };

  const handleDeleteHabit = async (id: string) => {
    await removeHabit(id);
    setShowEditModal(false);
    setEditingHabit(null);
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: topPad + 24, paddingBottom: bottomPad + 80 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.topRow}>
            <View>
              <Text
                style={[styles.greeting, { color: colors.mutedForeground }]}
              >
                {getGreeting()}
              </Text>
              <Text style={[styles.title, { color: colors.foreground }]}>
                {userName ? userName : "StreakFlow"}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.streakCard,
              {
                backgroundColor: colors.primary,
                borderRadius: 24,
              },
            ]}
          >
            <View style={styles.streakContent}>
              <View>
                <Text
                  style={[
                    styles.streakNumber,
                    { color: colors.primaryForeground },
                  ]}
                >
                  {totalStreak}
                </Text>
                <Text
                  style={[
                    styles.streakLabel,
                    { color: colors.primaryForeground + "CC" },
                  ]}
                >
                  day streak
                </Text>
              </View>
              <View style={styles.streakRight}>
                <View style={styles.streakStat}>
                  <Text
                    style={[
                      styles.streakStatNum,
                      { color: colors.primaryForeground },
                    ]}
                  >
                    {completedToday}
                  </Text>
                  <Text
                    style={[
                      styles.streakStatLabel,
                      { color: colors.primaryForeground + "99" },
                    ]}
                  >
                    done
                  </Text>
                </View>
                <View style={styles.streakStat}>
                  <Text
                    style={[
                      styles.streakStatNum,
                      { color: colors.primaryForeground },
                    ]}
                  >
                    {habits.length}
                  </Text>
                  <Text
                    style={[
                      styles.streakStatLabel,
                      { color: colors.primaryForeground + "99" },
                    ]}
                  >
                    habits
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <View
            style={[
              styles.heatmapCard,
              { backgroundColor: colors.card, borderRadius: 20 },
            ]}
          >
            <View style={styles.heatmapHeader}>
              <Text style={[styles.heatmapTitle, { color: colors.foreground }]}>
                Activity
              </Text>
              <Text
                style={[styles.heatmapSub, { color: colors.mutedForeground }]}
              >
                Last 26 weeks
              </Text>
            </View>
            <Heatmap data={heatmapData} autoScrollToLatest />
          </View>

          <View style={styles.habitsSection}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                Today's Habits
              </Text>
              <Pressable
                onPress={handleAddHabit}
                style={[
                  styles.addBtn,
                  { backgroundColor: colors.primary, borderRadius: 20 },
                ]}
              >
                <Feather
                  name="plus"
                  size={16}
                  color={colors.primaryForeground}
                />
                <Text
                  style={[
                    styles.addBtnText,
                    { color: colors.primaryForeground },
                  ]}
                >
                  Add
                </Text>
              </Pressable>
            </View>

            {habits.length === 0 ? (
              <Pressable
                onPress={handleAddHabit}
                style={[
                  styles.emptyCard,
                  {
                    backgroundColor: colors.card,
                    borderRadius: 20,
                    borderColor: colors.border,
                    borderWidth: 1,
                  },
                ]}
              >
                <View
                  style={[
                    styles.emptyIcon,
                    {
                      backgroundColor: colors.primary + "22",
                      borderRadius: 20,
                    },
                  ]}
                >
                  <Feather name="plus" size={28} color={colors.primary} />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                  Add your first habit
                </Text>
                <Text
                  style={[
                    styles.emptySubtitle,
                    { color: colors.mutedForeground },
                  ]}
                >
                  Track daily or weekly habits and build your streaks
                </Text>
              </Pressable>
            ) : (
              <View style={styles.habitList}>
                {habits.map((habit) => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    completed={isCompleted(completions, habit.id, today)}
                    streak={getStreakForHabit(habit.id)}
                    onToggle={() => toggleHabitCompletion(habit.id, today)}
                    onLongPress={() => handleEditHabit(habit)}
                  />
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>

      <EditHabitModal
        visible={showEditModal}
        habit={editingHabit}
        onSave={handleSaveHabit}
        onDelete={handleDeleteHabit}
        onClose={() => {
          setShowEditModal(false);
          setEditingHabit(null);
        }}
      />
    </>
  );
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, gap: 20 },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  greeting: { fontSize: 14, fontWeight: "400" },
  title: { fontSize: 28, fontWeight: "700" },
  streakCard: { padding: 24 },
  streakContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  streakNumber: { fontSize: 64, fontWeight: "800", lineHeight: 68 },
  streakLabel: { fontSize: 16, fontWeight: "500" },
  streakRight: { flexDirection: "row", gap: 28 },
  streakStat: { alignItems: "center", gap: 2 },
  streakStatNum: { fontSize: 28, fontWeight: "700" },
  streakStatLabel: { fontSize: 12 },
  heatmapCard: { padding: 20, gap: 16 },
  heatmapHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heatmapTitle: { fontSize: 16, fontWeight: "600" },
  heatmapSub: { fontSize: 12 },
  habitsSection: { gap: 14 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: { fontSize: 20, fontWeight: "700" },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  addBtnText: { fontSize: 14, fontWeight: "600" },
  emptyCard: {
    padding: 32,
    alignItems: "center",
    gap: 14,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: { fontSize: 18, fontWeight: "600", textAlign: "center" },
  emptySubtitle: { fontSize: 14, textAlign: "center", lineHeight: 20 },
  habitList: { gap: 12 },
});
