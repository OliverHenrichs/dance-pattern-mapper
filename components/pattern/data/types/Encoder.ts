// Modern expo-file-system uses File.text() and File.write() with base64 encoding
// No need for explicit encoder object with the new API
export const encoder = {
  encoding: "base64" as const,
};
