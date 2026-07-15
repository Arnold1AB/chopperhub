import {
  initializePaystackCheckout,
  subscriptionPlans,
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

export default function Paystack() {
  const [processingPlan, setProcessingPlan] =
    useState<SubscriptionPlan | null>(null);
  const [paymentError, setPaymentError] = useState("");

  const startCheckout = async (plan: SubscriptionPlan) => {
    try {
      setPaymentError("");
      setProcessingPlan(plan);

      const checkout = await initializePaystackCheckout(plan, callbackUrl);
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
      console.log("PAYSTACK PROFILE CHECKOUT ERROR:", error);
      setPaymentError(
        error?.message ??
          "Unable to open Paystack. Please confirm the payment functions are deployed.",
      );
    } finally {
      setProcessingPlan(null);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.icon}>
          <Ionicons name="card-outline" size={22} color="#0F172A" />
        </View>

        <View style={styles.copy}>
          <Text style={styles.eyebrow}>Subscription</Text>
          <Text style={styles.title}>Pay with Paystack</Text>
        </View>
      </View>

      <Text style={styles.body}>
        Continue after your 14-day trial with meal tracking, nutrition
        analysis, and daily food and water reminders.
      </Text>

      {paymentError && (
        <View style={styles.errorBox}>
          <Ionicons name="alert-circle" size={18} color={colors.accent} />
          <Text style={styles.errorText}>{paymentError}</Text>
        </View>
      )}

      {(Object.keys(subscriptionPlans) as SubscriptionPlan[]).map((plan) => {
        const details = subscriptionPlans[plan];
        const processing = processingPlan === plan;

        return (
          <TouchableOpacity
            key={plan}
            style={[styles.planButton, processing && styles.planButtonDisabled]}
            onPress={() => startCheckout(plan)}
            disabled={!!processingPlan}
            activeOpacity={0.84}
          >
            <View style={styles.planCopy}>
              <Text style={styles.planTitle}>{details.label}</Text>
              <Text style={styles.planSubtitle}>
                {details.priceUsd} {details.cadence}, paid in naira
              </Text>
            </View>

            {processing ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <Ionicons
                name="arrow-forward"
                size={20}
                color={colors.primary}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
    marginTop: 18,
    borderWidth: 1,
    borderColor: "rgba(53,167,255,0.5)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
  icon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  copy: {
    flex: 1,
  },
  eyebrow: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  title: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "800",
    marginTop: 3,
  },
  body: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 12,
    marginBottom: 14,
  },
  errorBox: {
    backgroundColor: "rgba(255,231,76,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,231,76,0.35)",
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    flexDirection: "row",
    gap: 8,
  },
  errorText: {
    color: colors.textMuted,
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
  },
  planButton: {
    backgroundColor: colors.surfaceElevated,
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  planButtonDisabled: {
    opacity: 0.65,
  },
  planCopy: {
    flex: 1,
  },
  planTitle: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "800",
  },
  planSubtitle: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 3,
  },
});
