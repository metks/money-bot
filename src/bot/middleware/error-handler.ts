import type { BotError, Context } from "grammy";

export async function onError(err: BotError<Context>): Promise<void> {
  const { ctx, error } = err;
  console.error(`Error on update ${ctx.update.update_id}:`, error);

  try {
    await ctx.reply("Something went wrong\\. Please try again\\.", {
      parse_mode: "MarkdownV2",
    });
  } catch {
    // Reply may fail if the chat is no longer accessible
  }
}
