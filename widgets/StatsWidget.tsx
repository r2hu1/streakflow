import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

interface StatsWidgetProps {
  totalStreak: number;
  completedToday: number;
  totalHabits: number;
}

export function StatsWidget({ totalStreak, completedToday, totalHabits }: StatsWidgetProps) {
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#0A0A0A',
        padding: 16,
        borderRadius: 16,
        justifyContent: 'space-between',
      }}
    >
      <TextWidget
        text="My Stats"
        style={{
          fontSize: 14,
          fontWeight: 'bold',
          color: '#fafafa',
        }}
      />
      
      <FlexWidget style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <FlexWidget style={{ flexDirection: 'column' }}>
          <TextWidget
            text={totalStreak.toString()}
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: '#22D3EE',
            }}
          />
          <TextWidget
            text="Day Streak"
            style={{
              fontSize: 12,
              color: '#a3a3a3',
            }}
          />
        </FlexWidget>

        <FlexWidget style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
          <TextWidget
            text={`${completedToday}/${totalHabits}`}
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: '#22D3EE',
            }}
          />
          <TextWidget
            text="Today's Habits"
            style={{
              fontSize: 12,
              color: '#a3a3a3',
            }}
          />
        </FlexWidget>
      </FlexWidget>
    </FlexWidget>
  );
}
