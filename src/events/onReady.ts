import { Bot } from "../Bot";

export function onReady(bot: Bot) {
    console.log("This bot is online");
    // setInterval(() => {
    //     if (bot.observer){
    //         bot.observer.checkActivityofTargets();
    //     }
    // }, 300000); // Runs this every 5 minutes.
}
