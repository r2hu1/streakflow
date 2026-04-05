import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useCallback } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";

interface HabitCheckButtonProps {
  completed: boolean;
  onPress: () => void;
  size?: number;
}

export function HabitCheckButton({ completed, onPress, size = 56 }: HabitCheckButtonProps) {
  const colors = useColors();
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = useCallback(() => {
    scale.value = withSequence(withSpring(0.85), withSpring(1.1), withSpring(1));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  }, [onPress, scale]);

  return (
    <Pressable onPress={handlePress}>
      <Animated.View
        style={[
          animatedStyle,
          styles.button,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: completed ? colors.primary : "transparent",
            borderWidth: 2,
            borderColor: completed ? colors.primary : colors.border,
          },
        ]}
      >
        {completed && (
          <Feather
            name="check"
            size={size * 0.45}
            color={colors.primaryForeground}
          />
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
  },
});
