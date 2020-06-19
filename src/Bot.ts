import * as Discord from "discord.js";
import { Observer } from "./Observer";
import { onReady } from "./events/onReady";
import { onMessage } from "./events/onMessage";
import { onVoiceStateUpdate } from "./events/onVoiceStateUpdate";

export class Bot {
    private bot: Discord.Client;
    public guild: Discord.Guild | undefined;
    public observer: Observer;
    public guildid: Discord.Snowflake = "187285993169223680";
    public allowedChannels: Discord.Snowflake[] = [
        "717149938235998259",
        "716642203249934377",
    ];

    constructor() {
        this.bot = new Discord.Client();

        this.bot.on("ready", () => onReady(this));
        this.bot.on("message", (message) => onMessage(this, message));
        this.bot.on("voiceStateUpdate", (voiceStateOld, voiceStateNew) =>
            onVoiceStateUpdate(this, voiceStateOld, voiceStateNew)
        );

        this.observer = new Observer(this);

        this.observer.botRestart(); // Alle activeSince zurücksetzen wegen Server restart

        this.observer.timeSchedule(); // Zeitscheduling starten (Tagesreset usw.)
    }

    public login() {
        const token = process.env.DISCORD_TOKEN;

        console.log(`logging in with token: ${token}...`);

        this.bot.login(token);
    }
}
