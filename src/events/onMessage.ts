import {Message, MessageAttachment, MessageEmbed} from "discord.js";
import { Bot } from "../Bot";
import { strict } from "assert";

const COMMAND_PREFIX = "!";

export function onMessage(bot: Bot, message: Message) {
    if (message.author.bot) return;

    const isCommand = message.content.startsWith(COMMAND_PREFIX);

    if (isCommand) {
        handleCommand(bot, message);
    } else {
        handleNormalMessage(bot, message);
    }
}

function handleCommand(bot: Bot, message: Message) {
    const { content, channel, member } = message;

    const args = content.substring(COMMAND_PREFIX.length).split(" ");

    switch (args[0]) {
        case "ping":
            channel.send("pong");
            break;
        case "clear": {
            if (member && member.hasPermission("MANAGE_MESSAGES")) {
                if (args.length < 2) {
                    channel.send("Zweites Argument erforderlich!");
                } else {
                    const messageCount = Number.parseInt(args[1]);
                    channel.bulkDelete(messageCount + 1);
                }
            } else {
                channel.send("Nicht die erfolderlichen Rechte!");
            }
            break;
        }
        case "startObserving": {
            if (member) {
                bot.observer.addTarget(member.id, message);
                message.reply("Hinzugefügt!");
            }
            break;
        }
        case "stopObserving": {
            if (member) {
                bot.observer.removeTarget(member.id);
                message.reply("Entfernt!");
            }
            break;
        }
        case "listObserving": {
            if (message.guild) {
                let output = "";
                if(bot.observer.targets.length > 0){
                    output = "Liste an observierten Einheiten:\n";

                    for (const target of bot.observer.targets) {
                        const { id } = target;

                        const member = message.guild.members.resolve(id);

                        if (member) {
                            output += member.user.username + "\n";
                        }
                    }
                }else{
                    output = "Liste enthält keine observierten Einheiten";
                }
                channel.send(output);
            }
            break;
        }
        case "uptime":{
            if(member){
                bot.observer.update(member.id, message, Date.now()); //Targeteintrag updaten
                const target = bot.observer.getTarget(member.id); //Targeteintrag holen

                if(target !== null){
                    var minutes = target.minutesOnServerToday;
                    if(minutes === undefined || minutes === null){
                        minutes = 0;
                    }
                    var stunden = Math.floor(minutes / 60);
                    minutes = minutes %60;
                    
                    const embed = new MessageEmbed().setTitle("Heutige Onlinezeit von " + (member.user.username).toString())
                                                    .setColor(0xffffff)
                                                    .setDescription("Stunden: " + stunden.toString() + "\nMinuten: " + minutes.toString() );
                    channel.send(embed);
                    
                }else{
                    message.reply("Du wurdest heute nicht überwacht!");
                }
            }
            break;
        }
    }
}

function handleNormalMessage(bot: Bot, message: Message) {
    const { content, author, channel } = message;

    if (content === "Zeig meinen Avatar") {
        message.reply(author.displayAvatarURL());
    }

    const msg = content.toLowerCase();

    // if (msg.includes("uguross")) {
    //     const attachment = new MessageAttachment(
    //         "https://cdn1.stuttgarter-zeitung.de/media.media.1038cc3e-6c07-4fcf-b88c-19e7a69ea0bc.original1024.jpg"
    //     );
    //     channel.send("Meinten sie vlt: ", attachment);
    // }
    if (msg.includes("alarm")) {
        const embed = new MessageEmbed().setTitle("ALARM").setColor(0xff0000).setDescription("ALARM! ALARM!");
        channel.send(embed);
    }
    if (msg.includes("maul")) {
        channel.send("Es gibt Maul und es gibt Halts Maul!");
    }
    if (msg.includes("gute_nacht")) {
        channel.send(`Gute Nacht, ${author.toString()}!`);
    }
    // if (msg.includes("kek") || msg.includes("schmutz")) {
    //     channel.send(`Oh jeee, ${author.toString()} :rofl:`);
    // }
    // if (msg.includes("captain")) {
    //     channel.send("Ich habe das Patent A, B, C, und die 6!");
    // }
    if (msg.includes("maul")) {
        message.react("🇲");
        message.react("🇦");
        message.react("🇺");
        message.react("🇱");
    }
    if (msg.includes("essen")) {
        message.react("716019006846271559");
    }
    // if (msg.includes("arzt")) {
    //     message.react("716043360770458061");
    // }
}
