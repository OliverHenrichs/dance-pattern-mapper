import {
  VideoReference,
  WCSPattern,
} from "@/components/pattern/types/WCSPattern";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { IExportData } from "@/components/pattern/data/types/IExportData";
import { encoder } from "@/components/pattern/data/types/Encoder";

interface IImportPatternResult {
  success: boolean;
  patterns?: WCSPattern[];
  message: string;
}

/**
 * Import patterns from a JSON file
 * - Videos are decoded from base64 and saved locally
 * - URLs are preserved as-is
 * - Returns the imported patterns
 */
export async function importPatterns(): Promise<IImportPatternResult> {
  try {
    const fileUri = await getImportDocument();
    if (typeof fileUri !== "string") {
      return fileUri;
    }
    const data = await importData(fileUri);
    if (!data.version || !data.patterns) {
      return createResult(false, "Invalid import file format");
    }

    const warnings: string[] = [];
    const updatedPatterns: WCSPattern[] = [];
    for (const pattern of data.patterns) {
      const videoRefs = await addVideoRefs(pattern, data, warnings);
      updatedPatterns.push({
        ...pattern,
        videoRefs,
      });
    }
    return createResult(
      true,
      createSuccessMessage(updatedPatterns, warnings),
      updatedPatterns,
    );
  } catch (error) {
    const message = `Import failed: ${error instanceof Error ? error.message : String(error)}`;
    return createResult(false, message);
  }
}

async function getImportDocument() {
  const result = await DocumentPicker.getDocumentAsync({
    type: "application/json",
    copyToCacheDirectory: true,
  });
  if (result.canceled) {
    return createResult(false, "Import cancelled");
  }
  return result.assets[0].uri;
}

async function importData(fileUri: string) {
  const content = await FileSystem.readAsStringAsync(fileUri);
  const importData: IExportData = JSON.parse(content);
  return importData;
}

async function tryAddLocalVideoRef(
  data: IExportData,
  videoRef: VideoReference,
  pattern: WCSPattern,
  warnings: string[],
): Promise<VideoReference | void> {
  const videoString = data.videos[videoRef.value];
  if (videoString) {
    try {
      const newVideoUri = generateVideoUri(pattern);
      await FileSystem.writeAsStringAsync(newVideoUri, videoString, encoder);
      return {
        type: "local",
        value: newVideoUri,
      };
    } catch {
      warnings.push(`Failed to restore video for pattern "${pattern.name}"`);
    }
  } else {
    warnings.push(`Video data missing for pattern "${pattern.name}"`);
  }
}

async function addVideoRefs(
  pattern: WCSPattern,
  data: IExportData,
  warnings: string[],
) {
  const updatedVideoRefs: VideoReference[] = [];
  for (const videoRef of pattern.videoRefs ?? []) {
    if (videoRef.type === "local") {
      const addedVideoRef = await tryAddLocalVideoRef(
        data,
        videoRef,
        pattern,
        warnings,
      );
      if (addedVideoRef) {
        updatedVideoRefs.push(addedVideoRef);
      }
    } else {
      // Keep URL references as-is
      updatedVideoRefs.push(videoRef);
    }
  }
  return updatedVideoRefs;
}

function generateVideoUri(pattern: WCSPattern) {
  const timestamp = Date.now();
  return `${FileSystem.documentDirectory}imported-${pattern.id}-${timestamp}.mp4`;
}

function createSuccessMessage(
  updatedPatterns: WCSPattern[],
  warnings: string[],
) {
  let message = `Successfully imported ${updatedPatterns.length} pattern(s)`;
  if (warnings.length > 0) {
    message += `\n\nWarnings:\n${warnings.join("\n")}`;
  }
  return message;
}

function createResult(
  success: boolean,
  message: string,
  patterns?: WCSPattern[],
): IImportPatternResult {
  return {
    success,
    message,
    ...(patterns && { patterns }),
  };
}
