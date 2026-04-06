import React from 'react';
import { Flex, Text } from 'react-native-android-widget';

interface StatsWidgetProps {
  totalStreak: number;
  completedToday: number;
  totalHabits: number;
}

export function StatsWidget({ totalStreak, completedToday, totalHabits }: StatsWidgetProps) {
  return (
    <Flex
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#0A0A0A',
        padding: 16,
        borderRadius: 16,
        justifyContent: 'space-between',
      }}
    >
      <Text
        text="My Stats"
        style={{
          fontSize: 14,
          fontWeight: 'bold',
          color: '#fafafa',
        }}
      />
      
      <Flex direction="row" style={{ justifyContent: 'space-between' }}>
        <Flex direction="column">
          <Text
            text={totalStreak.toString()}
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: '#22D3EE',
            }}
          />
          <Text
            text="Day Streak"
            style={{
              fontSize: 12,
              color: '#a3a3a3',
            }}
          />
        </Flex>

        <Flex direction="column" style={{ alignItems: 'flex-end' }}>
          <Text
            text={`${completedToday}/${totalHabits}`}
            style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: '#22D3EE',
            }}
          />
          <Text
            text="Today's Habits"
            style={{
              fontSize: 12,
              color: '#a3a3a3',
            }}
          />
        </Flex>
      </Flex>
    </Flex>
  );
}
