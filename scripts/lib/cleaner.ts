/**
 * Cleans extracted text content:
 * - Normalizes whitespace (multiple spaces/tabs to single space)
 * - Removes control characters (except newlines)
 * - Collapses multiple blank lines to double newline
 * - Trims leading/trailing whitespace
 * - Removes null bytes and other problematic characters
 */
export function cleanText(raw: string): string {
  return (
    raw
      // Remove null bytes and control chars except \n \r \t
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      // Normalize \r\n and \r to \n
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      // Normalize tabs and multiple spaces within lines to single space
      .replace(/[^\S\n]+/g, ' ')
      // Trim each line
      .split('\n')
      .map((line) => line.trim())
      .join('\n')
      // Collapse 3+ consecutive newlines to 2
      .replace(/\n{3,}/g, '\n\n')
      // Final trim
      .trim()
  )
}
