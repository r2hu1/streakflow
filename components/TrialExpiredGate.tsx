import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";
import { useSubscription } from "@/lib/revenuecat";

interface ConfirmModalProps {
  visible: boolean;
  packageInfo: any;
  onConfirm: () => void;
  onCancel: () => void;
  colors: ReturnType<typeof useColors>;
}

function ConfirmModal({
  visible,
  packageInfo,
  onConfirm,
  onCancel,
  colors,
}: ConfirmModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.confirmOverlay}>
        <View
          style={[
            styles.confirmBox,
            { backgroundColor: colors.card, borderRadius: 20 },
          ]}
        >
          <Text style={[styles.confirmTitle, { color: colors.foreground }]}>
            Confirm Purchase
          </Text>
          <Text
            style={[styles.confirmMessage, { color: colors.mutedForeground }]}
          >
            Purchase{" "}
            <Text style={{ color: colors.primary, fontWeight: "600" }}>
              {packageInfo?.product?.title ?? "StreakFlow Pro"}
            </Text>{" "}
            for{" "}
            <Text style={{ color: colors.primary, fontWeight: "600" }}>
              {packageInfo?.product?.priceString ?? "..."}
            </Text>
            ?{"\n\n"}This uses RevenueCat's test store.
          </Text>
          <View style={styles.confirmButtons}>
            <Pressable
              onPress={onCancel}
              style={[
                styles.confirmBtn,
                { backgroundColor: colors.secondary, borderRadius: 12 },
              ]}
            >
              <Text
                style={[styles.confirmBtnText, { color: colors.foreground }]}
              >
                Cancel
              </Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              style={[
                styles.confirmBtn,
                { backgroundColor: colors.primary, borderRadius: 12 },
              ]}
            >
              <Text
                style={[
                  styles.confirmBtnText,
                  { color: colors.primaryForeground },
                ]}
              >
                Purchase
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function TrialExpiredGate({ visible }: { visible: boolean }) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { offerings, purchase, isPurchasing } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">(
    "monthly",
  );
  const [confirmingPkg, setConfirmingPkg] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const pulse = useSharedValue(1);
  React.useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.04, { duration: 900 }),
        withTiming(1, { duration: 900 }),
      ),
      -1,
      true,
    );
  }, []);
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const currentOffering = offerings?.current;
  const monthlyPkg = currentOffering?.availablePackages.find(
    (p) => p.packageType === "MONTHLY" || p.identifier === "$rc_monthly",
  );
  const yearlyPkg = currentOffering?.availablePackages.find(
    (p) => p.packageType === "ANNUAL" || p.identifier === "$rc_annual",
  );

  const selectedPackage = selectedPlan === "monthly" ? monthlyPkg : yearlyPkg;

  const handleSubscribe = () => {
    if (!selectedPackage) return;
    setConfirmingPkg(selectedPackage);
  };

  const handleConfirm = async () => {
    setConfirmingPkg(null);
    setErrorMsg(null);
    try {
      await purchase(selectedPackage);
    } catch (e: any) {
      if (!e?.userCancelled) {
        setErrorMsg(e?.message ?? "Purchase failed. Please try again.");
      }
    }
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <>
      <Modal visible={visible} animationType="fade" statusBarTranslucent>
        <View
          style={[
            styles.container,
            {
              backgroundColor: colors.background,
              paddingTop: topPad,
              paddingBottom: bottomPad,
            },
          ]}
        >
          <View style={styles.content}>
            <Animated.View
              style={[
                styles.lockIcon,
                { backgroundColor: colors.primary + "22", borderRadius: 40 },
                pulseStyle,
              ]}
            >
              <Feather name="lock" size={40} color={colors.primary} />
            </Animated.View>

            <Text style={[styles.title, { color: colors.foreground }]}>
              Your free trial has ended
            </Text>
            <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
              Upgrade to StreakFlow Pro to keep your streaks alive and access
              all features.
            </Text>

            <View style={styles.plansRow}>
              {[
                {
                  id: "monthly" as const,
                  label: "Monthly",
                  pkg: monthlyPkg,
                  save: null,
                },
                {
                  id: "yearly" as const,
                  label: "Yearly",
                  pkg: yearlyPkg,
                  save: "Save 37%",
                },
              ].map((plan) => (
                <Pressable
                  key={plan.id}
                  onPress={() => setSelectedPlan(plan.id)}
                  style={[
                    styles.planCard,
                    {
                      backgroundColor: colors.card,
                      borderRadius: 16,
                      borderWidth: 2,
                      borderColor:
                        selectedPlan === plan.id
                          ? colors.primary
                          : colors.border,
                    },
                  ]}
                >
                  {plan.save && (
                    <View
                      style={[
                        styles.saveBadge,
                        { backgroundColor: colors.primary },
                      ]}
                    >
                      <Text
                        style={[
                          styles.saveBadgeText,
                          { color: colors.primaryForeground },
                        ]}
                      >
                        {plan.save}
                      </Text>
                    </View>
                  )}
                  <Text
                    style={[styles.planLabel, { color: colors.foreground }]}
                  >
                    {plan.label}
                  </Text>
                  <Text style={[styles.planPrice, { color: colors.primary }]}>
                    {plan.pkg?.product?.priceString ?? "—"}
                  </Text>
                  <Text
                    style={[
                      styles.planPeriod,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    {plan.id === "monthly" ? "/ month" : "/ year"}
                  </Text>
                </Pressable>
              ))}
            </View>

            {errorMsg && (
              <Text style={[styles.error, { color: colors.destructive }]}>
                {errorMsg}
              </Text>
            )}

            <Pressable
              onPress={handleSubscribe}
              disabled={isPurchasing || !selectedPackage}
              style={[
                styles.subscribeBtn,
                {
                  backgroundColor: colors.primary,
                  borderRadius: 16,
                  opacity: isPurchasing || !selectedPackage ? 0.7 : 1,
                },
              ]}
            >
              {isPurchasing ? (
                <ActivityIndicator color={colors.primaryForeground} />
              ) : (
                <Text
                  style={[
                    styles.subscribeBtnText,
                    { color: colors.primaryForeground },
                  ]}
                >
                  Upgrade Now
                </Text>
              )}
            </Pressable>

            <Text style={[styles.legal, { color: colors.mutedForeground }]}>
              Subscription auto-renews. Cancel anytime in Settings.
            </Text>
          </View>
        </View>
      </Modal>

      <ConfirmModal
        visible={!!confirmingPkg}
        packageInfo={confirmingPkg}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmingPkg(null)}
        colors={colors}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center" },
  content: { paddingHorizontal: 28, alignItems: "center", gap: 20 },
  lockIcon: {
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  title: { fontSize: 28, fontWeight: "700", textAlign: "center" },
  subtitle: { fontSize: 15, textAlign: "center", lineHeight: 22 },
  plansRow: { flexDirection: "row", gap: 12, width: "100%" },
  planCard: { flex: 1, padding: 16, gap: 4, alignItems: "center" },
  saveBadge: {
    position: "absolute",
    top: -10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  saveBadgeText: { fontSize: 10, fontWeight: "700" },
  planLabel: { fontSize: 14, fontWeight: "600" },
  planPrice: { fontSize: 22, fontWeight: "700" },
  planPeriod: { fontSize: 12 },
  error: { fontSize: 13, textAlign: "center" },
  subscribeBtn: {
    width: "100%",
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  subscribeBtnText: { fontSize: 17, fontWeight: "700" },
  legal: { fontSize: 11, textAlign: "center", lineHeight: 16 },
  confirmOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  confirmBox: { width: "100%", padding: 24, gap: 16 },
  confirmTitle: { fontSize: 20, fontWeight: "700", textAlign: "center" },
  confirmMessage: { fontSize: 15, lineHeight: 22, textAlign: "center" },
  confirmButtons: { flexDirection: "row", gap: 12, marginTop: 4 },
  confirmBtn: {
    flex: 1,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmBtnText: { fontSize: 15, fontWeight: "600" },
});
