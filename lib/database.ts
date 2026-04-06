import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Habit {
  id: string;
  name: string;
  icon: string;
  frequency: "daily" | "weekly";
  reminderTime?: string;
  createdAt: string;
  color?: string;
}

export interface Completion {
  id: string;
  habitId: string;
  date: string;
  completedAt: string;
}

const HABITS_KEY = "streakflow_habits";
const COMPLETIONS_KEY = "streakflow_completions";
const FIRST_LAUNCH_KEY = "streakflow_first_launch";
const USER_NAME_KEY = "streakflow_user_name";
const ONBOARDING_COMPLETE_KEY = "streakflow_onboarding_complete";
const TRIAL_START_KEY = "streakflow_trial_start";

export function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export function getTodayDate(): string {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

export function getDateString(date: Date): string {
  return date.toISOString().split("T")[0];
}

export async function getFirstLaunchDate(): Promise<string | null> {
  return AsyncStorage.getItem(FIRST_LAUNCH_KEY);
}

export async function setFirstLaunchDate(): Promise<void> {
  const existing = await AsyncStorage.getItem(FIRST_LAUNCH_KEY);
  if (!existing) {
    await AsyncStorage.setItem(FIRST_LAUNCH_KEY, new Date().toISOString());
  }
}

export async function getHabits(): Promise<Habit[]> {
  const raw = await AsyncStorage.getItem(HABITS_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as Habit[];
}

export async function saveHabit(habit: Habit): Promise<void> {
  const habits = await getHabits();
  const existing = habits.findIndex((h) => h.id === habit.id);
  if (existing >= 0) {
    habits[existing] = habit;
  } else {
    habits.push(habit);
  }
  await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits));
}

export async function deleteHabit(id: string): Promise<void> {
  const habits = await getHabits();
  const updated = habits.filter((h) => h.id !== id);
  await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(updated));
  const completions = await getCompletions();
  const updatedCompletions = completions.filter((c) => c.habitId !== id);
  await AsyncStorage.setItem(
    COMPLETIONS_KEY,
    JSON.stringify(updatedCompletions),
  );
}

export async function getCompletions(): Promise<Completion[]> {
  const raw = await AsyncStorage.getItem(COMPLETIONS_KEY);
  if (!raw) return [];
  return JSON.parse(raw) as Completion[];
}

export async function toggleCompletion(
  habitId: string,
  date: string,
  habits?: Habit[],
): Promise<boolean> {
  const completions = await getCompletions();

  // If habits are provided, check frequency constraints for weekly habits
  if (habits) {
    const habit = habits.find((h) => h.id === habitId);
    if (habit && habit.frequency === "weekly") {
      // Check if already completed in the same week
      const inputDate = new Date(date);
      const existingCompletionsThisWeek = completions.filter((c) => {
        if (c.habitId !== habitId) return false;

        const completionDate = new Date(c.date);

        // Get the start of the week (Monday) for both dates
        const getWeekStart = (d: Date) => {
          const day = d.getDay();
          const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
          return new Date(d.getFullYear(), d.getMonth(), diff);
        };

        const inputWeekStart = getWeekStart(inputDate);
        const completionWeekStart = getWeekStart(completionDate);

        return (
          inputWeekStart.getTime() === completionWeekStart.getTime() &&
          c.date !== date // Allow toggling the same date
        );
      });

      // If already completed this week (on a different date), don't allow
      if (existingCompletionsThisWeek.length > 0) {
        return false;
      }
    }
  }

  const existingIndex = completions.findIndex(
    (c) => c.habitId === habitId && c.date === date,
  );

  if (existingIndex >= 0) {
    completions.splice(existingIndex, 1);
    await AsyncStorage.setItem(COMPLETIONS_KEY, JSON.stringify(completions));
    return false;
  } else {
    const newCompletion: Completion = {
      id: generateId(),
      habitId,
      date,
      completedAt: new Date().toISOString(),
    };
    completions.push(newCompletion);
    await AsyncStorage.setItem(COMPLETIONS_KEY, JSON.stringify(completions));
    return true;
  }
}

export function isCompleted(
  completions: Completion[],
  habitId: string,
  date: string,
): boolean {
  return completions.some((c) => c.habitId === habitId && c.date === date);
}

export function calculateStreak(
  completions: Completion[],
  habitId: string,
): number {
  const today = getTodayDate();
  const habitCompletions = completions
    .filter((c) => c.habitId === habitId)
    .map((c) => c.date)
    .sort()
    .reverse();

  if (habitCompletions.length === 0) return 0;

  let streak = 0;
  let checkDate = new Date();

  if (!habitCompletions.includes(today)) {
    checkDate.setDate(checkDate.getDate() - 1);
  }

  for (let i = 0; i < 365; i++) {
    const dateStr = getDateString(checkDate);
    if (habitCompletions.includes(dateStr)) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

export function calculateLongestStreak(
  completions: Completion[],
  habitId: string,
): number {
  const habitCompletions = completions
    .filter((c) => c.habitId === habitId)
    .map((c) => c.date)
    .sort();

  if (habitCompletions.length === 0) return 0;

  let longest = 1;
  let current = 1;

  for (let i = 1; i < habitCompletions.length; i++) {
    const prev = new Date(habitCompletions[i - 1]);
    const curr = new Date(habitCompletions[i]);
    const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);

    if (diff === 1) {
      current++;
      longest = Math.max(longest, current);
    } else {
      current = 1;
    }
  }

  return longest;
}

export function getCompletionRate(
  completions: Completion[],
  habitId: string,
  days: number = 30,
): number {
  const today = new Date();
  let completed = 0;

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = getDateString(date);
    if (completions.some((c) => c.habitId === habitId && c.date === dateStr)) {
      completed++;
    }
  }

  return Math.round((completed / days) * 100);
}

export function getHeatmapData(
  completions: Completion[],
  habitId: string,
  weeks: number = 26,
): { date: string; count: number }[] {
  const result: { date: string; count: number }[] = [];
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - weeks * 7);

  for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
    const dateStr = getDateString(d);
    const count = completions.filter(
      (c) => c.habitId === habitId && c.date === dateStr,
    ).length;
    result.push({ date: dateStr, count });
  }

  return result;
}

export function getAllHabitsHeatmapData(
  completions: Completion[],
  weeks: number = 26,
): { date: string; count: number }[] {
  const result: { date: string; count: number }[] = [];
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - weeks * 7);

  for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
    const dateStr = getDateString(d);
    const count = completions.filter((c) => c.date === dateStr).length;
    result.push({ date: dateStr, count });
  }

  return result;
}
