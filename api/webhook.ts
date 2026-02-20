import { webhookCallback } from "grammy";
import { bot } from "../src/bot/bot.ts";

export default webhookCallback(bot, "express");
