import React, { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { WCSPattern } from "@/components/pattern/types/WCSPattern";
import { loadPatterns } from "@/components/pattern/data/PatternStorage";
import { foundationalWCSPatterns } from "@/components/pattern/data/DefaultWCSPatterns";
import AppHeader from "@/components/common/AppHeader";
import PageContainer from "@/components/common/PageContainer";
import { useThemeContext } from "@/components/common/ThemeContext";
import { getPalette, PaletteColor } from "@/components/common/ColorPalette";
import { getCommonListContainer } from "@/components/common/CommonStyles";
import PatternGraphHeader from "./PatternGraphHeader";
import GraphViewContainer from "./GraphViewContainer";
import PatternDetailsModal from "./PatternDetailsModal";

type ViewMode = "timeline" | "graph";

const PatternGraphScreen: React.FC = () => {
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

        <View style={styles.contentContainer}>
          <PatternGraphHeader
            viewMode={viewMode}
            onToggleView={handleToggleView}
          />

          <GraphViewContainer
            viewMode={viewMode}
            patterns={patterns}
            palette={palette}
            resetKey={resetKey}
            onNodeTap={handleNodeTap}
          />
        </View>

        <PatternDetailsModal
          visible={selectedPattern !== undefined}
          pattern={selectedPattern}
          allPatterns={patterns}
          onClose={handleCloseModal}
        />
      </PageContainer>
    </View>
  );
};

const getStyles = (palette: Record<PaletteColor, string>) =>
  StyleSheet.create({
    contentContainer: {
      ...getCommonListContainer(palette),
      flex: 1,
    },
  });

export default PatternGraphScreen;
