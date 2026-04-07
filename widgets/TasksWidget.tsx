"use no memo";
import React from "react";
import { FlexWidget, TextWidget } from "react-native-android-widget";

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
    <FlexWidget
      style={{
        height: "match_parent",
        width: "match_parent",
        backgroundColor: "#0A0A0A",
        padding: 16,
        borderRadius: 16,
      }}
    >
      <TextWidget
        text="Today's Tasks"
        style={{
          fontSize: 14,
          fontWeight: "bold",
          color: "#fafafa",
          marginBottom: 12,
        }}
      />

      <FlexWidget style={{ flexDirection: "column", flexGap: 8 }}>
        {tasks.slice(0, 5).map((task) => (
          <FlexWidget
            key={task.id}
            style={{
              flexDirection: "row",
              alignItems: "center",
              flexGap: 8,
              backgroundColor: "#141414",
              padding: 8,
              borderRadius: 8,
            }}
          >
            <FlexWidget
              style={{
                width: 16,
                height: 16,
                borderRadius: 4,
                borderWidth: 2,
                borderColor: (task.color || "#22D3EE") as `#${string}`,
                backgroundColor: (task.completed
                  ? task.color || "#22D3EE"
                  : "#00000000") as `#${string}`,
              }}
            />
            <TextWidget
              text={task.name}
              style={{
                fontSize: 14,
                color: task.completed ? "#737373" : "#fafafa",
                // Note: textDecorationLine is NOT supported in TextWidget
              }}
            />
          </FlexWidget>
        ))}
        {tasks.length > 5 && (
          <TextWidget
            text={`+ ${tasks.length - 5} more tasks`}
            style={{
              fontSize: 12,
              color: "#a3a3a3",
              marginTop: 4,
              textAlign: "center",
            }}
          />
        )}
        {tasks.length === 0 && (
          <TextWidget
            text="No habits for today"
            style={{
              fontSize: 14,
              color: "#a3a3a3",
              fontStyle: "italic",
            }}
          />
        )}
      </FlexWidget>
    </FlexWidget>
  );
}
