import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

const USER_NAME_KEY = "streakflow_user_name";
const ONBOARDING_COMPLETE_KEY = "streakflow_onboarding_complete";
const TRIAL_START_KEY = "streakflow_trial_start";

const TRIAL_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

interface UserContextValue {
  userName: string;
  onboardingComplete: boolean;
  trialStartDate: Date | null;
  isTrialExpired: boolean;
  isLoading: boolean;
  setUserName: (name: string) => Promise<void>;
  completeOnboarding: (name: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userName, setUserNameState] = useState("");
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [trialStartDate, setTrialStartDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [name, complete, trialStr] = await Promise.all([
      AsyncStorage.getItem(USER_NAME_KEY),
      AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY),
      AsyncStorage.getItem(TRIAL_START_KEY),
    ]);
    setUserNameState(name ?? "");
    setOnboardingComplete(complete === "true");
    setTrialStartDate(trialStr ? new Date(trialStr) : null);
  }, []);

  useEffect(() => {
    refresh().finally(() => setIsLoading(false));
  }, [refresh]);

  const setUserName = useCallback(async (name: string) => {
    await AsyncStorage.setItem(USER_NAME_KEY, name);
    setUserNameState(name);
  }, []);

  const completeOnboarding = useCallback(async (name: string) => {
    const now = new Date().toISOString();
    await Promise.all([
      AsyncStorage.setItem(USER_NAME_KEY, name),
      AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, "true"),
      AsyncStorage.setItem(TRIAL_START_KEY, now),
    ]);
    setUserNameState(name);
    setOnboardingComplete(true);
    setTrialStartDate(new Date(now));
  }, []);

  const isTrialExpired = trialStartDate
    ? Date.now() - trialStartDate.getTime() > TRIAL_DURATION_MS
    : false;

  return (
    <UserContext.Provider
      value={{
        userName,
        onboardingComplete,
        trialStartDate,
        isTrialExpired,
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
