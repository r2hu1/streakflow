import React from 'react';
import { Flex, Text, View } from 'react-native-android-widget';

interface Task {
  id: string;
  name: string;
  completed: boolean;
  color?: string;
}

interface TasksWidgetProps {
  tasks: Task[];
}

export function TasksWidget({ tasks }: TasksWidgetProps) {
  return (
    <Flex
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#0A0A0A',
        padding: 16,
        borderRadius: 16,
      }}
    >
      <Text
        text="Today's Tasks"
        style={{
          fontSize: 14,
          fontWeight: 'bold',
          color: '#fafafa',
          marginBottom: 12,
        }}
      />

      <Flex direction="column" style={{ gap: 8 }}>
        {tasks.slice(0, 5).map((task) => (
          <Flex
            key={task.id}
            direction="row"
            style={{
              alignItems: 'center',
              gap: 8,
              backgroundColor: '#141414',
              padding: 8,
              borderRadius: 8,
            }}
          >
            <View
              style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                borderWidth: 2,
                borderColor: task.color || '#22D3EE',
                backgroundColor: task.completed ? (task.color || '#22D3EE') : 'transparent',
              }}
            />
            <Text
              text={task.name}
              style={{
                fontSize: 14,
                color: task.completed ? '#737373' : '#fafafa',
                textDecorationLine: task.completed ? 'line-through' : 'none',
              }}
            />
          </Flex>
        ))}
        {tasks.length > 5 && (
          <Text
            text={`+ ${tasks.length - 5} more tasks`}
            style={{
              fontSize: 12,
              color: '#a3a3a3',
              marginTop: 4,
              textAlign: 'center',
            }}
          />
        )}
        {tasks.length === 0 && (
          <Text
            text="No habits for today"
            style={{
              fontSize: 14,
              color: '#a3a3a3',
              fontStyle: 'italic',
            }}
          />
        )}
      </Flex>
    </Flex>
  );
}
