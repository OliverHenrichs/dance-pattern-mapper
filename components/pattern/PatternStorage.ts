import AsyncStorage from "@react-native-async-storage/async-storage";
import { WCSPattern } from "@/components/pattern/types/WCSPattern";

const STORAGE_KEY = "@patterns";

export async function loadPatterns(): Promise<WCSPattern[] | null> {
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return null;
  } catch {
    return null;
  }
}

export function savePatterns(patterns: WCSPattern[]): void {
  AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(patterns)).catch(() => {
    // ignore
  });
}
