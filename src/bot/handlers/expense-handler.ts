import { Composer } from "grammy";
import type { Context } from "grammy";
import { ExpenseParser } from "../../expense/domain/expense-parser.ts";
import { createExpenseId } from "../../expense/domain/expense.ts";
import {
  createExpense,
  deleteExpense,
  expensePresenter,
} from "../../config/container.ts";
import { MAIN_ACTIONS, mainKeyboard } from "../keyboards/keyboard-builder.ts";

const expenseParser = new ExpenseParser();

const KEYBOARD_TEXTS = new Set<string>(Object.values(MAIN_ACTIONS));

export const expenseHandler = new Composer<Context>();

expenseHandler.command("start", async (ctx) => {
  await ctx.reply(
    "👋 *Welcome to Matheo\\!*\n\n" +
      "Track your expenses effortlessly\\.\n\n" +
      "Send me something like `coffee 4\\.50` to log an expense instantly, " +
      "or tap *Add Expense* below for a guided flow\\.",
    { parse_mode: "MarkdownV2", reply_markup: mainKeyboard() },
  );
});

expenseHandler.hears(MAIN_ACTIONS.ADD_EXPENSE, async (ctx) => {
  await ctx.reply(
    "What did you spend? Send me a message like:\n\n" +
      "`coffee 4\\.50`\n`12 transport taxi`\n`4\\.50 health`",
    { parse_mode: "MarkdownV2" },
  );
});

// Quick natural-language expense entry
expenseHandler.on("message:text", async (ctx) => {
  const text = ctx.message.text;

  // Let other handlers deal with commands and keyboard buttons
  if (text.startsWith("/") || KEYBOARD_TEXTS.has(text)) return;

  if (!ctx.from) return;
  const userId = String(ctx.from.id);

  const parseResult = expenseParser.parse(text);
  if (!parseResult.ok) {
    await ctx.reply(
      "Hmm, I couldn't parse that\\.\n\n" +
        "Try something like `coffee 4\\.50` or `12\\.50 transport`\\.",
      { parse_mode: "MarkdownV2" },
    );
    return;
  }

  const { amount, category, description } = parseResult.value;
  const result = await createExpense.execute({
    userId,
    amount: amount.amount,
    currency: amount.currency,
    category,
    description,
  });

  if (!result.ok) {
    await ctx.reply("Something went wrong saving your expense\\. Please try again\\.", {
      parse_mode: "MarkdownV2",
    });
    return;
  }

  const { text: msgText, keyboard } = expensePresenter.saved(result.value);
  await ctx.reply(msgText, { parse_mode: "MarkdownV2", reply_markup: keyboard });
});

// Delete callback: data = "expense:delete:<id>"
expenseHandler.callbackQuery(/^expense:delete:(.+)$/, async (ctx) => {
  const matchedId = ctx.match[1];
  if (!matchedId) {
    await ctx.answerCallbackQuery("Invalid request.");
    return;
  }

  if (!ctx.from) return;
  const userId = String(ctx.from.id);
  const expenseId = createExpenseId(matchedId);

  const result = await deleteExpense.execute({ expenseId, userId });
  if (!result.ok) {
    await ctx.answerCallbackQuery("Couldn't delete this expense.");
    return;
  }

  await ctx.editMessageText(expensePresenter.deleted().text, {
    parse_mode: "MarkdownV2",
  });
  await ctx.answerCallbackQuery("Deleted!");
});
