import React, { useState } from "react";
import {
  ActivityIndicator,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTranslation } from "react-i18next";
import AppHeader from "@/components/common/AppHeader";
import PageContainer from "@/components/common/PageContainer";
import {
  getCommonListContainer,
  getCommonStyles,
} from "@/components/common/CommonStyles";
import { ThemeType, useThemeContext } from "@/components/common/ThemeContext";
import { getPalette, PaletteColor } from "@/components/common/ColorPalette";
import { handleExportPatterns } from "@/components/pattern/data/exportPatterns";
import { handleImportPatterns } from "@/components/pattern/data/ImportPatterns";
import { LANGUAGES } from "@/components/settings/types/Languages";

const SettingsScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLang = i18n.language;
  const { theme, setTheme, colorScheme } = useThemeContext();
  const commonStyles = getCommonStyles(colorScheme);
  const palette = getPalette(colorScheme);
  const [isLoading, setIsLoading] = useState(false);

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
      <ScrollView
        style={{
          flex: 1,
          ...getCommonListContainer(palette),
        }}
      >
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
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator
              size="large"
              color={palette[PaletteColor.Primary]}
            />
          </View>
        ) : (
          <View style={[styles.themeRow, { marginLeft: 8 }]}>
            <Button
              title={t("exportPatterns")}
              onPress={handleExportPatterns.bind(this, setIsLoading)}
              color={palette[PaletteColor.Primary]}
            />
            <Button
              title={t("importPatterns")}
              onPress={handleImportPatterns.bind(this, setIsLoading)}
              color={palette[PaletteColor.Primary]}
            />
          </View>
        )}
      </ScrollView>
    </PageContainer>
  );
};

const getStyles = (palette: Record<PaletteColor, string>) =>
  StyleSheet.create({
    loadingContainer: {
      paddingVertical: 20,
      alignItems: "center",
      justifyContent: "center",
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
