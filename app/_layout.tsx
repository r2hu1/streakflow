import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ErrorBoundary } from "@/modules/errors";
import { HabitsProvider } from "@/store/habitsStore";
import { useThemeStore } from "@/store/themeStore";
import { UserProvider, useUser } from "@/store/userStore";
import { registerWidgets } from "@/widgets";
import { Platform } from "react-native";

SplashScreen.preventAutoHideAsync();

registerWidgets();

const queryClient = new QueryClient();

function AppGate({ children }: { children: React.ReactNode }) {
  const { onboardingComplete, isLoading } = useUser();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (isLoading) return;
    const inOnboarding = segments[0] === "onboarding";
    if (!onboardingComplete && !inOnboarding) {
      router.replace("/onboarding");
    } else if (onboardingComplete && inOnboarding) {
      router.replace("/(tabs)");
    }
  }, [isLoading, onboardingComplete, segments]);

  return <>{children}</>;
}

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="onboarding"
        options={{ headerShown: false, gestureEnabled: false }}
      />
      <Stack.Screen
        name="add-habit"
        options={{
          headerShown: false,
          presentation: "modal",
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const { loadTheme } = useThemeStore();

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    loadTheme();
    if (Platform.OS === "android") {
      registerWidgets();
    }
  }, []);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <UserProvider>
            <HabitsProvider>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <KeyboardProvider>
                  <AppGate>
                    <RootLayoutNav />
                  </AppGate>
                </KeyboardProvider>
              </GestureHandlerRootView>
            </HabitsProvider>
          </UserProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
