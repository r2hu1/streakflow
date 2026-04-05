import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  useColorScheme,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ProBanner } from "@/components/ProBanner";
import { useColors } from "@/hooks/useColors";
import { useSubscription } from "@/lib/revenuecat";

function SettingsRow({
  icon,
  label,
  value,
  onPress,
  rightElement,
  colors,
}: {
  icon: string;
  label: string;
  value?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  colors: ReturnType<typeof useColors>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { opacity: pressed && onPress ? 0.7 : 1 },
      ]}
    >
      <View style={[styles.rowIcon, { backgroundColor: colors.primary + "22", borderRadius: 10 }]}>
        <Feather name={icon as any} size={18} color={colors.primary} />
      </View>
      <Text style={[styles.rowLabel, { color: colors.foreground }]}>{label}</Text>
      <View style={styles.rowRight}>
        {value && (
          <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>{value}</Text>
        )}
        {rightElement}
        {onPress && !rightElement && (
          <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
        )}
      </View>
    </Pressable>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const [showProBanner, setShowProBanner] = useState(false);
  const { isSubscribed, isLoading, offerings, restore } = useSubscription();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const currentPlan = isSubscribed ? "Pro" : "Free";
  const monthlyPkg = offerings?.current?.availablePackages.find(
    (p) => p.packageType === "MONTHLY" || p.identifier === "$rc_monthly",
  );

  return (
    <>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ScrollView
          contentContainerStyle={[
            styles.scroll,
            { paddingTop: topPad + 24, paddingBottom: bottomPad + 80 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.title, { color: colors.foreground }]}>Settings</Text>

          {!isSubscribed && (
            <Pressable
              onPress={() => setShowProBanner(true)}
              style={[styles.proCard, { backgroundColor: colors.primary + "15", borderRadius: 20, borderColor: colors.primary + "44", borderWidth: 1 }]}
            >
              <View style={styles.proCardContent}>
                <View style={[styles.proBadge, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.proBadgeText, { color: colors.primaryForeground }]}>PRO</Text>
                </View>
                <View style={styles.proText}>
                  <Text style={[styles.proTitle, { color: colors.foreground }]}>
                    Upgrade to Pro
                  </Text>
                  <Text style={[styles.proSubtitle, { color: colors.mutedForeground }]}>
                    {monthlyPkg?.product?.priceString ?? "$3.99"}/month — Unlimited habits & more
                  </Text>
                </View>
              </View>
              <Feather name="arrow-right" size={20} color={colors.primary} />
            </Pressable>
          )}

          {isSubscribed && (
            <View style={[styles.proCard, { backgroundColor: colors.primary + "15", borderRadius: 20, borderColor: colors.primary + "44", borderWidth: 1 }]}>
              <View style={styles.proCardContent}>
                <View style={[styles.proBadge, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.proBadgeText, { color: colors.primaryForeground }]}>PRO</Text>
                </View>
                <View style={styles.proText}>
                  <Text style={[styles.proTitle, { color: colors.foreground }]}>
                    StreakFlow Pro
                  </Text>
                  <Text style={[styles.proSubtitle, { color: colors.mutedForeground }]}>
                    Active — All features unlocked
                  </Text>
                </View>
              </View>
              <Feather name="check-circle" size={20} color={colors.primary} />
            </View>
          )}

          <View style={[styles.section, { backgroundColor: colors.card, borderRadius: 16 }]}>
            <Text style={[styles.sectionHeader, { color: colors.mutedForeground }]}>
              Appearance
            </Text>
            <SettingsRow
              icon="moon"
              label="Theme"
              value={colorScheme === "dark" ? "Dark" : "Light"}
              colors={colors}
            />
          </View>

          <View style={[styles.section, { backgroundColor: colors.card, borderRadius: 16 }]}>
            <Text style={[styles.sectionHeader, { color: colors.mutedForeground }]}>
              Subscription
            </Text>
            <SettingsRow
              icon="credit-card"
              label="Current Plan"
              value={currentPlan}
              colors={colors}
            />
            {!isSubscribed && (
              <SettingsRow
                icon="star"
                label="Upgrade to Pro"
                onPress={() => setShowProBanner(true)}
                colors={colors}
              />
            )}
            <SettingsRow
              icon="refresh-cw"
              label="Restore Purchases"
              onPress={() => restore()}
              colors={colors}
            />
          </View>

          <View style={[styles.section, { backgroundColor: colors.card, borderRadius: 16 }]}>
            <Text style={[styles.sectionHeader, { color: colors.mutedForeground }]}>About</Text>
            <SettingsRow
              icon="info"
              label="Version"
              value="1.0.0"
              colors={colors}
            />
            <SettingsRow
              icon="zap"
              label="StreakFlow"
              value="Made with focus"
              colors={colors}
            />
          </View>
        </ScrollView>
      </View>

      <ProBanner visible={showProBanner} onClose={() => setShowProBanner(false)} />
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 20, gap: 20 },
  title: { fontSize: 32, fontWeight: "700" },
  proCard: {
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  proCardContent: { flexDirection: "row", alignItems: "center", gap: 14, flex: 1 },
  proBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  proBadgeText: { fontSize: 11, fontWeight: "700", letterSpacing: 1.5 },
  proText: { flex: 1, gap: 2 },
  proTitle: { fontSize: 16, fontWeight: "600" },
  proSubtitle: { fontSize: 13 },
  section: { overflow: "hidden" },
  sectionHeader: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  rowIcon: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: { flex: 1, fontSize: 15 },
  rowRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  rowValue: { fontSize: 14 },
});
