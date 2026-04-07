import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

const USER_NAME_KEY = "streakflow_user_name";
const ONBOARDING_COMPLETE_KEY = "streakflow_onboarding_complete";

interface UserContextValue {
  userName: string;
  onboardingComplete: boolean;
  isLoading: boolean;
  setUserName: (name: string) => Promise<void>;
  completeOnboarding: (name: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userName, setUserNameState] = useState("");
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [name, complete] = await Promise.all([
      AsyncStorage.getItem(USER_NAME_KEY),
      AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY),
    ]);
    setUserNameState(name ?? "");
    setOnboardingComplete(complete === "true");
  }, []);

  useEffect(() => {
    refresh().finally(() => setIsLoading(false));
  }, [refresh]);

  const setUserName = useCallback(async (name: string) => {
    await AsyncStorage.setItem(USER_NAME_KEY, name);
    setUserNameState(name);
  }, []);

  const completeOnboarding = useCallback(async (name: string) => {
    await Promise.all([
      AsyncStorage.setItem(USER_NAME_KEY, name),
      AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, "true"),
    ]);
    setUserNameState(name);
    setOnboardingComplete(true);
  }, []);

  return (
    <UserContext.Provider
      value={{
        userName,
        onboardingComplete,
        isLoading,
        setUserName,
        completeOnboarding,
        refresh,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}
