import "./i18n";
import { ThemeProvider } from "@/components/common/ThemeContext";
import DrawerNavigator from "@/components/common/DrawerNavigator";

export default function Index() {
  return (
    <ThemeProvider>
      <DrawerNavigator />
    </ThemeProvider>
  );
}
