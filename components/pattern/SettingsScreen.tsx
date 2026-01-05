import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import AppHeader from "@/components/common/AppHeader";
import { CommonStyles } from "@/components/common/CommonStyles";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
];

const SettingsScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;

  return (
    <View style={styles.outerContainer}>
      <AppHeader />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        <Text style={CommonStyles.sectionTitle}>{t("language")}</Text>
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
        {/* Theme and export options will go here */}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: "#f5f3ff",
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 24,
    justifyContent: "flex-start",
  },
  languageRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  langButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  langButtonSelected: {
    backgroundColor: "#6366f1",
    borderColor: "#6366f1",
  },
  langButtonText: {
    color: "#3730a3",
    fontWeight: "bold",
  },
  langButtonTextSelected: {
    color: "#fff",
  },
});

export default SettingsScreen;
