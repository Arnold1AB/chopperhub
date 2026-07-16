import { colors, radii, spacing, typography } from "@/styles/global";
import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps, ReactNode } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

type IconName = ComponentProps<typeof Ionicons>["name"];

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

export function Screen({
  children,
  scroll = true,
  style,
  contentStyle,
}: ScreenProps) {
  if (!scroll) {
    return <View style={[styles.screen, style]}>{children}</View>;
  }

  return (
    <ScrollView
      style={[styles.screen, style]}
      contentContainerStyle={[styles.scrollContent, contentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

type CardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

type AppButtonProps = {
  title: string;
  onPress: () => void;
  icon?: IconName;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function AppButton({
  title,
  onPress,
  icon,
  variant = "primary",
  disabled = false,
  loading = false,
  style,
}: AppButtonProps) {
  const isDisabled = disabled || loading;
  const textStyle = [
    styles.buttonText,
    variant === "secondary" && styles.secondaryButtonText,
    variant === "ghost" && styles.ghostButtonText,
    variant === "danger" && styles.dangerButtonText,
  ];

  return (
    <TouchableOpacity
      activeOpacity={0.86}
      disabled={isDisabled}
      onPress={onPress}
      style={[
        styles.button,
        styles[`${variant}Button`],
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? colors.primary : colors.secondary} />
      ) : (
        <>
          {icon && (
            <Ionicons
              name={icon}
              size={18}
              color={variant === "primary" ? colors.primary : colors.secondary}
            />
          )}
          <Text style={textStyle}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
}

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress: () => void;
  icon?: IconName;
};

export function Chip({ label, selected = false, onPress, icon }: ChipProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.86}
      onPress={onPress}
      style={[styles.chip, selected && styles.chipSelected]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={15}
          color={selected ? colors.primary : colors.textMuted}
        />
      )}
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

type SegmentedControlProps<T extends string> = {
  options: { label: string; value: T; icon?: IconName }[];
  value: T;
  onChange: (value: T) => void;
  style?: StyleProp<ViewStyle>;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  style,
}: SegmentedControlProps<T>) {
  return (
    <View style={[styles.segmentedControl, style]}>
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <TouchableOpacity
            key={option.value}
            activeOpacity={0.86}
            onPress={() => onChange(option.value)}
            style={[styles.segment, selected && styles.segmentSelected]}
          >
            {option.icon && (
              <Ionicons
                name={option.icon}
                size={15}
                color={selected ? colors.primary : colors.textMuted}
              />
            )}
            <Text
              style={[styles.segmentText, selected && styles.segmentTextSelected]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

type StatTileProps = {
  label: string;
  value: string | number;
  icon?: IconName;
  tone?: "default" | "success" | "warning";
};

export function StatTile({ label, value, icon, tone = "default" }: StatTileProps) {
  return (
    <View style={styles.statTile}>
      <View style={styles.statTopRow}>
        {icon && (
          <Ionicons
            name={icon}
            size={18}
            color={tone === "success" ? colors.success : tone === "warning" ? colors.warning : colors.secondary}
          />
        )}
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

type EmptyStateProps = {
  title: string;
  body: string;
  icon?: IconName;
  action?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function EmptyState({ title, body, icon, action, style }: EmptyStateProps) {
  return (
    <Card style={[styles.emptyState, style]}>
      {icon && (
        <View style={styles.emptyIcon}>
          <Ionicons name={icon} size={22} color={colors.secondary} />
        </View>
      )}
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
      {action && <View style={styles.emptyAction}>{action}</View>}
    </Card>
  );
}

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function SectionHeader({
  title,
  subtitle,
  action,
  style,
}: SectionHeaderProps) {
  return (
    <View style={[styles.sectionHeader, style]}>
      <View style={styles.sectionCopy}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
      </View>
      {action}
    </View>
  );
}

type InlineTextProps = {
  children: ReactNode;
  muted?: boolean;
  style?: StyleProp<TextStyle>;
};

export function BodyText({ children, muted = false, style }: InlineTextProps) {
  return (
    <Text style={[muted ? styles.mutedText : styles.bodyText, style]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: 60,
    paddingHorizontal: spacing["2xl"],
  },
  scrollContent: {
    paddingBottom: 120,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
  },
  button: {
    minHeight: 52,
    borderRadius: radii.lg,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  primaryButton: {
    backgroundColor: colors.secondary,
  },
  secondaryButton: {
    backgroundColor: colors.surfaceElevated,
    borderWidth: 1,
    borderColor: colors.border,
  },
  ghostButton: {
    backgroundColor: "transparent",
  },
  dangerButton: {
    backgroundColor: "rgba(239, 68, 68, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.35)",
  },
  disabled: {
    opacity: 0.55,
  },
  buttonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "800",
  },
  secondaryButtonText: {
    color: colors.primary,
  },
  ghostButtonText: {
    color: colors.secondary,
  },
  dangerButtonText: {
    color: colors.danger,
  },
  chip: {
    minHeight: 40,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  chipSelected: {
    backgroundColor: "rgba(53, 167, 255, 0.18)",
    borderColor: colors.secondary,
  },
  chipText: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: "800",
  },
  chipTextSelected: {
    color: colors.primary,
  },
  segmentedControl: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    padding: spacing.xs,
    gap: spacing.xs,
  },
  segment: {
    flex: 1,
    minHeight: 42,
    borderRadius: radii.md,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  segmentSelected: {
    backgroundColor: colors.surfaceElevated,
  },
  segmentText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: "800",
  },
  segmentTextSelected: {
    color: colors.primary,
  },
  statTile: {
    flex: 1,
    minHeight: 96,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    justifyContent: "space-between",
  },
  statTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  statValue: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: "800",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing["3xl"],
  },
  emptyIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceElevated,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.sectionTitle,
    textAlign: "center",
  },
  emptyBody: {
    ...typography.muted,
    textAlign: "center",
    marginTop: spacing.sm,
  },
  emptyAction: {
    marginTop: spacing.lg,
    alignSelf: "stretch",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.lg,
  },
  sectionCopy: {
    flex: 1,
  },
  sectionTitle: {
    ...typography.sectionTitle,
  },
  sectionSubtitle: {
    ...typography.muted,
    marginTop: spacing.xs,
  },
  bodyText: {
    ...typography.body,
  },
  mutedText: {
    ...typography.muted,
  },
});
