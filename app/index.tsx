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
import {
  ThemeProvider,
  useThemeContext,
} from "@/components/common/ThemeContext";
import { getPalette, PaletteColor } from "@/components/common/ColorPalette";

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { t } = useTranslation();
  const { colorScheme } = useThemeContext();
  const palette = getPalette(colorScheme);
  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{
        flex: 1,
        backgroundColor: palette[PaletteColor.Background],
      }}
      style={{ width: 180, backgroundColor: palette[PaletteColor.Background] }}
    >
      <View
        style={[
          styles.drawerHeaderContainer,
          { backgroundColor: palette[PaletteColor.Background] },
        ]}
      >
        <Text
          style={[
            styles.drawerHeader,
            { color: palette[PaletteColor.Primary] },
          ]}
        >
          {t("menu")}
        </Text>
      </View>
      <DrawerItemList {...props} />
    </DrawerContentScrollView>
  );
}

export default function Index() {
  const { t } = useTranslation();
  const { colorScheme } = useThemeContext();
  const palette = getPalette(colorScheme);
  return (
    <ThemeProvider>
      <View
        style={{ flex: 1, backgroundColor: palette[PaletteColor.Background] }}
      >
        <SafeAreaView
          style={{ flex: 1, backgroundColor: palette[PaletteColor.Background] }}
        >
          <Drawer.Navigator
            initialRouteName="Patterns"
            screenOptions={{
              drawerPosition: "right",
              headerShown: false,
              swipeEdgeWidth: 40,
              drawerStyle: {
                width: 180,
                backgroundColor: palette[PaletteColor.Background],
              },
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
      </View>
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
