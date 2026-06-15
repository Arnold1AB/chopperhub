import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export const requestPermissions = async (): Promise<boolean> => {
  const { status } = await Notifications.requestPermissionsAsync();

  return status === "granted";
};

export const scheduleMealReminders = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();

  // Lunch Reminder
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "ChopperHub",
      body: "It's lunchtime. Log your meal and stay on track.",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 12,
      minute: 0,
    },
  });

  // Dinner Reminder
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "ChopperHub",
      body: "Finish the day strong. Log your dinner.",
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: 18,
      minute: 0,
    },
  });
};

export const cancelMealReminders = async (): Promise<void> => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};
