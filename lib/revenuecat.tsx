import React, { createContext, useContext } from "react";
import Purchases from "react-native-purchases";
import { useMutation, useQuery } from "@tanstack/react-query";

const REVENUECAT_ANDROID_API_KEY =
  process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY;

export const REVENUECAT_ENTITLEMENT_IDENTIFIER = "pro";

function getRevenueCatApiKey(): string | null {
  if (!REVENUECAT_ANDROID_API_KEY) {
    return null;
  }

  return REVENUECAT_ANDROID_API_KEY;
}

export let revenueCatInitialized = false;

export function initializeRevenueCat() {
  const apiKey = getRevenueCatApiKey();
  if (!apiKey) {
    console.error("RevenueCat: Android API key not configured!");
    console.error(
      "Set EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY in your .env file",
    );
    return;
  }

  try {
    Purchases.setLogLevel(Purchases.LOG_LEVEL.DEBUG);
    Purchases.configure({ apiKey });
    revenueCatInitialized = true;
    console.log("✅ RevenueCat initialized successfully");
  } catch (error: any) {
    console.error("❌ Failed to initialize RevenueCat:", error.message);
  }
}

function useSubscriptionContext() {
  const customerInfoQuery = useQuery({
    queryKey: ["revenuecat", "customer-info"],
    queryFn: async () => {
      if (!revenueCatInitialized) return null;
      const info = await Purchases.getCustomerInfo();
      return info;
    },
    staleTime: 60 * 1000,
    enabled: revenueCatInitialized,
  });

  const offeringsQuery = useQuery({
    queryKey: ["revenuecat", "offerings"],
    queryFn: async () => {
      if (!revenueCatInitialized) {
        console.warn("RevenueCat not initialized, returning null offerings");
        return null;
      }
      try {
        const offerings = await Purchases.getOfferings();
        console.log("Offerings fetched:", offerings.current?.identifier);
        if (!offerings.current) {
          console.warn(
            "⚠️ No current offering configured in RevenueCat dashboard",
          );
        }
        return offerings;
      } catch (error: any) {
        console.error("Failed to fetch offerings:", error.message);
        throw error;
      }
    },
    staleTime: 300 * 1000,
    enabled: revenueCatInitialized,
  });

  const purchaseMutation = useMutation({
    mutationFn: async (packageToPurchase: any) => {
      console.log(
        "Attempting to purchase package:",
        packageToPurchase?.identifier,
      );
      if (!revenueCatInitialized) {
        throw new Error("RevenueCat not initialized. Check your API keys.");
      }
      try {
        const { customerInfo } =
          await Purchases.purchasePackage(packageToPurchase);
        console.log("Purchase successful");
        return customerInfo;
      } catch (error: any) {
        console.error("Purchase failed:", error.message);
        throw error;
      }
    },
    onSuccess: () => {
      console.log("Refetching customer info after purchase");
      customerInfoQuery.refetch();
    },
    onError: (error: any) => {
      console.error("Purchase mutation error:", error);
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async () => {
      return Purchases.restorePurchases();
    },
    onSuccess: () => customerInfoQuery.refetch(),
  });

  const isSubscribed =
    customerInfoQuery.data?.entitlements.active?.[
      REVENUECAT_ENTITLEMENT_IDENTIFIER
    ] !== undefined;

  return {
    customerInfo: customerInfoQuery.data,
    offerings: offeringsQuery.data,
    isSubscribed,
    isLoading: customerInfoQuery.isLoading || offeringsQuery.isLoading,
    purchase: purchaseMutation.mutateAsync,
    restore: restoreMutation.mutateAsync,
    isPurchasing: purchaseMutation.isPending,
    isRestoring: restoreMutation.isPending,
    refetchCustomerInfo: customerInfoQuery.refetch,
  };
}

type SubscriptionContextValue = ReturnType<typeof useSubscriptionContext>;
const Context = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const value = useSubscriptionContext();
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function useSubscription() {
  const ctx = useContext(Context);
  if (!ctx) {
    throw new Error(
      "useSubscription must be used within a SubscriptionProvider",
    );
  }
  return ctx;
}
