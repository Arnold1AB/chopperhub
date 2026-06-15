import { colors } from "@/styles/global";
import { StyleSheet, Text, View } from "react-native";

type ChopperCardProps = {
  label: string;
  value: string;
  goal: string;
  color: string;
};

export default function ChopperCard({
  label,
  value,
  goal,
  color,
}: ChopperCardProps) {
  return (
    <View style={[styles.card, { borderTopColor: color }]}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.goal}> / {goal}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",

    backgroundColor: colors.surface,

    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 16,

    borderTopWidth: 5,

    borderWidth: 1,
    borderColor: colors.border,

    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: {
      width: 0,
      height: 5,
    },

    elevation: 4,
  },

  label: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,

    textTransform: "uppercase",

    color: colors.textMuted,
  },

  valueRow: {
    flexDirection: "row",
    alignItems: "flex-end",

    marginTop: 12,
  },

  value: {
    fontSize: 30,
    fontWeight: "800",

    color: colors.primary,
  },

  goal: {
    fontSize: 14,
    fontWeight: "500",

    color: colors.textMuted,

    marginBottom: 4,
    marginLeft: 2,
  },
});
