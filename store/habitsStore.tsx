import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  type Completion,
  type Habit,
  calculateStreak,
  deleteHabit,
  getCompletions,
  getHabits,
  saveHabit,
  setFirstLaunchDate,
  toggleCompletion,
} from "@/lib/database";

interface HabitsContextValue {
  habits: Habit[];
  completions: Completion[];
  isLoading: boolean;
  addHabit: (habit: Habit) => Promise<void>;
  updateHabit: (habit: Habit) => Promise<void>;
  removeHabit: (id: string) => Promise<void>;
  toggleHabitCompletion: (habitId: string, date: string) => Promise<boolean>;
  getStreakForHabit: (habitId: string) => number;
  getTotalStreak: () => number;
  refresh: () => Promise<void>;
}

const HabitsContext = createContext<HabitsContextValue | null>(null);

export function HabitsProvider({ children }: { children: React.ReactNode }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [h, c] = await Promise.all([getHabits(), getCompletions()]);
    setHabits(h);
    setCompletions(c);
  }, []);

  useEffect(() => {
    const init = async () => {
      await setFirstLaunchDate();
      await refresh();
      setIsLoading(false);
    };
    init();
  }, [refresh]);

  const addHabit = useCallback(async (habit: Habit) => {
    await saveHabit(habit);
    setHabits((prev) => [...prev, habit]);
  }, []);

  const updateHabit = useCallback(async (habit: Habit) => {
    await saveHabit(habit);
    setHabits((prev) => prev.map((h) => (h.id === habit.id ? habit : h)));
  }, []);

  const removeHabit = useCallback(async (id: string) => {
    await deleteHabit(id);
    setHabits((prev) => prev.filter((h) => h.id !== id));
    setCompletions((prev) => prev.filter((c) => c.habitId !== id));
  }, []);

  const toggleHabitCompletion = useCallback(async (habitId: string, date: string) => {
    const wasCompleted = await toggleCompletion(habitId, date);
    const newCompletions = await getCompletions();
    setCompletions(newCompletions);
    return wasCompleted;
  }, []);

  const getStreakForHabit = useCallback(
    (habitId: string) => calculateStreak(completions, habitId),
    [completions],
  );

  const getTotalStreak = useCallback(() => {
    if (habits.length === 0) return 0;
    const streaks = habits.map((h) => calculateStreak(completions, h.id));
    return streaks.length > 0 ? Math.max(...streaks) : 0;
  }, [habits, completions]);

  return (
    <HabitsContext.Provider
      value={{
        habits,
        completions,
        isLoading,
        addHabit,
        updateHabit,
        removeHabit,
        toggleHabitCompletion,
        getStreakForHabit,
        getTotalStreak,
        refresh,
      }}
    >
      {children}
    </HabitsContext.Provider>
  );
}

export function useHabits() {
  const ctx = useContext(HabitsContext);
  if (!ctx) throw new Error("useHabits must be used within HabitsProvider");
  return ctx;
}
