import { StyleSheet } from "react-native";

export const getCommonStyles = (colorScheme: "light" | "dark") =>
  StyleSheet.create({
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: colorScheme === "dark" ? "#f1f5f9" : "#1e293b",
    },
    sectionHeaderRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginTop: 16,
      marginBottom: 8,
      minHeight: 39, // Ensures consistent height with + button
    },
  });
