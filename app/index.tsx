import "./i18n";
import { ThemeProvider } from "@/src/common/components/ThemeContext";
import DrawerNavigator from "@/src/common/components/DrawerNavigator";

export default function Index() {
  return (
    <ThemeProvider>
      <DrawerNavigator />
    </ThemeProvider>
  );
}
