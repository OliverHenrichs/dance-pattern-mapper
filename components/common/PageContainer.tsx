import React from "react";
import { StyleSheet, View, ViewProps } from "react-native";

interface PageContainerProps extends ViewProps {
  children: React.ReactNode;
}

const PageContainer: React.FC<PageContainerProps> = ({
  children,
  style,
  ...rest
}) => (
  <View style={[styles.container, style]} {...rest}>
    {children}
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f3ff",
    padding: 8,
  },
});

export default PageContainer;
