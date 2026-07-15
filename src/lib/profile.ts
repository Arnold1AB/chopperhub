import { auth, db } from "@/lib/firebase";
import {
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

export type UserProfile = {
  id: string;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  full_name?: string | null;
  phone?: string | null;
  profession?: string | null;
  food_preference?: string | null;
  reminders_enabled?: boolean;
  trial_started_at?: string | null;
  subscription_status?: "trialing" | "active" | "expired" | string;
  subscription_plan?: string | null;
  subscription_expires_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type ProfileInput = {
  first_name?: string;
  last_name?: string;
  full_name?: string;
  phone?: string;
  profession?: string;
  food_preference?: string;
  reminders_enabled?: boolean;
  subscription_status?: string;
  subscription_plan?: string | null;
  subscription_expires_at?: string | null;
  trial_started_at?: string;
};

export const getCurrentUser = () => auth.currentUser;

export const requireCurrentUser = () => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Please sign in to continue.");
  }

  return user;
};

const profileRef = (uid: string) => doc(db, "users", uid);

export async function createUserProfile(
  uid: string,
  email: string | null,
  input: ProfileInput,
) {
  const now = new Date().toISOString();

  await setDoc(
    profileRef(uid),
    {
      id: uid,
      email,
      first_name: input.first_name ?? "",
      last_name: input.last_name ?? "",
      full_name: input.full_name ?? "",
      phone: input.phone ?? "",
      profession: input.profession ?? "",
      food_preference: input.food_preference ?? "",
      reminders_enabled: input.reminders_enabled ?? false,
      trial_started_at: input.trial_started_at ?? now,
      subscription_status: input.subscription_status ?? "trialing",
      subscription_plan: input.subscription_plan ?? null,
      subscription_expires_at: input.subscription_expires_at ?? null,
      created_at: now,
      updated_at: now,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function getUserProfile(uid = auth.currentUser?.uid) {
  if (!uid) return null;

  const snapshot = await getDoc(profileRef(uid));

  if (!snapshot.exists()) return null;

  return snapshot.data() as UserProfile;
}

export async function updateUserProfile(input: ProfileInput) {
  const user = requireCurrentUser();
  const now = new Date().toISOString();

  await setDoc(
    profileRef(user.uid),
    {
      ...input,
      id: user.uid,
      email: user.email,
      updated_at: now,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function setReminderPreference(enabled: boolean) {
  await updateUserProfile({ reminders_enabled: enabled });
}

export async function updateSubscriptionState(input: ProfileInput) {
  const user = requireCurrentUser();

  await updateDoc(profileRef(user.uid), {
    ...input,
    updated_at: new Date().toISOString(),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteUserProfile(uid = auth.currentUser?.uid) {
  if (!uid) return;

  await deleteDoc(profileRef(uid));
}
