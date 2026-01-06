import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import AppHeader from "@/components/common/AppHeader";
import PageContainer from "@/components/common/PageContainer";
import { getCommonStyles } from "@/components/common/CommonStyles";
import { ThemeType, useThemeContext } from "@/components/common/ThemeContext";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
];

const SettingsScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const { theme, setTheme, colorScheme } = useThemeContext();
  const commonStyles = getCommonStyles(colorScheme);

  const themeOptions = [
    { value: "system", label: t("themeSystem") },
    { value: "light", label: t("themeLight") },
    { value: "dark", label: t("themeDark") },
  ];

  const getStyles = (colorScheme: "light" | "dark") =>
    StyleSheet.create({
      languageRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 24,
      },
      langButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: colorScheme === "dark" ? "#27272a" : "#f3f4f6",
        borderWidth: 1,
        borderColor: colorScheme === "dark" ? "#52525b" : "#d1d5db",
      },
      langButtonSelected: {
        backgroundColor: "#6366f1",
        borderColor: "#6366f1",
      },
      langButtonText: {
        color: colorScheme === "dark" ? "#f1f5f9" : "#3730a3",
        fontWeight: "bold",
      },
      langButtonTextSelected: {
        color: "#fff",
      },
      themeRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 24,
      },
      themeButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: colorScheme === "dark" ? "#27272a" : "#f3f4f6",
        borderWidth: 1,
        borderColor: colorScheme === "dark" ? "#52525b" : "#d1d5db",
      },
      themeButtonSelected: {
        backgroundColor: "#6366f1",
        borderColor: "#6366f1",
      },
      themeButtonText: {
        color: colorScheme === "dark" ? "#f1f5f9" : "#3730a3",
        fontWeight: "bold",
      },
      themeButtonTextSelected: {
        color: "#fff",
      },
    });

  const styles = getStyles(colorScheme);

  return (
    <PageContainer
      style={{ backgroundColor: colorScheme === "dark" ? "#18181b" : "#fff" }}
    >
      <AppHeader />
      <ScrollView style={{ flex: 1 }}>
        <View style={commonStyles.sectionHeaderRow}>
          <Text style={commonStyles.sectionTitle}>{t("language")}</Text>
        </View>
        <View style={styles.languageRow}>
          {LANGUAGES.map((lang) => (
            <View
              key={lang.code}
              style={[
                styles.langButton,
                currentLang === lang.code && styles.langButtonSelected,
              ]}
            >
              <Text
                style={[
                  styles.langButtonText,
                  currentLang === lang.code && styles.langButtonTextSelected,
                ]}
                onPress={() => i18n.changeLanguage(lang.code)}
              >
                {lang.label}
              </Text>
            </View>
          ))}
        </View>
        <View style={commonStyles.sectionHeaderRow}>
          <Text style={commonStyles.sectionTitle}>{t("theme")}</Text>
        </View>
        <View style={styles.themeRow}>
          {themeOptions.map((opt) => (
            <View
              key={opt.value}
              style={[
                styles.themeButton,
                theme === opt.value && styles.themeButtonSelected,
              ]}
            >
              <Text
                style={[
                  styles.themeButtonText,
                  theme === opt.value && styles.themeButtonTextSelected,
                ]}
                onPress={() => setTheme(opt.value as ThemeType)}
              >
                {opt.label}
              </Text>
            </View>
          ))}
        </View>
        {/* Export options will go here */}
      </ScrollView>
    </PageContainer>
  );
};

export default SettingsScreen;
