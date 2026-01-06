import "./i18n";
import PatternListManager from "@/components/pattern/PatternListManager";
import SettingsScreen from "@/components/pattern/SettingsScreen";
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItemList,
} from "@react-navigation/drawer";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { ThemeProvider } from "@/components/common/ThemeContext";

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { t } = useTranslation();
  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ flex: 1 }}
      style={{ width: 180 }}
    >
      <View style={styles.drawerHeaderContainer}>
        <Text style={styles.drawerHeader}>{t("menu")}</Text>
      </View>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

export default function Index() {
  const { t } = useTranslation();
  return (
    <ThemeProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: "#f5f3ff" }}>
        <Drawer.Navigator
          initialRouteName="Patterns"
          screenOptions={{
            drawerPosition: "right",
            headerShown: false,
            swipeEdgeWidth: 40,
            drawerStyle: { width: 180 },
          }}
          drawerContent={(props) => <CustomDrawerContent {...props} />}
        >
          <Drawer.Screen
            name="Patterns"
            component={PatternListManager}
            options={{ title: t("patternTab") }}
          />
          <Drawer.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: t("settingsTab") }}
          />
        </Drawer.Navigator>
      </SafeAreaView>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  drawerHeaderContainer: {
    paddingBottom: 16,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  drawerHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#6366f1",
    letterSpacing: 1,
  },
});
