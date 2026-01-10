import { WCSPattern } from "@/components/pattern/types/WCSPattern";

export const exportDataVersion = "1.0.0";

export interface IExportData {
  version: string;
  exportDate: string;
  patterns: WCSPattern[];
  videos: {
    [key: string]: string; // key: original local path, value: base64 encoded video
  };
}
