import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useSubscription } from "@/lib/revenuecat";

interface ProBannerProps {
  visible: boolean;
  onClose: () => void;
}

const PRO_FEATURES = [
  { icon: "trending-up" as const, text: "Unlimited habits" },
  { icon: "bar-chart-2" as const, text: "Advanced stats & insights" },
  { icon: "sun" as const, text: "AI daily tips (coming soon)" },
  { icon: "download" as const, text: "Export your data" },
  { icon: "moon" as const, text: "Premium themes" },
];

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
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              borderRadius: 20,
            },
          ]}
        >
          <Text style={[styles.confirmTitle, { color: colors.foreground }]}>
            Confirm Purchase
          </Text>
          <Text
            style={[styles.confirmMessage, { color: colors.mutedForeground }]}
          >
            You are about to purchase{" "}
            <Text style={{ color: colors.primary, fontWeight: "600" }}>
              {packageInfo?.product?.title ?? "StreakFlow Pro"}
            </Text>{" "}
            for{" "}
            <Text style={{ color: colors.primary, fontWeight: "600" }}>
              {packageInfo?.product?.priceString ?? "..."}
            </Text>
            .{"\n\n"}This is a test purchase using RevenueCat's test store.
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

export function ProBanner({ visible, onClose }: ProBannerProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { offerings, isPurchasing, purchase } = useSubscription();
  const [selectedPkg, setSelectedPkg] = useState<"monthly" | "yearly">(
    "monthly",
  );
  const [confirmingPkg, setConfirmingPkg] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentOffering = offerings?.current;
  const monthlyPkg = currentOffering?.availablePackages.find(
    (p) => p.packageType === "MONTHLY" || p.identifier === "$rc_monthly",
  );
  const yearlyPkg = currentOffering?.availablePackages.find(
    (p) => p.packageType === "ANNUAL" || p.identifier === "$rc_annual",
  );

  const selectedPackage = selectedPkg === "monthly" ? monthlyPkg : yearlyPkg;

  const handleSubscribe = () => {
    if (!selectedPackage) return;
    setConfirmingPkg(selectedPackage);
  };

  const handleConfirmPurchase = async () => {
    setConfirmingPkg(null);
    setErrorMsg(null);
    try {
      await purchase(selectedPackage);
      onClose();
    } catch (e: any) {
      if (!e?.userCancelled) {
        setErrorMsg(e?.message ?? "Purchase failed. Please try again.");
      }
    }
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View
          style={[
            styles.container,
            {
              backgroundColor: colors.background,
              paddingTop: Platform.OS === "web" ? 67 : insets.top + 20,
              paddingBottom: insets.bottom + 20,
            },
          ]}
        >
          <Pressable
            onPress={onClose}
            style={[styles.closeButton, { backgroundColor: colors.secondary }]}
          >
            <Feather name="x" size={20} color={colors.mutedForeground} />
          </Pressable>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scroll}
          >
            <View style={styles.header}>
              <View
                style={[
                  styles.badge,
                  { backgroundColor: colors.primary + "22" },
                ]}
              >
                <Text style={[styles.badgeText, { color: colors.primary }]}>
                  PRO
                </Text>
              </View>
              <Text style={[styles.title, { color: colors.foreground }]}>
                Unlock StreakFlow Pro
              </Text>
              <Text
                style={[styles.subtitle, { color: colors.mutedForeground }]}
              >
                Everything you need to build unbreakable habits
              </Text>
            </View>

            <View
              style={[
                styles.featuresCard,
                { backgroundColor: colors.card, borderRadius: 20 },
              ]}
            >
              {PRO_FEATURES.map((f, i) => (
                <View key={i} style={styles.featureRow}>
                  <View
                    style={[
                      styles.featureIcon,
                      { backgroundColor: colors.primary + "22" },
                    ]}
                  >
                    <Feather name={f.icon} size={18} color={colors.primary} />
                  </View>
                  <Text
                    style={[styles.featureText, { color: colors.foreground }]}
                  >
                    {f.text}
                  </Text>
                  <Feather name="check" size={16} color={colors.primary} />
                </View>
              ))}
            </View>

            <View style={styles.plans}>
              {[
                {
                  id: "monthly" as const,
                  label: "Monthly",
                  pkg: monthlyPkg,
                  badge: null,
                },
                {
                  id: "yearly" as const,
                  label: "Yearly",
                  pkg: yearlyPkg,
                  badge: "Save 37%",
                },
              ].map((plan) => (
                <Pressable
                  key={plan.id}
                  onPress={() => setSelectedPkg(plan.id)}
                  style={[
                    styles.planCard,
                    {
                      backgroundColor: colors.card,
                      borderRadius: 16,
                      borderWidth: 2,
                      borderColor:
                        selectedPkg === plan.id
                          ? colors.primary
                          : colors.border,
                    },
                  ]}
                >
                  <View style={styles.planHeader}>
                    <Text
                      style={[styles.planLabel, { color: colors.foreground }]}
                    >
                      {plan.label}
                    </Text>
                    {plan.badge && (
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
                          {plan.badge}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.planPrice, { color: colors.primary }]}>
                    {plan.pkg?.product?.priceString ?? "—"}
                  </Text>
                  <Text
                    style={[
                      styles.planPeriod,
                      { color: colors.mutedForeground },
                    ]}
                  >
                    {plan.id === "monthly" ? "per month" : "per year"}
                  </Text>
                </Pressable>
              ))}
            </View>

            {errorMsg && (
              <Text style={[styles.errorText, { color: colors.destructive }]}>
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
                  Start Free Trial
                </Text>
              )}
            </Pressable>

            <Text style={[styles.legal, { color: colors.mutedForeground }]}>
              Subscription auto-renews. Cancel anytime in Settings.
            </Text>
          </ScrollView>
        </View>
      </Modal>

      <ConfirmModal
        visible={!!confirmingPkg}
        packageInfo={confirmingPkg}
        onConfirm={handleConfirmPurchase}
        onCancel={() => setConfirmingPkg(null)}
        colors={colors}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  closeButton: {
    position: "absolute",
    top: 16,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  scroll: {
    padding: 24,
    gap: 20,
  },
  header: {
    alignItems: "center",
    gap: 10,
    marginTop: 20,
  },
  badge: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  featuresCard: {
    padding: 20,
    gap: 16,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  plans: {
    flexDirection: "row",
    gap: 12,
  },
  planCard: {
    flex: 1,
    padding: 16,
    gap: 4,
  },
  planHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  planLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  saveBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  saveBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  planPrice: {
    fontSize: 24,
    fontWeight: "700",
  },
  planPeriod: {
    fontSize: 12,
  },
  errorText: {
    textAlign: "center",
    fontSize: 14,
  },
  subscribeBtn: {
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  subscribeBtnText: {
    fontSize: 17,
    fontWeight: "700",
  },
  legal: {
    fontSize: 12,
    textAlign: "center",
    lineHeight: 18,
  },
  confirmOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  confirmBox: {
    width: "100%",
    padding: 24,
    borderWidth: 1,
    gap: 16,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
  },
  confirmMessage: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  confirmButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  confirmBtn: {
    flex: 1,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmBtnText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
