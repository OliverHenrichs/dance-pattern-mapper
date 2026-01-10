import React from "react";
import {
  Alert,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import AppHeader from "@/components/common/AppHeader";
import PageContainer from "@/components/common/PageContainer";
import { getCommonStyles } from "@/components/common/CommonStyles";
import { ThemeType, useThemeContext } from "@/components/common/ThemeContext";
import { getPalette, PaletteColor } from "@/components/common/ColorPalette";

const LANGUAGES = [
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
];

const SettingsScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const { theme, setTheme, colorScheme } = useThemeContext();
  const commonStyles = getCommonStyles(colorScheme);
  const palette = getPalette(colorScheme);

  const themeOptions = [
    { value: "system", label: t("themeSystem") },
    { value: "light", label: t("themeLight") },
    { value: "dark", label: t("themeDark") },
  ];

  const styles = getStyles(palette);

  return (
    <PageContainer
      style={{ backgroundColor: palette[PaletteColor.Background] }}
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
        <View style={commonStyles.sectionHeaderRow}>
          <Text style={commonStyles.sectionTitle}>{t("serialization")}</Text>
        </View>
        <View style={[styles.themeRow, { marginLeft: 8 }]}>
          <Button
            title={t("exportPatterns")}
            onPress={handleExportPatterns}
            color={palette[PaletteColor.Primary]}
          />
          <Button
            title={t("importPatterns")}
            onPress={handleImportPatterns}
            color={palette[PaletteColor.Primary]}
          />
        </View>
      </ScrollView>
    </PageContainer>
  );
};

/**
 * Export format:
 * - ZIP file containing:
 *   - patterns.json: Array of WCSPattern objects (with videoRefs: [{type, value}])
 *   - Local video files referenced in videoRefs (if accessible)
 *   - URLs are included in JSON only, not downloaded
 *
 * If a local video file is missing/inaccessible, it is skipped and a warning is shown.
 */
const handleExportPatterns = async () => {
  Alert.alert("Export Patterns", "This feature is not yet implemented.");
};
/**
 * Export format:
 * - ZIP file containing:
 *   - patterns.json: Array of WCSPattern objects (with videoRefs: [{type, value}])
 *   - Local video files referenced in videoRefs (if accessible)
 *   - URLs are included in JSON only, not downloaded
 *
 * If a local video file is missing/inaccessible, it is skipped and a warning is shown.
 */
const handleImportPatterns = async () => {
  Alert.alert("Export Patterns", "This feature is not yet implemented.");
};

const getStyles = (palette: Record<PaletteColor, string>) =>
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
      backgroundColor: palette[PaletteColor.Surface],
      borderWidth: 1,
      borderColor: palette[PaletteColor.Border],
    },
    langButtonSelected: {
      backgroundColor: palette[PaletteColor.Primary],
      borderColor: palette[PaletteColor.Primary],
    },
    langButtonText: {
      color: palette[PaletteColor.PrimaryText],
      fontWeight: "bold",
    },
    langButtonTextSelected: {
      color: palette[PaletteColor.Surface],
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
      backgroundColor: palette[PaletteColor.Surface],
      borderWidth: 1,
      borderColor: palette[PaletteColor.Border],
    },
    themeButtonSelected: {
      backgroundColor: palette[PaletteColor.Primary],
      borderColor: palette[PaletteColor.Primary],
    },
    themeButtonText: {
      color: palette[PaletteColor.PrimaryText],
      fontWeight: "bold",
    },
    themeButtonTextSelected: {
      color: palette[PaletteColor.Surface],
    },
  });

export default SettingsScreen;
