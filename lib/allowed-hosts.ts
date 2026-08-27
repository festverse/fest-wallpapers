const ALLOWED_SUFFIXES = [
  "wallhaven.cc",
  "alphacoders.com",
  "redd.it",
  "imgur.com"
];

export function isAllowedImageUrl(raw: string): boolean {
  if (!raw) {
    return false;
  }
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:") {
      return false;
    }
    return ALLOWED_SUFFIXES.some(
      (suffix) => url.hostname === suffix || url.hostname.endsWith("." + suffix)
    );
  } catch (error) {
    return false;
  }
}
