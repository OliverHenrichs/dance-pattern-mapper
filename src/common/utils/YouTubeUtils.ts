/**
 * Extracts a YouTube video ID from common URL formats:
 *  - https://www.youtube.com/watch?v=ID
 *  - https://youtu.be/ID
 *  - https://youtube.com/shorts/ID
 *  - https://m.youtube.com/watch?v=ID
 *  - (with or without extra query params / timestamps)
 *
 * Returns null if the URL is not a recognised YouTube URL.
 */
export function extractYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "").replace(/^m\./, "");

    if (host === "youtu.be") {
      // https://youtu.be/VIDEO_ID
      return parsed.pathname.slice(1).split("/")[0] || null;
    }

    if (host === "youtube.com") {
      // /shorts/VIDEO_ID
      const shortsMatch = parsed.pathname.match(/^\/shorts\/([^/?#]+)/);
      if (shortsMatch) return shortsMatch[1];

      // /watch?v=VIDEO_ID
      return parsed.searchParams.get("v");
    }

    return null;
  } catch {
    return null;
  }
}

/** True when the URL points to a YouTube video. */
export function isYouTubeUrl(url: string): boolean {
  return extractYouTubeVideoId(url) !== null;
}

/**
 * Returns a YouTube thumbnail URL for a given video ID.
 * Falls back gracefully: hqdefault is available for every public video.
 */
export function getYouTubeThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}
