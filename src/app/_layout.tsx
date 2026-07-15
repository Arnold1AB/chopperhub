import { auth } from "@/lib/firebase";
import Constants from "expo-constants";
import { Stack, usePathname } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { PostHogProvider, usePostHog } from "posthog-react-native";

SplashScreen.preventAutoHideAsync().catch(() => {
  // The native splash may already be hidden during fast refresh.
});

const extra = Constants.expoConfig?.extra as
  | Record<string, string | undefined>
  | undefined;

const posthogKey =
  process.env.EXPO_PUBLIC_POSTHOG_KEY ?? extra?.EXPO_PUBLIC_POSTHOG_KEY;
const posthogHost =
  process.env.EXPO_PUBLIC_POSTHOG_HOST ??
  extra?.EXPO_PUBLIC_POSTHOG_HOST ??
  "https://us.i.posthog.com";

function AppStack() {
  return <Stack screenOptions={{ headerShown: false }} />;
}

function AnalyticsTracker() {
  const pathname = usePathname();
  const posthog = usePostHog();
  const previousPathname = useRef<string | null>(null);

  useEffect(() => {
    if (previousPathname.current === pathname) return;

    previousPathname.current = pathname;
    posthog.screen(pathname);
  }, [pathname, posthog]);

  useEffect(() => {
    posthog.capture("app opened");

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        posthog.identify(user.uid);
        return;
      }

      posthog.reset();
    });

    return unsubscribe;
  }, [posthog]);

  return null;
}

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const prepare = async () => {
      try {
        await auth.authStateReady();
      } catch (error) {
        console.log("SESSION RESTORE ERROR:", error);
      } finally {
        setReady(true);
        await SplashScreen.hideAsync().catch(() => {});
      }
    };

    prepare();

    const unsubscribe = onAuthStateChanged(auth, () => {
      setReady(true);
    });

    return unsubscribe;
  }, []);

  if (!ready) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#0F172A",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator color="#35A7FF" />
      </View>
    );
  }

  if (!posthogKey) {
    return <AppStack />;
  }

  return (
    <PostHogProvider
      apiKey={posthogKey}
      options={{
        host: posthogHost,
        captureAppLifecycleEvents: true,
      }}
      autocapture={{
        captureScreens: false,
        captureTouches: true,
      }}
    >
      <AnalyticsTracker />
      <AppStack />
    </PostHogProvider>
  );
}
