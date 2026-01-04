import PatternListManager from "@/components/pattern/PatternListManager";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Index() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f3ff" }}>
      <PatternListManager />;
    </SafeAreaView>
  );
}
