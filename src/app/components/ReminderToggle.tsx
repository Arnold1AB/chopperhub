import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";

import { colors } from "@/styles/global";
import {
    cancelMealReminders,
    requestPermissions,
    scheduleMealReminders,
} from "@/utils/notifications";

const REMINDERS_KEY = "remindersEnabled";

export default function ReminderToggle() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const load = async () => {
      const value = await AsyncStorage.getItem(REMINDERS_KEY);
      setEnabled(value === "true");
    };

    load();
  }, []);

  const toggle = async (value: boolean) => {
    try {
      if (value) {
        const granted = await requestPermissions();

        if (!granted) {
          return;
        }

        await scheduleMealReminders();
      } else {
        await cancelMealReminders();
      }

      setEnabled(value);

      await AsyncStorage.setItem(REMINDERS_KEY, value.toString());
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
