import { bot } from "./src/bot/bot.ts";

console.log("Starting bot in polling mode...");

bot.start({
  onStart: (info) => console.log(`Bot @${info.username} is running`),
});
