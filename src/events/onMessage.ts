import {Message, MessageAttachment, MessageEmbed} from "discord.js";
import { Bot } from "../Bot";
import { strict } from "assert";
import { Observer } from "../Observer";
import { Target } from "../Target";

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
        case "help":{
            var output = "Alle implementierten Befehle:\n";
            output += "!startObserving: Starte die Überwachung deiner Onlinezeit\n";
            output += "!stopObserving: Beende die Überwachung deiner Onlinezeit\n";
            output += "!uptime: Zeige deine aktuelle Onlinezeit an\n";
            output += "!setColor <farbe>: Setze deine persönliche Farbe\n";
            output += "!colors: Erhalte eine Liste der erlaubten Farben\n";
            output += "!top3: Erhalte eine Top3 Liste der Onlinezeiten\n";
            message.author.send(output);
            break;
        }
        case "clear": {
            if (member && member.hasPermission("MANAGE_MESSAGES")) {
                if (args.length < 2) {
                    channel.send("Oh jee! Zweites Argument erforderlich!");
                } else {
                    const messageCount = Number.parseInt(args[1]);
                    channel.bulkDelete(messageCount + 1);
                }
            } else {
                channel.send("Oh jee! Nicht die erfolderlichen Rechte!");
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
            if (message.guild && member && member.hasPermission("ADMINISTRATOR")) {
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

                    var color = target.color;
                    if(color === undefined){
                        color = "DEFAULT";
                    }
                    
                    const embed = new MessageEmbed().setTitle("Heutige Onlinezeit")
                                                    .setColor(color)
                                                    .setDescription(member.user.username.toString())
                                                    .setThumbnail(member.user.displayAvatarURL())
                                                    .addFields(
                                                        { name: 'Stunden', value: stunden.toString(), inline : true },
                                                        { name: 'Minuten', value: minutes.toString(), inline: true },
                                                    );
                    channel.send(embed);
                    
                }else{
                    message.reply("Oh jee! Du wurdest heute nicht überwacht!");
                }
            }
            break;
        }
        case "setColor":{
            if(member){
                if (args.length < 2) {
                    message.reply("Oh jee! Als zweites Argument muss eine erlaubte Farbe übergeben werden");
                } else {

                    const color = args[1];
                    if(!bot.observer.availableColors.includes(color)){
                        message.reply("Oh jee! Nicht erlaubte Farbe");
                        //message.author.send("Erlaubte Farben:\n" + bot.observer.availableColors.toString());
                    }else{
                        const r = bot.observer.setColor(member.id, color);
                        if(r){
                            message.reply("Farbe wurde gesetzt");
                        }
                    }
                }                    
             }else{
                    message.reply("Oh jee! Du wirst nicht überwacht!");
             }
            break;
        }  
        case "colors": {
            message.author.send("Erlaubte Farben:\n" + bot.observer.availableColors.toString());
            break;
        }      
        case "top3":{
            if(message.guild == null ){
                message.reply("Oh jee, das hat nicht geklappt");
                return;
            }
            const top = bot.observer.findTop(3);

            const embed = new MessageEmbed().setTitle("Top 3 Onlinezeiten")
                                                    .setColor("DARK_GOLD");

            if(message.guild ){
                const banner = message.guild.bannerURL();
                if( banner !== null){
                    embed.setThumbnail(banner);
                }
            }                       

            for(const target of top ){

                if(target !== null){
                    var minutes = target.minutesOnServerToday;
                    if(minutes === undefined || minutes === null){
                        minutes = 0;
                    }
                    var stunden = Math.floor(minutes / 60);
                    minutes = minutes %60;

                    const { id } = target;
                    const member = message.guild.members.resolve(id);

                    if (member) {
                        embed.addField(member.user.username.toString(), stunden.toString()+ " h "+ minutes.toString()+" min" );
                    }
                }
            }

            channel.send(embed);

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
    // if (msg.includes("maul")) {
    //     channel.send("Es gibt Maul und es gibt Halts Maul!");
    // }
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
