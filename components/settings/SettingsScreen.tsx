import React, { useState } from "react";
import {
  ActivityIndicator,
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
import {
  getCommonListContainer,
  getCommonStyles,
} from "@/components/common/CommonStyles";
import { ThemeType, useThemeContext } from "@/components/common/ThemeContext";
import { getPalette, PaletteColor } from "@/components/common/ColorPalette";
import {
  loadPatterns,
  savePatterns,
  savePatternsAsync,
} from "@/components/pattern/PatternStorage";
import { exportPatterns } from "@/components/pattern/data/exportPatterns";
import { importPatterns } from "@/components/pattern/data/ImportPatterns";

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
  const [isLoading, setIsLoading] = useState(false);

  const themeOptions = [
    { value: "system", label: t("themeSystem") },
    { value: "light", label: t("themeLight") },
    { value: "dark", label: t("themeDark") },
  ];

  const styles = getStyles(palette);

  const handleExportPatterns = async () => {
    setIsLoading(true);
    try {
      const patterns = await loadPatterns();
      if (!patterns || patterns.length === 0) {
        Alert.alert("Export Patterns", "No patterns to export");
        return;
      }

      const result = await exportPatterns(patterns);
      Alert.alert(
        result.success ? "Export Successful" : "Export Failed",
        result.message,
      );
    } catch (error) {
      Alert.alert(
        "Export Failed",
        `An error occurred: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportPatterns = async () => {
    setIsLoading(true);
    try {
      const result = await importPatterns();

      if (!result.success) {
        if (result.message !== "Import cancelled") {
          Alert.alert("Import Failed", result.message);
        }
        return;
      }

      if (result.patterns && result.patterns.length > 0) {
        // Get existing patterns
        const existingPatterns = (await loadPatterns()) || [];

        // Ask user if they want to merge or replace
        Alert.alert(
          "Import Patterns",
          `Found ${result.patterns.length} pattern(s) to import. How would you like to proceed?`,
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Replace All",
              style: "destructive",
              onPress: async () => {
                await savePatterns(result.patterns!);
                Alert.alert("Import Successful", result.message);
              },
            },
            {
              text: "Merge",
              onPress: async () => {
                // Find the highest existing ID
                const maxId = existingPatterns.reduce(
                  (max, p) => Math.max(max, p.id),
                  0,
                );

                // Reassign IDs to imported patterns to avoid conflicts
                const remappedPatterns = result.patterns!.map((p, index) => ({
                  ...p,
                  id: maxId + index + 1,
                  // Update prerequisites to point to new IDs if needed
                  prerequisites: p.prerequisites.map((prereqId) => {
                    const prereqIndex = result.patterns!.findIndex(
                      (pat) => pat.id === prereqId,
                    );
                    return prereqIndex >= 0
                      ? maxId + prereqIndex + 1
                      : prereqId;
                  }),
                }));

                const mergedPatterns = [
                  ...existingPatterns,
                  ...remappedPatterns,
                ];
                await savePatternsAsync(mergedPatterns);
                Alert.alert(
                  "Import Successful",
                  `Merged ${result.patterns!.length} pattern(s) with existing ${existingPatterns.length} pattern(s)`,
                );
              },
            },
          ],
        );
      }
    } catch (error) {
      Alert.alert(
        "Import Failed",
        `An error occurred: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

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
              onPress={handleExportPatterns}
              color={palette[PaletteColor.Primary]}
            />
            <Button
              title={t("importPatterns")}
              onPress={handleImportPatterns}
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
