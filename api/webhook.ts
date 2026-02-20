import { webhookCallback } from "grammy";
import { bot } from "../src/bot/bot.ts";

/**
 * Vercel serverless entry point.
 * Telegram sends every update as a POST to this URL.
 * Register the webhook once with:
 *   https://api.telegram.org/bot<TOKEN>/setWebhook?url=<VERCEL_URL>/api/webhook
 */
export default webhookCallback(bot, "node-http");
