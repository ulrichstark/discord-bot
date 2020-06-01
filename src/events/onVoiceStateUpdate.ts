import { VoiceState } from "discord.js";
import { Bot } from "../Bot";

export function onVoiceStateUpdate(bot: Bot, voiceStateOld: VoiceState, voiceStateNew: VoiceState) {
    const oldVoiceChannel = voiceStateOld.channel;
    const newVoiceChannel = voiceStateNew.channel;
    const oldMember = voiceStateOld.member;
    const newMember = voiceStateNew.member;

    if(!oldMember || !newMember){
        console.log("Einer der beiden VoiceStates besitzt keinen Member");
        return;
    }

    if(voiceStateNew.guild.id != bot.guildid && voiceStateOld.guild.id != bot.guildid){
        console.log(`Es wurde ein VoiceStateUpdate von einem anderen Server abgefangen!`);
        return; //Aus irgendeinem Grund war das Update nicht auf unserem Server
    }

    if(bot.observer.findIndexOfTarget(newMember.id) === null){
        console.log("Dieser Nutzer wird nicht überwacht");
        return;
    }


    if (!oldVoiceChannel && newVoiceChannel) {
        // Gejoint
        console.log("Target gejoint");
        bot.observer.connected(newMember.id, Date.now() );
    }


    if (oldVoiceChannel && !newVoiceChannel) {
        // Geleavet
        console.log("Target Disconnected");
        bot.observer.disconnected(newMember.id, Date.now() );        
    }
}
