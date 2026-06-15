import { globalStyles } from "@/styles/global";
import { Text, View } from "react-native";

export default function HomeHeader() {
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <View>
      <Text style={globalStyles.date}>{currentDate}</Text>
    </View>
  );
}
