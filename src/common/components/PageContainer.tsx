import React from "react";
import { StyleSheet, View, ViewProps } from "react-native";
import { getPalette, PaletteColor } from "@/src/common/utils/ColorPalette";
import { useThemeContext } from "@/src/common/components/ThemeContext";

interface PageContainerProps extends ViewProps {
  children: React.ReactNode;
}

const PageContainer: React.FC<PageContainerProps> = ({
  children,
  style,
  ...rest
}) => {
  const { colorScheme } = useThemeContext();
  const palette = getPalette(colorScheme);
  const styles = getStyles(palette);
  return (
    <View style={[styles.container, style]} {...rest}>
      {children}
    </View>
  );
};

const getStyles = (palette: Record<PaletteColor, string>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: palette[PaletteColor.Background],
      padding: 8,
    },
  });

export default PageContainer;
