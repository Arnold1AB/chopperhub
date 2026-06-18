import {
  initializePaystackCheckout,
  type SubscriptionPlan,
  verifyPaystackCheckout,
} from "@/lib/subscription";
import { colors } from "@/styles/global";
import { Ionicons } from "@expo/vector-icons";
import * as AuthSession from "expo-auth-session";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

WebBrowser.maybeCompleteAuthSession();

const callbackUrl = AuthSession.makeRedirectUri({
  scheme: "chopperhub",
  path: "payment-callback",
});

const monthlyFeatures = [
  "Full meal tracking and logging",
  "Nutrition and calorie insights",
  "Daily food and water reminders",
];

const yearlyFeatures = [
  "Everything in Monthly",
  "Advanced Meal-lysis analytics",
  "Priority support access",
  "Save 17% vs monthly",
];

export default function SubscriptionsScreen() {
  const [processingPlan, setProcessingPlan] =
    useState<SubscriptionPlan | null>(null);
  const [paymentError, setPaymentError] = useState("");

  const startCheckout = async (plan: SubscriptionPlan) => {
    try {
      setPaymentError("");
      setProcessingPlan(plan);

      const checkout = await initializePaystackCheckout(plan);
      const result = await WebBrowser.openAuthSessionAsync(
        checkout.authorization_url,
        callbackUrl,
      );

      if (result.type !== "success") return;

      const reference =
        new URL(result.url).searchParams.get("reference") ?? checkout.reference;

      await verifyPaystackCheckout(reference);

      Alert.alert("Payment Confirmed", "Your ChopperHub access is active.");
      router.replace("/(tabs)/home");
    } catch (error: any) {
      console.log("PAYSTACK SUBSCRIPTION CHECKOUT ERROR:", error);
      setPaymentError(
        error?.message ??
          "Unable to open Paystack. Please confirm the payment functions are deployed.",
      );
    } finally {
      setProcessingPlan(null);
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push("/profile" as never)}
      >
        <Ionicons name="arrow-back" size={18} color={colors.textMuted} />
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>

      <View style={styles.brandRow}>
        <View style={styles.brandIcon}>
          <Ionicons name="leaf" size={14} color="#052E16" />
        </View>
        <Text style={styles.brandText}>CHOPPERHUB PRO</Text>
      </View>

      <Text style={styles.title}>Upgrade Your{"\n"}Meal Journey</Text>
      <Text style={styles.subtitle}>
        Track meals, unlock insights, and build lasting healthy habits.
      </Text>

      <View style={styles.trialBanner}>
        <Ionicons name="gift" size={16} color={colors.secondary} />
        <Text style={styles.trialStrong}>14-day free trial</Text>
        <Text style={styles.trialMuted}>no charge until it ends</Text>
      </View>

      {paymentError && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle" size={18} color={colors.accent} />
          <Text style={styles.errorText}>{paymentError}</Text>
        </View>
      )}

      <PlanCard
        plan="monthly"
        title="Monthly"
        subtitle="Billed monthly, cancel anytime"
        price="$3"
        suffix="/ mo"
        features={monthlyFeatures}
        buttonLabel="Start Monthly"
        processing={processingPlan === "monthly"}
        disabled={!!processingPlan}
        onPress={() => startCheckout("monthly")}
      />

      <PlanCard
        plan="yearly"
        title="Yearly"
        subtitle="Just $2.50 / month"
        price="$30"
        suffix="/ yr"
        features={yearlyFeatures}
        buttonLabel="Get Yearly - Best Value"
        processing={processingPlan === "yearly"}
        disabled={!!processingPlan}
        onPress={() => startCheckout("yearly")}
        bestValue
      />

      <Text style={styles.footer}>
        Cancel anytime. Billed via Paystack. Secure checkout.
      </Text>
    </ScrollView>
  );
}

type PlanCardProps = {
  plan: SubscriptionPlan;
  title: string;
  subtitle: string;
  price: string;
  suffix: string;
  features: string[];
  buttonLabel: string;
  processing: boolean;
  disabled: boolean;
  onPress: () => void;
  bestValue?: boolean;
};

