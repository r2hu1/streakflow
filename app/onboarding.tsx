import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewToken,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useSubscription } from "@/lib/revenuecat";
import { useUser } from "@/store/userStore";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const TRIAL_DAYS = 7;

// ─── Slide 1: Welcome & Name ─────────────────────────────────────────────────
function WelcomeSlide({
  name,
  onChangeName,
  colors,
}: {
  name: string;
  onChangeName: (v: string) => void;
  colors: ReturnType<typeof useColors>;
}) {
  const scale = useSharedValue(0.8);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withSpring(1, { damping: 14 });
    opacity.value = withTiming(1, { duration: 600 });
  }, []);

  const logoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.slide, { width: SCREEN_WIDTH }]}
    >
      <View style={styles.slideContent}>
        <Animated.View
          style={[
            styles.logoWrap,
            { backgroundColor: colors.primary, borderRadius: 32 },
            logoStyle,
          ]}
        >
          <Feather name="zap" size={52} color={colors.primaryForeground} />
        </Animated.View>

        <Animated.Text
          entering={FadeInDown.delay(300).duration(500)}
          style={[styles.slideTitle, { color: colors.foreground }]}
        >
          Welcome to{"\n"}StreakFlow
        </Animated.Text>

        <Animated.Text
          entering={FadeInDown.delay(450).duration(500)}
          style={[styles.slideSubtitle, { color: colors.mutedForeground }]}
        >
          Build powerful habits, one day at a time.
        </Animated.Text>

        <Animated.View
          entering={FadeInDown.delay(600).duration(500)}
          style={styles.nameField}
        >
          <Text style={[styles.nameLabel, { color: colors.mutedForeground }]}>
            What should we call you?
          </Text>
          <TextInput
            value={name}
            onChangeText={onChangeName}
            placeholder="Your name..."
            placeholderTextColor={colors.mutedForeground}
            autoFocus={false}
            returnKeyType="done"
            onSubmitEditing={() => Keyboard.dismiss()}
            style={[
              styles.nameInput,
              {
                backgroundColor: colors.card,
                color: colors.foreground,
                borderColor: name.length > 0 ? colors.primary : colors.border,
                borderRadius: 14,
              },
            ]}
          />
        </Animated.View>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Slide 2: Habits ─────────────────────────────────────────────────────────
function AnimatedCheck({
  delay,
  colors,
}: {
  delay: number;
  colors: ReturnType<typeof useColors>;
}) {
  const scale = useSharedValue(0);
  const bg = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(delay, withSpring(1, { damping: 10 }));
    bg.value = withDelay(delay, withTiming(1, { duration: 300 }));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    backgroundColor: bg.value === 1 ? colors.primary : "transparent",
    borderColor: colors.primary,
    borderWidth: 2,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  }));

  const iconStyle = useAnimatedStyle(() => ({ opacity: bg.value }));

  return (
    <Animated.View style={style}>
      <Animated.View style={iconStyle}>
        <Feather name="check" size={24} color={colors.primaryForeground} />
      </Animated.View>
    </Animated.View>
  );
}

const SAMPLE_HABITS = [
  { icon: "sun", name: "Morning run" },
  { icon: "book", name: "Read 30 min" },
  { icon: "droplet", name: "Drink water" },
];

