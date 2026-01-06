import { Alert, Platform } from "react-native";

function handleDelete(
  id: number,
  name: string,
  colorScheme: "light" | "dark",
  callback: (id?: number) => void,
) {
  return (e: any) => {
    e.stopPropagation?.();
    if (Platform.OS === "web") {
      if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
        callback(id);
      }
    } else {
      Alert.alert(
        "Delete pattern",
        `Are you sure you want to delete "${name}"?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => callback(id),
          },
        ],
        { cancelable: true, userInterfaceStyle: colorScheme },
      );
    }
  };
}

export default handleDelete;
