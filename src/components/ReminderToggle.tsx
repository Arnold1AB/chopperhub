import { supabase } from "@/lib/supabase";
import { colors } from "@/styles/global";
import {
  cancelMealReminders,
  requestPermissions,
  scheduleMealReminders,
} from "@/utils/notifications";
import { useEffect, useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";

export default function ReminderToggle() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    loadReminderPreference();
  }, []);

  const loadReminderPreference = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("reminders_enabled")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.log(error);
        return;
      }

      setEnabled(data?.reminders_enabled ?? false);
    } catch (error) {
      console.log(error);
    }
  };

  const toggle = async (value: boolean) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      if (value) {
        const granted = await requestPermissions();

        if (!granted) return;

        await scheduleMealReminders();
      } else {
        await cancelMealReminders();
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          reminders_enabled: value,
        })
        .eq("id", user.id);

      if (error) {
        console.log(error);
        return;
      }

      setEnabled(value);
    } catch (error) {
      console.error("Reminder error:", error);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>Daily Meal Reminders</Text>

        <Text style={styles.description}>
          Receive reminders to keep your ChopperHub log up to date.
        </Text>
      </View>

      <Switch
        value={enabled}
        onValueChange={toggle}
        trackColor={{
          false: colors.surfaceElevated,
          true: colors.secondary,
        }}
        thumbColor={colors.primary}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 18,
    marginTop: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  textContainer: {
    flex: 1,
    marginRight: 16,
  },

  title: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "700",
  },

  description: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
});