function HabitsSlide({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View style={[styles.slide, styles.slideContent, { width: SCREEN_WIDTH }]}>
      <Animated.View
        entering={FadeIn.duration(400)}
        style={[
          styles.featureIcon,
          { backgroundColor: colors.primary + "22", borderRadius: 24 },
        ]}
      >
        <Feather name="check-circle" size={40} color={colors.primary} />
      </Animated.View>

      <Animated.Text
        entering={FadeInDown.delay(200).duration(500)}
        style={[styles.slideTitle, { color: colors.foreground }]}
      >
        Build habits{"\n"}that stick
      </Animated.Text>
      <Animated.Text
        entering={FadeInDown.delay(350).duration(500)}
        style={[styles.slideSubtitle, { color: colors.mutedForeground }]}
      >
        Track daily & weekly habits with a single tap.
      </Animated.Text>

      <Animated.View
        entering={FadeInUp.delay(500).duration(500)}
        style={[
          styles.demoCard,
          { backgroundColor: colors.card, borderRadius: 20 },
        ]}
      >
        {SAMPLE_HABITS.map((h, i) => (
          <View key={h.name} style={styles.habitRow}>
            <View
              style={[
                styles.habitIcon,
                { backgroundColor: colors.primary + "22", borderRadius: 10 },
              ]}
            >
              <Feather name={h.icon as any} size={18} color={colors.primary} />
            </View>
            <Text style={[styles.habitName, { color: colors.foreground }]}>
              {h.name}
            </Text>
            <AnimatedCheck delay={700 + i * 250} colors={colors} />
          </View>
        ))}
      </Animated.View>
    </View>
  );
}

// ─── Slide 3: Heatmap ─────────────────────────────────────────────────────────
interface HeatCellProps {
  delay: number;
  targetOpacity: number;
  color: string;
}

function HeatCell({ delay, targetOpacity, color }: HeatCellProps) {
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withTiming(targetOpacity, { duration: 300 }),
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    backgroundColor: color,
    width: 16,
    height: 16,
    borderRadius: 3,
  }));

  return <Animated.View style={style} />;
}

// Pre-compute cell data outside component to avoid recreating on each render
const HEAT_CELLS = Array.from({ length: 91 }, (_, i) => ({
  delay: 400 + i * 18,
  targetOpacity: Math.random() > 0.35 ? 1 : 0.15,
  isHigh: Math.random() > 0.4,
}));

