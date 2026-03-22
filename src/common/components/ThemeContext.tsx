import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme as useNativeColorScheme } from "react-native";

export type ThemeType = "light" | "dark" | "system";

export interface ThemeContextProps {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  colorScheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: "system",
  setTheme: () => {},
  colorScheme: "light",
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState<ThemeType>("system");
  const systemColorScheme = useNativeColorScheme(); // "light" | "dark" | null
  const [colorScheme, setColorScheme] = useState<"light" | "dark">(
    systemColorScheme === "dark" ? "dark" : "light",
  );

  useEffect(() => {
    if (theme === "system") {
      setColorScheme(systemColorScheme === "dark" ? "dark" : "light");
    } else {
      setColorScheme(theme);
    }
  }, [theme, systemColorScheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, colorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);
