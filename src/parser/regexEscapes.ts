const LITERAL_META_CHARACTERS = /[\\^$.*+?()[\]{}|]/g;

export function escapeLiteral(value: string): string {
  return value.replace(LITERAL_META_CHARACTERS, "\\$&");
}

export function normalizeCharacterClass(value: string): string {
  const escaped = value.replace(/[\\\]^]/g, "\\$&");
  return `[${escaped}]`;
}

export function unwrapCharacterClass(raw: string): string {
  if (raw.startsWith("[") && raw.endsWith("]")) {
    return raw.slice(1, -1);
  }

  return raw;
}
