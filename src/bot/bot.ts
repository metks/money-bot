import { Bot } from "grammy";
import { env } from "../config/env.ts";
import { onError } from "./middleware/error-handler.ts";
import { expenseHandler } from "./handlers/expense-handler.ts";

export const bot = new Bot(env.BOT_TOKEN);

bot.catch(onError);

bot.use(expenseHandler);
