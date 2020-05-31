import { VoiceState } from "discord.js";
import { Bot } from "../Bot";

export function onVoiceStateUpdate(bot: Bot, voiceStateOld: VoiceState, voiceStateNew: VoiceState) {
    const oldVoiceChannel = voiceStateOld.channel;
    const newVoiceChannel = voiceStateNew.channel;

    if (!oldVoiceChannel && newVoiceChannel) {
        // Gejoint
    }

    if (oldVoiceChannel && !newVoiceChannel) {
        // Geleavet
    }
}
