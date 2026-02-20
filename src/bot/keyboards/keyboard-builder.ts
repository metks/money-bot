import { InlineKeyboard, Keyboard } from "grammy";
import {
  getAllCategories,
  getCategoryEmoji,
  getCategoryDisplayName,
} from "../../expense/domain/category.ts";

export const MAIN_ACTIONS = {
  ADD_EXPENSE: "💸 Add Expense",
  SUMMARY: "📊 Summary",
  UPLOAD_INVOICE: "🧾 Upload Invoice",
  SETTINGS: "⚙️ Settings",
} as const;

export function mainKeyboard(): Keyboard {
  return new Keyboard()
    .text(MAIN_ACTIONS.ADD_EXPENSE)
    .text(MAIN_ACTIONS.SUMMARY)
    .row()
    .text(MAIN_ACTIONS.UPLOAD_INVOICE)
    .text(MAIN_ACTIONS.SETTINGS)
    .resized()
    .persistent();
}

export function categoryKeyboard(): InlineKeyboard {
  const keyboard = new InlineKeyboard();
  const categories = getAllCategories();

  categories.forEach((category, i) => {
    const emoji = getCategoryEmoji(category);
    const name = getCategoryDisplayName(category);
    keyboard.text(`${emoji} ${name}`, `select_category:${category}`);
    if ((i + 1) % 3 === 0) keyboard.row();
  });

  return keyboard;
}
