import Paystack from "@/components/Paystack";
import { colors, globalStyles } from "@/styles/global";
import { ScrollView, StyleSheet, Text } from "react-native";

export default function SubscriptionsScreen() {
  return (
    <ScrollView
      style={globalStyles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={globalStyles.title}>Subscriptions</Text>

      <Text style={styles.subtitle}>
        Manage your ChopperHub access and continue with meal tracking,
        Meal-lysis insights, and daily reminders.
      </Text>

      <Paystack />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 120,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
});
