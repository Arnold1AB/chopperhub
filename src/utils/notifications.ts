import Constants, { ExecutionEnvironment } from "expo-constants";
import { Platform } from "react-native";
import type * as ExpoNotifications from "expo-notifications";

const ANDROID_CHANNEL_ID = "meal-reminders";

const isAndroidExpoGo = () =>
  Platform.OS === "android" &&
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient &&
  Constants.expoVersion !== null;

const loadNotifications = async (): Promise<typeof ExpoNotifications | null> => {
  try {
    return await import("expo-notifications");
  } catch (error) {
    console.warn("Notifications are unavailable in this runtime:", error);
    return null;
  }
};

const ensureAndroidChannel = async (
  Notifications: typeof ExpoNotifications,
): Promise<void> => {
  if (Platform.OS !== "android") return;

  await Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
    name: "Meal reminders",
    importance: Notifications.AndroidImportance.DEFAULT,
  });
};

const configureNotificationHandler = (
  Notifications: typeof ExpoNotifications,
) => {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
};

export const areNotificationsAvailable = () => !isAndroidExpoGo();

export const getNotificationsUnavailableMessage = () =>
  isAndroidExpoGo()
    ? "Android push notification support is not available in Expo Go for SDK 55. Use a development build to test notifications on this emulator."
    : "Notifications are not available in this runtime.";

export const getPermissionStatus = async (): Promise<boolean> => {
  if (!areNotificationsAvailable()) return false;

  const Notifications = await loadNotifications();
  if (!Notifications) return false;

  try {
    const settings = await Notifications.getPermissionsAsync();
    return settings.granted;
  } catch (error) {
    console.warn("Unable to check notification permissions:", error);
    return false;
  }
};

export const requestPermissions = async (): Promise<boolean> => {
  if (!areNotificationsAvailable()) return false;

  const Notifications = await loadNotifications();
  if (!Notifications) return false;

  try {
    await ensureAndroidChannel(Notifications);

    const settings = await Notifications.requestPermissionsAsync();
    return settings.granted;
  } catch (error) {
    console.warn("Unable to request notification permissions:", error);
    return false;
  }
};

export const scheduleMealReminders = async (): Promise<void> => {
  if (!areNotificationsAvailable()) return;

  const Notifications = await loadNotifications();
  if (!Notifications) return;

  configureNotificationHandler(Notifications);
  await ensureAndroidChannel(Notifications);
  await Notifications.cancelAllScheduledNotificationsAsync();

  const reminders = [
    {
      hour: 8,
      minute: 0,
      title: "Plan your first meal",
      body: "Start the day with one meal logged or planned.",
    },
    {
      hour: 12,
      minute: 30,
      title: "Log lunch",
      body: "Add your lunch while the details are still fresh.",
    },
    {
      hour: 15,
      minute: 30,
      title: "Drink more water",
      body: "Check your water intake and add a quick update.",
    },
    {
      hour: 19,
      minute: 30,
      title: "Review your tracker",
      body: "Open Tracker, review today, and plan the next meal.",
    },
  ];

  await Promise.all(
    reminders.map((reminder) =>
      Notifications.scheduleNotificationAsync({
        content: {
          title: reminder.title,
          body: reminder.body,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: reminder.hour,
          minute: reminder.minute,
          channelId: ANDROID_CHANNEL_ID,
        },
      }),
    ),
  );
};

export const cancelMealReminders = async (): Promise<void> => {
  const Notifications = await loadNotifications();
  if (!Notifications) return;

  await Notifications.cancelAllScheduledNotificationsAsync();
};