function PlanCard({
  title,
  subtitle,
  price,
  suffix,
  features,
  buttonLabel,
  processing,
  disabled,
  onPress,
  bestValue,
}: PlanCardProps) {
  return (
    <View style={[styles.planCard, bestValue && styles.yearlyCard]}>
      {bestValue && (
        <View style={styles.bestBadge}>
          <Text style={styles.bestBadgeText}>Best Value</Text>
        </View>
      )}

      <View style={styles.planHeader}>
        <View>
          <Text style={styles.planTitle}>{title}</Text>
          <Text style={styles.planSubtitle}>{subtitle}</Text>
        </View>

        <View style={styles.priceRow}>
          <Text style={[styles.price, bestValue && styles.yearlyPrice]}>
            {price}
          </Text>
          <Text style={styles.priceSuffix}>{suffix}</Text>
        </View>
      </View>

      <View style={styles.featureList}>
        {features.map((feature) => (
          <View key={feature} style={styles.featureRow}>
            <Ionicons
              name="checkmark-circle"
              size={15}
              color={bestValue ? "#35F28A" : colors.secondary}
            />
            <Text style={styles.featureText}>{feature}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        style={[
          styles.cta,
          bestValue && styles.yearlyCta,
          disabled && styles.disabled,
        ]}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.84}
      >
        {processing ? (
          <ActivityIndicator color={bestValue ? "#052E16" : colors.primary} />
        ) : (
          <Text style={[styles.ctaText, bestValue && styles.yearlyCtaText]}>
            {buttonLabel}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#07111F",
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 52,
    paddingBottom: 120,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 22,
  },
  backText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "700",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  brandIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#35F28A",
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: {
    color: "#35F28A",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  title: {
    color: colors.primary,
    fontSize: 31,
    lineHeight: 38,
    fontWeight: "900",
  },
  subtitle: {
    color: "#8EA3BC",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 12,
    marginBottom: 18,
  },
  trialBanner: {
    backgroundColor: "#142B49",
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  trialStrong: {
    color: colors.secondary,
    fontSize: 13,
    fontWeight: "900",
  },
  trialMuted: {
    color: "#8EA3BC",
    fontSize: 12,
    flex: 1,
  },
  errorBox: {
    backgroundColor: "rgba(255,231,76,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,231,76,0.38)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    flexDirection: "row",
    gap: 8,
  },
  errorText: {
    color: "#D6E1EC",
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
  planCard: {
    backgroundColor: "#0E1B2C",
    borderWidth: 1,
    borderColor: "#223550",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },
  yearlyCard: {
    backgroundColor: "#0E3F27",
    borderColor: "#28E178",
  },
  bestBadge: {
    position: "absolute",
    top: -10,
    right: 14,
    backgroundColor: "#35F28A",
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  bestBadgeText: {
    color: "#052E16",
    fontSize: 10,
    fontWeight: "900",
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  planTitle: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: "900",
  },
  planSubtitle: {
    color: "#9CB0C8",
    fontSize: 12,
    marginTop: 4,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  price: {
    color: colors.primary,
    fontSize: 29,
    fontWeight: "900",
  },
  yearlyPrice: {
    color: "#35F28A",
  },
  priceSuffix: {
    color: "#9CB0C8",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 5,
    marginLeft: 2,
  },
  featureList: {
    marginTop: 18,
    gap: 9,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  featureText: {
    color: "#EAF2FA",
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  cta: {
    backgroundColor: "#162D4D",
    borderRadius: 12,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  yearlyCta: {
    backgroundColor: "#35F28A",
  },
  disabled: {
    opacity: 0.65,
  },
  ctaText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "900",
  },
  yearlyCtaText: {
    color: "#052E16",
  },
  footer: {
    color: "#748AA4",
    fontSize: 11,
    textAlign: "center",
    marginTop: 8,
  },
});
