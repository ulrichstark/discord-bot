import * as Discord from "discord.js";
import { Observer } from "./Observer";
import { onReady } from "./events/onReady";
import { onMessage } from "./events/onMessage";
import { onVoiceStateUpdate } from "./events/onVoiceStateUpdate";

export class Bot {
    private bot: Discord.Client;

    public observer: Observer;

    constructor() {
        this.bot = new Discord.Client();

        this.bot.on("ready", () => onReady(this));
        this.bot.on("message", (message) => onMessage(this, message));
        this.bot.on("voiceStateUpdate", (voiceStateOld, voiceStateNew) => onVoiceStateUpdate(this, voiceStateOld, voiceStateNew));

        this.observer = new Observer();

        // const channelPromise = this.bot.channels.fetch("690914667220172940");
        // channelPromise.then((channel) => console.log("Channel:", channel));
    }

    public login() {
        const token = process.env.DISCORD_TOKEN;

        console.log(`logging in with token: ${token}...`);

        this.bot.login(token);
    }
}
