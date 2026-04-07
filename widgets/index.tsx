"use no memo";
import {
  registerWidgetTaskHandler,
  requestWidgetUpdate,
  type WidgetRepresentation,
} from "react-native-android-widget";
import {
  getHabits,
  getCompletions,
  getTodayDate,
  calculateStreak,
  getAllHabitsHeatmapData,
} from "../lib/database";
import { HeatmapWidget } from "./HeatmapWidget";
import { StatsWidget } from "./StatsWidget";
import { TasksWidget } from "./TasksWidget";
import React from "react";
import { Platform } from "react-native";

async function getWidgetComponent(
  widgetName: string,
): Promise<WidgetRepresentation> {
  const habits = await getHabits();
  const completions = await getCompletions();
  const today = getTodayDate();

  switch (widgetName) {
    case "Heatmap": {
      const heatmapData = getAllHabitsHeatmapData(completions, 7);
      return <HeatmapWidget data={heatmapData} />;
    }

    case "Stats": {
      const streaks = habits.map((h) => calculateStreak(completions, h.id));
      const totalStreak = streaks.length > 0 ? Math.max(...streaks) : 0;
      const completedToday = habits.filter((h) =>
        completions.some((c) => c.habitId === h.id && c.date === today),
      ).length;
      return (
        <StatsWidget
          totalStreak={totalStreak}
          completedToday={completedToday}
          totalHabits={habits.length}
        />
      );
    }

    case "Tasks": {
      const tasks = habits.map((h) => ({
        id: h.id,
        name: h.name,
        completed: completions.some(
          (c) => c.habitId === h.id && c.date === today,
        ),
        color: h.color ?? "#22D3EE",
      }));
      return <TasksWidget tasks={tasks} />;
    }

    default:
      throw new Error(`Unknown widget: ${widgetName}`);
  }
}

export function updateWidgets() {
  if (Platform.OS !== "android") return;

  try {
    const widgets = ["Heatmap", "Stats", "Tasks"];

    for (const widgetName of widgets) {
      requestWidgetUpdate({
        widgetName,
        renderWidget: () => getWidgetComponent(widgetName),
      });
    }
  } catch (error) {
    // Silently fail if native module is not linked (e.g. in Expo Go)
    console.warn(
      "Widget update skipped: Native module not linked. Widgets only work in Development Builds.",
    );
  }
}

export function registerWidgets() {
  if (Platform.OS !== "android") return;

  try {
    registerWidgetTaskHandler(async (props) => {
      const { widgetInfo, renderWidget } = props;
      const { widgetName } = widgetInfo;

      const component = await getWidgetComponent(widgetName);
      if (component) {
        renderWidget(component);
      }
    });
  } catch (error) {
    // Silently fail if native module is not linked (e.g. in Expo Go)
    console.warn(
      "Widget registration skipped: Native module not linked. Widgets only work in Development Builds.",
    );
  }
}
