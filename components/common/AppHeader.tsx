import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";
import { DrawerActions, useNavigation } from "@react-navigation/native";
import { useThemeContext } from "@/components/common/ThemeContext";

const AppHeader: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const { colorScheme } = useThemeContext();
  const iconColor = colorScheme === "dark" ? "#f1f5f9" : "#6366f1";
  const textColor = colorScheme === "dark" ? "#f1f5f9" : "#3730a3";

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Icon
          name="dance-ballroom"
          size={32}
          color={iconColor}
          style={styles.headerIcon}
        />
        <Text style={[styles.headerTitle, { fontSize: 18, color: textColor }]}>
          {t("appTitle")}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        style={styles.hamburgerButton}
        accessibilityLabel={t("openMenu")}
      >
        <Icon name="menu" size={28} color={iconColor} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 0,
    marginLeft: 8,
    justifyContent: "space-between",
    backgroundColor: "#f5f3ff", // Ensure consistent background
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  headerIcon: { fontSize: 32, marginRight: 8 },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#3730a3" },
  hamburgerButton: {
    marginLeft: 12,
    padding: 8,
  },
});

export default AppHeader;
