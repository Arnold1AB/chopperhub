import { colors, globalStyles } from "@/styles/global";
import {
  areNotificationsAvailable,
  getNotificationsUnavailableMessage,
  getPermissionStatus,
  requestPermissions,
} from "@/utils/notifications";
import * as Linking from "expo-linking";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function NotificationsScreen() {
  const [enabled, setEnabled] = useState(false);
  const notificationsAvailable = areNotificationsAvailable();

  const checkPermission = async () => {
    setEnabled(await getPermissionStatus());
  };

  useEffect(() => {
    checkPermission();
  }, []);

  const enableNotifications = async () => {
    if (!notificationsAvailable) {
      Alert.alert("Development Build Required", getNotificationsUnavailableMessage());
      return;
    }

    const granted = await requestPermissions();

    if (granted) {
      setEnabled(true);

      Alert.alert(
        "Notifications Enabled",
        "Daily hydration reminders are now active.",
      );
    } else {
      Alert.alert(
        "Permission Required",
        "Enable notifications from your device settings.",
      );
    }
  };

  const openSettings = () => {
    Linking.openSettings();
  };

  return (
    <ScrollView style={globalStyles.container}>
      <Text style={globalStyles.title}>Notifications</Text>

      <Text style={styles.subtitle}>
        Manage hydration reminders and notification permissions.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Notification Status</Text>

        <Text
          style={[
            styles.status,
            {
              color: enabled ? colors.success : colors.textMuted,
            },
          ]}
        >
          {enabled ? "Enabled" : "Disabled"}
        </Text>

        {!notificationsAvailable && (
          <Text style={styles.body}>{getNotificationsUnavailableMessage()}</Text>
        )}

        {notificationsAvailable && !enabled && (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={enableNotifications}
          >
            <Text style={styles.primaryText}>Enable Notifications</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.secondaryButton} onPress={openSettings}>
          <Text style={styles.secondaryText}>Open Device Settings</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    color: colors.textMuted,
    fontSize: 14,
    marginTop: 8,
    marginBottom: 24,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },

  cardTitle: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },

  status: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 20,
  },

  body: {
    color: colors.text,
    lineHeight: 24,
  },

  primaryButton: {
    backgroundColor: colors.secondary,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 12,
  },

  primaryText: {
    color: colors.primary,
    fontWeight: "700",
  },

  secondaryButton: {
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 15,
    borderRadius: 14,
    alignItems: "center",
  },

  secondaryText: {
    color: colors.text,
    fontWeight: "600",
  },
});
