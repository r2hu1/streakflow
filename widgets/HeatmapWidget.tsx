import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

interface HeatmapWidgetProps {
  data: { date: string; count: number }[];
}

export function HeatmapWidget({ data }: HeatmapWidgetProps) {
  // Take last 7 weeks for the widget (7 columns * 7 rows)
  const last49Days = data.slice(-49);
  
  const maxCount = Math.max(...last49Days.map(d => d.count), 1);

  const getColor = (count: number) => {
    if (count === 0) return '#1f1f1f'; // dark.heatmap.empty
    const ratio = count / maxCount;
    if (ratio < 0.25) return '#083344';
    if (ratio < 0.5) return '#155e75';
    if (ratio < 0.75) return '#0e7490';
    return '#22D3EE';
  };

  const weeks: { date: string; count: number }[][] = [];
  let currentWeek: { date: string; count: number }[] = [];

  for (const item of last49Days) {
    currentWeek.push(item);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#0A0A0A',
        padding: 12,
        borderRadius: 16,
      }}
    >
      <TextWidget
        text="Activity Heatmap"
        style={{
          fontSize: 14,
          fontWeight: 'bold',
          color: '#fafafa',
          marginBottom: 8,
        }}
      />
      <FlexWidget style={{ flexDirection: 'row', flexGap: 4 }}>
        {weeks.map((week, wi) => (
          <FlexWidget key={`week-${wi}`} style={{ flexDirection: 'column', flexGap: 4 }}>
            {week.map((day, di) => (
              <FlexWidget
                key={`day-${wi}-${di}`}
                style={{
                  width: 12,
                  height: 12,
                  backgroundColor: getColor(day.count),
                  borderRadius: 2,
                }}
              />
            ))}
          </FlexWidget>
        ))}
      </FlexWidget>
    </FlexWidget>
  );
}
