import React, { useCallback, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { WCSPattern } from "@/components/pattern/types/WCSPattern";
import { loadPatterns } from "@/components/pattern/PatternStorage";
import { foundationalWCSPatterns } from "@/components/pattern/data/DefaultWCSPatterns";
import AppHeader from "@/components/common/AppHeader";
import PageContainer from "@/components/common/PageContainer";
import { useThemeContext } from "@/components/common/ThemeContext";
import { getPalette, PaletteColor } from "@/components/common/ColorPalette";
import { useTranslation } from "react-i18next";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import TimelineView from "./graph/TimelineView";
import NetworkGraphView from "./graph/NetworkGraphView";
import Legend from "./graph/Legend";
import PatternDetails from "./PatternDetails";

type ViewMode = "timeline" | "graph";

const PatternGraphScreen: React.FC = () => {
  const { t } = useTranslation();
  const { colorScheme } = useThemeContext();
  const palette = getPalette(colorScheme);
  const styles = getStyles(palette);

  const [patterns, setPatterns] = useState<WCSPattern[]>(
    foundationalWCSPatterns,
  );
  const [viewMode, setViewMode] = useState<ViewMode>("timeline");
  const [selectedPattern, setSelectedPattern] = useState<
    WCSPattern | undefined
  >(undefined);
  const [resetKey, setResetKey] = useState(0);

  // Load patterns from storage on mount and when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      const fetchPatterns = async () => {
        try {
          const stored = await loadPatterns();
          if (stored) setPatterns(stored);
        } catch {
          // fallback to defaults
        }
      };
      fetchPatterns();
    }, []),
  );

  const handleToggleView = () => {
    setViewMode((prev) => (prev === "timeline" ? "graph" : "timeline"));
    // Reset zoom/pan by incrementing key to force remount
    setResetKey((prev) => prev + 1);
  };

  const handleNodeTap = (pattern: WCSPattern) => {
    setSelectedPattern(pattern);
  };

  const handleCloseModal = () => {
    setSelectedPattern(undefined);
  };

  return (
    <View style={{ flex: 1 }}>
      <PageContainer
        style={{ backgroundColor: palette[PaletteColor.Background] }}
      >
        <AppHeader />

        {/* Control Bar */}
        <View style={styles.controlBar}>
          <Text style={styles.titleText}>
            {viewMode === "timeline" ? t("timelineView") : t("graphView")}
          </Text>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.controlButton}
              onPress={handleToggleView}
              accessibilityLabel={t("toggleView")}
            >
              <Icon
                name={viewMode === "timeline" ? "graph" : "timeline"}
                size={20}
                color={palette[PaletteColor.Surface]}
              />
              <Text style={styles.buttonText}>{t("toggleView")}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* View Container */}
        <View style={styles.viewContainer}>
          {viewMode === "timeline" ? (
            <TimelineView
              key={`timeline-${resetKey}`}
              patterns={patterns}
              palette={palette}
              onNodeTap={handleNodeTap}
            />
          ) : (
            <NetworkGraphView
              key={`graph-${resetKey}`}
              patterns={patterns}
              palette={palette}
              onNodeTap={handleNodeTap}
            />
          )}
        </View>

        {/* Legend */}
        <Legend palette={palette} />

        {/* Pattern Details Modal */}
        <Modal
          visible={selectedPattern !== undefined}
          animationType="fade"
          transparent={true}
          onRequestClose={handleCloseModal}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {selectedPattern?.name || ""}
                </Text>
                <TouchableOpacity
                  onPress={handleCloseModal}
                  style={styles.closeButton}
                >
                  <Icon
                    name="close"
                    size={24}
                    color={palette[PaletteColor.PrimaryText]}
                  />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.modalScroll}>
                {selectedPattern && (
                  <PatternDetails
                    selectedPattern={selectedPattern}
                    patterns={patterns}
                    palette={palette}
                  />
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </PageContainer>
    </View>
  );
};

const getStyles = (palette: Record<PaletteColor, string>) =>
  StyleSheet.create({
    controlBar: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 2,
      paddingVertical: 2,
      borderBottomWidth: 2,
      borderBottomColor: palette[PaletteColor.Primary],
    },
    titleText: {
      fontSize: 18,
      fontWeight: "bold",
      color: palette[PaletteColor.PrimaryText],
    },
    buttonGroup: {
      flexDirection: "row",
      gap: 8,
    },
    controlButton: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: palette[PaletteColor.Primary],
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
      gap: 6,
    },
    buttonText: {
      color: palette[PaletteColor.Surface],
      fontSize: 12,
      fontWeight: "600",
    },
    viewContainer: {
      flex: 1,
      backgroundColor: palette[PaletteColor.Background],
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    modalContent: {
      backgroundColor: palette[PaletteColor.Surface],
      borderRadius: 12,
      padding: 0,
      minWidth: "85%",
      maxHeight: "80%",
      elevation: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 2,
      borderBottomColor: palette[PaletteColor.Primary],
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: "bold",
      color: palette[PaletteColor.PrimaryText],
      flex: 1,
    },
    closeButton: {
      padding: 4,
    },
    modalScroll: {
      padding: 20,
    },
  });

export default PatternGraphScreen;
