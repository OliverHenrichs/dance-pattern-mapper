import {
  VideoReference,
  WCSPattern,
} from "@/components/pattern/types/WCSPattern";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";

import { IExportData } from "@/components/pattern/data/types/IExportData";

/**
 * Import patterns from a JSON file
 * - Videos are decoded from base64 and saved locally
 * - URLs are preserved as-is
 * - Returns the imported patterns
 */
export async function importPatterns(): Promise<{
  success: boolean;
  patterns?: WCSPattern[];
  message: string;
}> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/json",
      copyToCacheDirectory: true,
    });

    if (result.canceled) {
      return { success: false, message: "Import cancelled" };
    }

    const fileUri = result.assets[0].uri;
    const content = await FileSystem.readAsStringAsync(fileUri);
    const importData: IExportData = JSON.parse(content);

    // Validate import data
    if (!importData.version || !importData.patterns) {
      return {
        success: false,
        message: "Invalid import file format",
      };
    }

    const warnings: string[] = [];
    const updatedPatterns: WCSPattern[] = [];

    // Process each pattern
    for (const pattern of importData.patterns) {
      const updatedVideoRefs: VideoReference[] = [];

      for (const videoRef of pattern.videoRefs) {
        if (videoRef.type === "local") {
          // Restore local video from base64
          if (importData.videos[videoRef.value]) {
            try {
              const timestamp = Date.now();
              const newVideoUri = `${FileSystem.documentDirectory}imported-${pattern.id}-${timestamp}.mp4`;

              await FileSystem.writeAsStringAsync(
                newVideoUri,
                importData.videos[videoRef.value],
                {
                  encoding: FileSystem.EncodingType.Base64,
                },
              );

              updatedVideoRefs.push({
                type: "local",
                value: newVideoUri,
              });
            } catch {
              warnings.push(
                `Failed to restore video for pattern "${pattern.name}"`,
              );
            }
          } else {
            warnings.push(`Video data missing for pattern "${pattern.name}"`);
          }
        } else {
          // Keep URL references as-is
          updatedVideoRefs.push(videoRef);
        }
      }

      updatedPatterns.push({
        ...pattern,
        videoRefs: updatedVideoRefs,
      });
    }

    let message = `Successfully imported ${updatedPatterns.length} pattern(s)`;
    if (warnings.length > 0) {
      message += `\n\nWarnings:\n${warnings.join("\n")}`;
    }

    return {
      success: true,
      patterns: updatedPatterns,
      message,
    };
  } catch (error) {
    return {
      success: false,
      message: `Import failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}
