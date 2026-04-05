import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface HeatmapProps {
  data: { date: string; count: number }[];
  maxCount?: number;
}

function HeatmapCell({ count, maxCount, colors }: { count: number; maxCount: number; colors: ReturnType<typeof useColors> }) {
  const hm = (colors as any).heatmap;

  const getColor = () => {
    if (count === 0) return hm.empty;
    const ratio = count / maxCount;
    if (ratio < 0.25) return hm.level1;
    if (ratio < 0.5) return hm.level2;
    if (ratio < 0.75) return hm.level3;
    return hm.level4;
  };

  return <View style={[styles.cell, { backgroundColor: getColor() }]} />;
}

export function Heatmap({ data, maxCount }: HeatmapProps) {
  const colors = useColors();

  const effectiveMax = useMemo(() => {
    if (maxCount) return maxCount;
    const max = Math.max(...data.map((d) => d.count), 1);
    return max;
  }, [data, maxCount]);

  const weeks = useMemo(() => {
    const result: { date: string; count: number }[][] = [];
    let week: { date: string; count: number }[] = [];

    const startPad = data.length > 0 ? new Date(data[0].date).getDay() : 0;
    for (let i = 0; i < startPad; i++) {
      week.push({ date: "", count: -1 });
    }

    for (const item of data) {
      week.push(item);
      if (week.length === 7) {
        result.push(week);
        week = [];
      }
    }

    if (week.length > 0) {
      while (week.length < 7) {
        week.push({ date: "", count: -1 });
      }
      result.push(week);
    }

    return result;
  }, [data]);

  return (
    <View style={styles.container}>
      {weeks.map((week, wi) => (
        <View key={wi} style={styles.week}>
          {week.map((day, di) =>
            day.count === -1 ? (
              <View key={di} style={styles.cell} />
            ) : (
              <HeatmapCell
                key={di}
                count={day.count}
                maxCount={effectiveMax}
                colors={colors}
              />
            ),
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    gap: 3,
  },
  week: {
    flexDirection: "column",
    gap: 3,
  },
  cell: {
    width: 11,
    height: 11,
    borderRadius: 2,
  },
});
