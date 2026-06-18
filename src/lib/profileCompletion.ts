export type ProfileCompletionInput = {
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  profession?: string | null;
  food_preference?: string | null;
};

export const profileCompletionFields = [
  { key: "first_name", label: "First name" },
  { key: "last_name", label: "Last name" },
  { key: "phone", label: "Phone" },
  { key: "profession", label: "Profession" },
  { key: "food_preference", label: "Food preference" },
] as const;

export function getProfileCompletion(profile?: ProfileCompletionInput | null) {
  const completed = profileCompletionFields.filter(({ key }) => {
    const value = profile?.[key];
    return typeof value === "string" && value.trim().length > 0;
  });

  const missing = profileCompletionFields.filter(
    (field) =>
      !completed.some((completedField) => completedField.key === field.key),
  );

  const percentage = Math.round(
    (completed.length / profileCompletionFields.length) * 100,
  );

  return {
    completed: completed.length,
    total: profileCompletionFields.length,
    missing,
    percentage,
    complete: percentage === 100,
  };
}