function HeatmapSlide({ colors }: { colors: ReturnType<typeof useColors> }) {
  const hm = (colors as any).heatmap;

  return (
    <View style={[styles.slide, styles.slideContent, { width: SCREEN_WIDTH }]}>
      <Animated.View
        entering={FadeIn.duration(400)}
        style={[
          styles.featureIcon,
          { backgroundColor: colors.primary + "22", borderRadius: 24 },
        ]}
      >
        <Feather name="grid" size={40} color={colors.primary} />
      </Animated.View>

      <Animated.Text
        entering={FadeInDown.delay(200).duration(500)}
        style={[styles.slideTitle, { color: colors.foreground }]}
      >
        See your{"\n"}entire journey
      </Animated.Text>
      <Animated.Text
        entering={FadeInDown.delay(350).duration(500)}
        style={[styles.slideSubtitle, { color: colors.mutedForeground }]}
      >
        A GitHub-style heatmap of every day you showed up.
      </Animated.Text>

      <Animated.View
        entering={FadeInUp.delay(500).duration(500)}
        style={[
          styles.heatmapDemo,
          { backgroundColor: colors.card, borderRadius: 20 },
        ]}
      >
        <View style={styles.heatGrid}>
          {Array.from({ length: 13 }, (_, col) => (
            <View key={col} style={styles.heatCol}>
              {Array.from({ length: 7 }, (_, row) => {
                const idx = col * 7 + row;
                const cell = HEAT_CELLS[idx];
                return (
                  <HeatCell
                    key={row}
                    delay={cell.delay}
                    targetOpacity={cell.targetOpacity}
                    color={cell.isHigh ? hm.level4 : hm.level2}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

// ─── Slide 4: Stats ───────────────────────────────────────────────────────────
function AnimatedStat({
  value,
  label,
  delay,
  colors,
}: {
  value: number;
  label: string;
  delay: number;
  colors: ReturnType<typeof useColors>;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(delay, withTiming(1, { duration: 800 }));
  }, []);

  const barStyle = useAnimatedStyle(() => ({
    height: progress.value * value,
    backgroundColor: colors.primary,
    borderRadius: 6,
    width: 32,
    alignSelf: "flex-end" as const,
  }));

  return (
    <View style={styles.statCol}>
      <View style={styles.barTrack}>
        <Animated.View style={barStyle} />
      </View>
      <Text style={[styles.barLabel, { color: colors.mutedForeground }]}>
        {label}
      </Text>
    </View>
  );
}

const STATS_DATA = [
  { value: 60, label: "Mon" },
  { value: 90, label: "Tue" },
  { value: 45, label: "Wed" },
  { value: 80, label: "Thu" },
  { value: 100, label: "Fri" },
  { value: 70, label: "Sat" },
  { value: 85, label: "Sun" },
];

function StatsSlide({ colors }: { colors: ReturnType<typeof useColors> }) {
  return (
    <View style={[styles.slide, styles.slideContent, { width: SCREEN_WIDTH }]}>
      <Animated.View
        entering={FadeIn.duration(400)}
        style={[
          styles.featureIcon,
          { backgroundColor: colors.primary + "22", borderRadius: 24 },
        ]}
      >
        <Feather name="bar-chart-2" size={40} color={colors.primary} />
      </Animated.View>

      <Animated.Text
        entering={FadeInDown.delay(200).duration(500)}
        style={[styles.slideTitle, { color: colors.foreground }]}
      >
        Powerful{"\n"}insights
      </Animated.Text>
      <Animated.Text
        entering={FadeInDown.delay(350).duration(500)}
        style={[styles.slideSubtitle, { color: colors.mutedForeground }]}
      >
        Track completion rates, longest streaks, and monthly overviews.
      </Animated.Text>

      <Animated.View
        entering={FadeInUp.delay(500).duration(500)}
        style={[
          styles.statsDemo,
          { backgroundColor: colors.card, borderRadius: 20 },
        ]}
      >
        <View style={styles.statsRow}>
          {[
            { val: "21", label: "Day streak", icon: "zap" },
            { val: "94%", label: "This month", icon: "trending-up" },
          ].map((s) => (
            <View
              key={s.label}
              style={[
                styles.statChip,
                { backgroundColor: colors.primary + "15", borderRadius: 14 },
              ]}
            >
              <Feather name={s.icon as any} size={16} color={colors.primary} />
              <Text style={[styles.statChipVal, { color: colors.foreground }]}>
                {s.val}
              </Text>
              <Text
                style={[
                  styles.statChipLabel,
                  { color: colors.mutedForeground },
                ]}
              >
                {s.label}
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.barsContainer}>
          {STATS_DATA.map((s, i) => (
            <AnimatedStat
              key={s.label}
              value={s.value}
              label={s.label}
              delay={600 + i * 80}
              colors={colors}
            />
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

// ─── Slide 5: Upgrade ─────────────────────────────────────────────────────────
const PRO_FEATURES = [
  { icon: "trending-up" as const, text: "Unlimited habits" },
  { icon: "bar-chart-2" as const, text: "Advanced stats & insights" },
  { icon: "sun" as const, text: "AI daily tips (coming soon)" },
  { icon: "download" as const, text: "Export your data" },
  { icon: "moon" as const, text: "Premium themes" },
];

function UpgradeSlide({
  colors,
  onSkipTrial,
  onStartTrial,
}: {
  colors: ReturnType<typeof useColors>;
  onSkipTrial: () => void;
  onStartTrial: () => void;
}) {
  const { offerings, isPurchasing, purchase } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">(
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
      onStartTrial();
    } catch (e: any) {
      if (!e?.userCancelled) {
        setErrorMsg(e?.message ?? "Purchase failed. Please try again.");
      }
    }
  };

  return (
    <>
      <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
        <View style={[styles.upgradeContent]}>
          <Animated.View
            entering={FadeIn.duration(400)}
            style={styles.proBadgeWrap}
          >
            <View
              style={[styles.proBadge, { backgroundColor: colors.primary }]}
            >
              <Text
                style={[
                  styles.proBadgeText,
                  { color: colors.primaryForeground },
                ]}
              >
                PRO
              </Text>
            </View>
          </Animated.View>

          <Animated.Text
            entering={FadeInDown.delay(200).duration(500)}
            style={[styles.upgTitle, { color: colors.foreground }]}
          >
            Start your{"\n"}
            {TRIAL_DAYS}-day free trial
          </Animated.Text>
          <Animated.Text
            entering={FadeInDown.delay(350).duration(500)}
            style={[styles.upgSub, { color: colors.mutedForeground }]}
          >
            No charge today. Cancel anytime.
          </Animated.Text>

          <Animated.View
            entering={FadeInUp.delay(450).duration(500)}
            style={[
              styles.featuresCard,
              { backgroundColor: colors.card, borderRadius: 20 },
            ]}
          >
            {PRO_FEATURES.map((f, i) => (
              <View key={i} style={styles.featureRow}>
                <View
                  style={[
                    styles.featureIconBox,
                    {
                      backgroundColor: colors.primary + "22",
                      borderRadius: 10,
                    },
                  ]}
                >
                  <Feather name={f.icon} size={16} color={colors.primary} />
                </View>
                <Text
                  style={[styles.featureText, { color: colors.foreground }]}
                >
                  {f.text}
                </Text>
                <Feather name="check" size={14} color={colors.primary} />
              </View>
            ))}
          </Animated.View>

          <Animated.View
            entering={FadeInUp.delay(600).duration(500)}
            style={styles.plansRow}
          >
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
                save: "Best value",
              },
            ].map((plan) => (
              <Pressable
                key={plan.id}
                onPress={() => setSelectedPlan(plan.id)}
                style={[
                  styles.planCard,
                  {
                    backgroundColor: colors.card,
                    borderRadius: 14,
                    borderWidth: 2,
                    borderColor:
                      selectedPlan === plan.id ? colors.primary : colors.border,
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
                <Text style={[styles.planLabel, { color: colors.foreground }]}>
                  {plan.label}
                </Text>
                <Text style={[styles.planPrice, { color: colors.primary }]}>
                  {plan.pkg?.product?.priceString ?? "—"}
                </Text>
              </Pressable>
            ))}
          </Animated.View>

          {errorMsg && (
            <Text style={[styles.errorText, { color: colors.destructive }]}>
              {errorMsg}
            </Text>
          )}

          <Animated.View
            entering={FadeInUp.delay(700).duration(500)}
            style={styles.ctaWrap}
          >
            <Pressable
              onPress={handleSubscribe}
              disabled={isPurchasing || !selectedPackage}
              style={[
                styles.ctaBtn,
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
                <>
                  <Text
                    style={[
                      styles.ctaBtnText,
                      { color: colors.primaryForeground },
                    ]}
                  >
                    Start {TRIAL_DAYS}-Day Free Trial
                  </Text>
                  <Text
                    style={[
                      styles.ctaBtnSub,
                      { color: colors.primaryForeground + "BB" },
                    ]}
                  >
                    Then {selectedPackage?.product?.priceString ?? "—"}
                  </Text>
                </>
              )}
            </Pressable>

            <Pressable onPress={onSkipTrial} style={styles.skipBtn}>
              <Text
                style={[styles.skipText, { color: colors.mutedForeground }]}
              >
                Maybe later — start free trial anyway
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </View>

      {/* Confirm modal */}
      {confirmingPkg && (
        <View style={StyleSheet.absoluteFill}>
          <Pressable
            style={styles.confirmOverlay}
            onPress={() => setConfirmingPkg(null)}
          >
            <Pressable
              style={[
                styles.confirmBox,
                { backgroundColor: colors.card, borderRadius: 20 },
              ]}
              onPress={(e) => e.stopPropagation()}
            >
              <Text style={[styles.confirmTitle, { color: colors.foreground }]}>
                Confirm Purchase
              </Text>
              <Text
                style={[
                  styles.confirmMessage,
                  { color: colors.mutedForeground },
                ]}
              >
                Purchase{" "}
                <Text style={{ color: colors.primary, fontWeight: "600" }}>
                  {confirmingPkg?.product?.title ?? "StreakFlow Pro"}
                </Text>{" "}
                for{" "}
                <Text style={{ color: colors.primary, fontWeight: "600" }}>
                  {confirmingPkg?.product?.priceString ?? "..."}
                </Text>
                ?{"\n"}This uses RevenueCat's test store.
              </Text>
              <View style={styles.confirmBtns}>
                <Pressable
                  onPress={() => setConfirmingPkg(null)}
                  style={[
                    styles.confirmBtn,
                    { backgroundColor: colors.secondary, borderRadius: 12 },
                  ]}
                >
                  <Text
                    style={[styles.confirmBtnTxt, { color: colors.foreground }]}
                  >
                    Cancel
                  </Text>
                </Pressable>
                <Pressable
                  onPress={handleConfirm}
                  style={[
                    styles.confirmBtn,
                    { backgroundColor: colors.primary, borderRadius: 12 },
                  ]}
                >
                  <Text
                    style={[
                      styles.confirmBtnTxt,
                      { color: colors.primaryForeground },
                    ]}
                  >
                    Purchase
                  </Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </View>
      )}
    </>
  );
}

// ─── Main Onboarding ──────────────────────────────────────────────────────────
const SLIDES = ["welcome", "habits", "heatmap", "stats", "upgrade"] as const;

export default function OnboardingScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { completeOnboarding } = useUser();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userName, setUserName] = useState("");
  const listRef = useRef<FlatList>(null);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const goToNext = useCallback(() => {
    if (currentIndex === 0 && !userName.trim()) return;
    Keyboard.dismiss();
    const next = Math.min(currentIndex + 1, SLIDES.length - 1);
    listRef.current?.scrollToIndex({ index: next, animated: true });
    setCurrentIndex(next);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, [currentIndex, userName]);

  const handleFinish = useCallback(async () => {
    const name = userName.trim() || "there";
    await completeOnboarding(name);
    router.replace("/(tabs)");
  }, [userName, completeOnboarding, router]);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setCurrentIndex(viewableItems[0].index ?? 0);
      }
    },
    [],
  );

  const isLastSlide = currentIndex === SLIDES.length - 1;
  const canProgress = currentIndex === 0 ? userName.trim().length > 0 : true;

  const renderSlide = ({ item }: { item: (typeof SLIDES)[number] }) => {
    switch (item) {
      case "welcome":
        return (
          <WelcomeSlide
            name={userName}
            onChangeName={setUserName}
            colors={colors}
          />
        );
      case "habits":
        return <HabitsSlide colors={colors} />;
      case "heatmap":
        return <HeatmapSlide colors={colors} />;
      case "stats":
        return <StatsSlide colors={colors} />;
      case "upgrade":
        return (
          <UpgradeSlide
            colors={colors}
            onSkipTrial={handleFinish}
            onStartTrial={handleFinish}
          />
        );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={{ paddingTop: topPad }} />

      <FlatList
        ref={listRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        style={{ flex: 1 }}
      />

      {/* Dot indicator + Next button */}
      <View style={[styles.footer, { paddingBottom: bottomPad + 16 }]}>
        <View style={styles.dots}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    i === currentIndex ? colors.primary : colors.border,
                  width: i === currentIndex ? 20 : 8,
                },
              ]}
            />
          ))}
        </View>

        {!isLastSlide && (
          <Pressable
            onPress={goToNext}
            disabled={!canProgress}
            style={[
              styles.nextBtn,
              {
                backgroundColor: canProgress ? colors.primary : colors.border,
                borderRadius: 16,
              },
            ]}
          >
            <Text
              style={[
                styles.nextBtnText,
                {
                  color: canProgress
                    ? colors.primaryForeground
                    : colors.mutedForeground,
                },
              ]}
            >
              {currentIndex === 0 && !userName.trim()
                ? "Enter your name"
                : "Continue"}
            </Text>
            <Feather
              name="arrow-right"
              size={18}
              color={
                canProgress ? colors.primaryForeground : colors.mutedForeground
              }
            />
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  slide: { flex: 1, alignItems: "center", justifyContent: "center" },
  slideContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
    gap: 16,
  },
  logoWrap: {
    width: 96,
    height: 96,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  featureIcon: {
    width: 80,
    height: 80,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  slideTitle: {
    fontSize: 34,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 40,
  },
  slideSubtitle: { fontSize: 16, textAlign: "center", lineHeight: 24 },
  nameField: { width: "100%", gap: 8, marginTop: 8 },
  nameLabel: { fontSize: 14, fontWeight: "500" },
  nameInput: {
    height: 54,
    paddingHorizontal: 16,
    fontSize: 18,
    borderWidth: 1.5,
  },
  demoCard: { width: "100%", padding: 16, gap: 14 },
  habitRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  habitIcon: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  habitName: { flex: 1, fontSize: 15, fontWeight: "500" },
  heatmapDemo: { width: "100%", padding: 16 },
  heatGrid: { flexDirection: "row", gap: 4, justifyContent: "center" },
  heatCol: { flexDirection: "column", gap: 4 },
  statsDemo: { width: "100%", padding: 16, gap: 16 },
  statsRow: { flexDirection: "row", gap: 12 },
  statChip: { flex: 1, padding: 14, alignItems: "center", gap: 4 },
  statChipVal: { fontSize: 22, fontWeight: "700" },
  statChipLabel: { fontSize: 12, textAlign: "center" },
  barsContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 100,
  },
  statCol: { alignItems: "center", gap: 6, flex: 1 },
  barTrack: { flex: 1, justifyContent: "flex-end", width: 32 },
  barLabel: { fontSize: 10 },
  // Upgrade slide
  upgradeContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    gap: 14,
    justifyContent: "center",
  },
  proBadgeWrap: { alignItems: "center" },
  proBadge: { paddingHorizontal: 18, paddingVertical: 7, borderRadius: 20 },
  proBadgeText: { fontSize: 13, fontWeight: "800", letterSpacing: 2 },
  upgTitle: {
    fontSize: 34,
    fontWeight: "800",
    textAlign: "center",
    lineHeight: 40,
  },
  upgSub: { fontSize: 15, textAlign: "center", lineHeight: 22 },
  featuresCard: { width: "100%", padding: 16, gap: 12 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  featureIconBox: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: { flex: 1, fontSize: 14, fontWeight: "500" },
  plansRow: { flexDirection: "row", gap: 12, width: "100%" },
  planCard: { flex: 1, padding: 14, gap: 4, alignItems: "center" },
  saveBadge: {
    position: "absolute",
    top: -10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  saveBadgeText: { fontSize: 9, fontWeight: "700" },
  planLabel: { fontSize: 13, fontWeight: "600" },
  planPrice: { fontSize: 20, fontWeight: "700" },
  errorText: { fontSize: 13, textAlign: "center" },
  ctaWrap: { width: "100%", gap: 12 },
  ctaBtn: {
    height: 58,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  ctaBtnText: { fontSize: 16, fontWeight: "700" },
  ctaBtnSub: { fontSize: 12 },
  skipBtn: { alignItems: "center", paddingVertical: 6 },
  skipText: { fontSize: 13 },
  // Footer
  footer: { paddingHorizontal: 24, paddingTop: 16, gap: 20 },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  dot: { height: 8, borderRadius: 4 },
  nextBtn: {
    flexDirection: "row",
    height: 56,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  nextBtnText: { fontSize: 17, fontWeight: "700" },
  // Confirm modal
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
  confirmBtns: { flexDirection: "row", gap: 12, marginTop: 4 },
  confirmBtn: {
    flex: 1,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmBtnTxt: { fontSize: 15, fontWeight: "600" },
});
