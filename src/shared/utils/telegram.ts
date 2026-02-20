/**
 * Escapes special characters in dynamic text for Telegram MarkdownV2.
 * Must be applied to all user-supplied or computed values, but NOT to
 * intentional formatting markers like *bold* or _italic_.
 * See: https://core.telegram.org/bots/api#markdownv2-style
 */
export function escape(text: string): string {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!\\]/g, "\\$&");
}
