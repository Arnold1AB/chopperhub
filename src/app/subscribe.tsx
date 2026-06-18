import {
  getSubscriptionAccess,
  initializePaystackCheckout,
  subscriptionPlans,
  type SubscriptionPlan,
  verifyPaystackCheckout,
} from "@/lib/subscription";
import { colors, globalStyles } from "@/styles/global";
import { Ionicons } from "@expo/vector-icons";
import * as AuthSession from "expo-auth-session";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useEffect, useState } from "react";
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

export default function SubscribeScreen() {
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] =
    useState<SubscriptionPlan | null>(null);
  const [daysRemaining, setDaysRemaining] = useState(0);

  useEffect(() => {
    const loadAccess = async () => {
      try {
        const access = await getSubscriptionAccess();
        setDaysRemaining(access.daysRemaining);

        if (access.hasAccess) {
          router.replace("/(tabs)/home");
        }
      } catch (error) {
        console.log("SUBSCRIPTION ACCESS ERROR:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAccess();
  }, []);

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    try {
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
      console.log("PAYSTACK CHECKOUT ERROR:", error);
      Alert.alert(
        "Payment Not Confirmed",
        error?.message ?? "Please try again.",
      );
    } finally {
      setProcessingPlan(null);
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.secondary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={globalStyles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={globalStyles.title}>Choose Access</Text>
      <Text style={styles.subtitle}>
        Start with 14 days free. Continue with meal tracking, Meal-lysis
        insights, and daily food and water reminders when your trial ends.
      </Text>

      <View style={styles.trialCard}>
        <Ionicons name="time-outline" size={22} color={colors.secondary} />
        <Text style={styles.trialText}>
          {daysRemaining > 0
            ? `${daysRemaining} trial days remaining.`
            : "Your free trial has ended."}
        </Text>
      </View>

      {(Object.keys(subscriptionPlans) as SubscriptionPlan[]).map((plan) => {
        const details = subscriptionPlans[plan];
        const processing = processingPlan === plan;

        return (
          <View key={plan} style={styles.planCard}>
            <View>
              <Text style={styles.planLabel}>{details.label}</Text>
              <Text style={styles.price}>
                {details.priceUsd}{" "}
                <Text style={styles.priceMeta}>{details.cadence}</Text>
              </Text>
              <Text style={styles.description}>{details.description}</Text>
            </View>

            <TouchableOpacity
              style={[styles.button, processing && styles.buttonDisabled]}
              onPress={() => handleSubscribe(plan)}
              disabled={!!processingPlan}
            >
              {processing ? (
                <ActivityIndicator color={colors.primary} />
              ) : (
                <Text style={styles.buttonText}>Pay in Naira</Text>
              )}
            </TouchableOpacity>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 80,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
    marginBottom: 20,
  },
  trialCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16,
  },
  trialText: {
    color: colors.primary,
    fontWeight: "700",
    flex: 1,
  },
  planCard: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 20,
    marginBottom: 16,
  },
  planLabel: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  price: {
    color: colors.primary,
    fontSize: 34,
    fontWeight: "800",
    marginTop: 8,
  },
  priceMeta: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "600",
  },
  description: {
    color: colors.textMuted,
    lineHeight: 20,
    marginTop: 8,
  },
  button: {
    backgroundColor: colors.secondary,
    borderRadius: 14,
    alignItems: "center",
    paddingVertical: 15,
    marginTop: 18,
    minHeight: 50,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "800",
  },
});
