import "./i18n";
import PatternListManager from "@/components/pattern/PatternListManager";
import SettingsScreen from "@/components/pattern/SettingsScreen";
import { createDrawerNavigator } from "@react-navigation/drawer";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

const Drawer = createDrawerNavigator();

export default function Index() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f3ff" }}>
      <Drawer.Navigator
        initialRouteName="Patterns"
        screenOptions={{
          drawerPosition: "right",
          headerShown: false,
          swipeEdgeWidth: 40,
        }}
      >
        <Drawer.Screen name="Patterns" component={PatternListManager} />
        <Drawer.Screen name="Settings" component={SettingsScreen} />
      </Drawer.Navigator>
    </SafeAreaView>
  );
}
