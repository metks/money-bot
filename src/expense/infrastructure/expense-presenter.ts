import { InlineKeyboard } from "grammy";
import type { Expense } from "../domain/expense.ts";
import {
  getCategoryEmoji,
  getCategoryDisplayName,
  type ExpenseCategory,
} from "../domain/category.ts";
import { escape } from "../../shared/utils/telegram.ts";

export interface ExpenseMessage {
  text: string;
  keyboard: InlineKeyboard;
}

function formatExpense(expense: Expense): string {
  const snap = expense.toSnapshot();
  const emoji = getCategoryEmoji(snap.category as ExpenseCategory);
  const name = getCategoryDisplayName(snap.category as ExpenseCategory);
  const date = snap.date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const note = snap.description
    ? ` · _${escape(snap.description)}_`
    : "";
  return `${emoji} *${escape(name)}* — ${escape(snap.amount.format())} — ${escape(date)}${note}`;
}

export class ExpensePresenter {
  saved(expense: Expense): ExpenseMessage {
    const snap = expense.toSnapshot();
    return {
      text: `✅ Saved\\!\n${formatExpense(expense)}`,
      keyboard: new InlineKeyboard()
        .text("✏️ Edit", `expense:edit:${snap.id}`)
        .text("🗑 Delete", `expense:delete:${snap.id}`),
    };
  }

  updated(expense: Expense): ExpenseMessage {
    const snap = expense.toSnapshot();
    return {
      text: `✅ Updated\\!\n${formatExpense(expense)}`,
      keyboard: new InlineKeyboard()
        .text("✏️ Edit", `expense:edit:${snap.id}`)
        .text("🗑 Delete", `expense:delete:${snap.id}`),
    };
  }

  list(expenses: Expense[]): ExpenseMessage {
    if (expenses.length === 0) {
      return {
        text: "_No expenses found\\._",
        keyboard: new InlineKeyboard(),
      };
    }

    const lines = expenses.map((e) => formatExpense(e));
    return {
      text: lines.join("\n"),
      keyboard: new InlineKeyboard(),
    };
  }

  deleted(): { text: string } {
    return { text: "🗑 Expense deleted\\." };
  }
}
