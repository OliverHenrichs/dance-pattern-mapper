import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import {
  VideoReference,
  WCSPattern,
} from "@/components/pattern/types/WCSPattern";
import {
  exportDataVersion,
  IExportData,
} from "@/components/pattern/data/types/IExportData";
import { Alert } from "react-native";
import { loadPatterns } from "@/components/pattern/PatternStorage";
import { Dispatch, SetStateAction } from "react";

interface IVideoList {
  [key: string]: string;
}

export async function handleExportPatterns(
  setIsLoading: Dispatch<SetStateAction<boolean>>,
) {
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
}

/**
 * Export patterns to a JSON file with embedded videos
 * - Videos are encoded as base64 strings
 * - URLs are preserved as-is in the pattern data
 * - Only local videos are embedded
 */
async function exportPatterns(
  patterns: WCSPattern[],
): Promise<{ success: boolean; message: string }> {
  try {
    const warnings: string[] = [];
    const exportData = await createExportData(patterns, warnings);
    const fileUri = await writeExportData(exportData);

    if (!(await Sharing.isAvailableAsync())) {
      return {
        success: false,
        message: "Sharing is not available on this device",
      };
    }
    return shareExportData(fileUri, patterns, warnings);
  } catch (error) {
    return {
      success: false,
      message: `Export failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

async function addPatternVideos(
  pattern: WCSPattern,
  videos: IVideoList,
  warnings: string[],
) {
  if (!pattern.videoRefs) {
    return;
  }
  for (const videoRef of pattern.videoRefs) {
    if (videoRef.type !== "local" || videos[videoRef.value]) {
      continue; // Skip non-local or already processed videos;
    }
    const base64Data = await getVideo(videoRef, warnings, pattern);
    if (base64Data) {
      videos[videoRef.value] = base64Data;
    }
  }
}

async function getVideo(
  videoRef: VideoReference,
  warnings: string[],
  pattern: WCSPattern,
) {
  try {
    const file = new File(videoRef.value);
    if (!file.exists) {
      return;
    }
    return await file.base64();
  } catch {
    warnings.push(
      `Failed to read video: ${videoRef.value} (pattern: ${pattern.name})`,
    );
  }
}

async function createExportData(patterns: WCSPattern[], warnings: string[]) {
  const videos: IVideoList = {};
  for (const pattern of patterns) {
    await addPatternVideos(pattern, videos, warnings);
  }
  return {
    version: exportDataVersion,
    exportDate: new Date().toISOString(),
    patterns,
    videos,
  };
}

async function writeExportData(exportData: IExportData) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const fileName = `dance-patterns-${timestamp}.json`;
  const file = new File(Paths.document, fileName);
  file.write(JSON.stringify(exportData, null, 2));
  return file.uri;
}

async function shareExportData(
  fileUri: string,
  patterns: WCSPattern[],
  warnings: string[],
) {
  await Sharing.shareAsync(fileUri, {
    mimeType: "application/json",
    dialogTitle: "Export Dance Patterns",
    UTI: "public.json",
  });
  return { success: true, message: createWarningMessage(patterns, warnings) };
}

function createWarningMessage(patterns: WCSPattern[], warnings: string[]) {
  let message = `Successfully exported ${patterns.length} pattern(s)`;
  if (warnings.length > 0) {
    message += `\n\nWarnings:\n${warnings.join("\n")}`;
  }
  return message;
}
