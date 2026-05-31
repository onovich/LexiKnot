export interface RegexMatchResult {
  readonly isValid: boolean;
  readonly isMatch: boolean;
  readonly error: string | null;
}

export function testFullMatch(pattern: string, sample: string): RegexMatchResult {
  try {
    const expression = new RegExp(`^(?:${pattern})$`);
    return {
      isValid: true,
      isMatch: expression.test(sample),
      error: null,
    };
  } catch (error) {
    return {
      isValid: false,
      isMatch: false,
      error: error instanceof Error ? error.message : "Unable to evaluate regex.",
    };
  }
}
