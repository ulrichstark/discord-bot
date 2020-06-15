import {Message, MessageAttachment, MessageEmbed} from "discord.js";
import { Bot } from "../Bot";

const COMMAND_PREFIX = "!";
const MONATESTRING = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

export function onMessage(bot: Bot, message: Message) {
    if (message.author.bot) return;

    const member = message.member;
    if (member == null){
        console.log("Zu einer Message konnte kein Member ermittelt werden");
        return;
    }

    const isCommand = message.content.startsWith(COMMAND_PREFIX);

    if (isCommand) {
        handleCommand(bot, message);
    } else {
        handleNormalMessage(bot, message);
    }
}

function handleCommand(bot: Bot, message: Message) {
    const { content, channel, member } = message;
    if(!bot.allowedChannels.includes(channel.id)){ //Befehl wurde nicht in einem Bot Channel aufgerufen
        return;
    }

    const args = content.substring(COMMAND_PREFIX.length).split(" ");

    switch (args[0]) {
        case "help":{
            var output = "Alle implementierten Befehle:\n";
            output += "!startObserving: Starte die Überwachung deiner Onlinezeit\n";
            output += "!stopObserving: Beende die Überwachung deiner Onlinezeit\n";
            output += "!uptime: Zeige deine Onlineübersicht an\n";
            output += "!day: Zeige deine Onlinezeit von heute an\n";
            output += "!week: Zeige Onlinezeit von dieser Woche an\n";
            output += "!month: Zeige Onlinezeit von diesem Monat an\n";
            output += "!year: Zeige Onlinezeit von diesem Jahr an\n";
            output += "!setColor <farbe>: Setze deine persönliche Farbe\n";
            output += "!colors: Erhalte eine Liste der erlaubten Farben\n";
            output += "!topTotal: Erhalte eine Top3 Liste der insgesamten Onlinezeiten\n";
            output += "!topDay: Erhalte eine Top3 Liste der heutigen Onlinezeiten\n";
            output += "!topWeek: Erhalte eine Top3 Liste der Onlinezeiten von dieser Woche\n";
            output += "!topMonth: Erhalte eine Top3 Liste der Onlinezeiten von diesem Monats\n";
            output += "!topYear: Erhalte eine Top3 Liste der Onlinezeiten von diesem Jahr\n";
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
                var success = bot.observer.addTarget(member.id, message);

                if(success === 0){
                    message.reply("Hinzugefügt!");
                }else{
                    message.reply("Oh je, das hat nicht geklappt!");
                }
            }
            break;
        }
        case "stopObserving": {
            if (member) {
                var success = bot.observer.removeTarget(member.id);

                if(success===0){
                    message.reply("Entfernt!");
                }else{
                    message.reply("Oh je, das hat nicht geklappt!");
                }
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
                const monat = new Date().getMonth();

                if(target !== null){
                    var minutesTotal = target.minutesOnServerToday;
                    if(minutesTotal === undefined || minutesTotal === null){
                        minutesTotal = 0;
                    }
                    var stundenTotal = Math.floor(minutesTotal / 60);
                    minutesTotal = minutesTotal %60;
                    var tageTotal = Math.floor(stundenTotal/24);
                    stundenTotal = stundenTotal % 24;


                    var minutesToday = target.minutesToday;
                    if(minutesToday === undefined || minutesToday === null){
                        minutesToday = 0;
                    }
                    var stundenToday = Math.floor(minutesToday / 60);
                    minutesToday = minutesToday %60;


                    var minutesWeek = target.minutesWeek;
                    if(minutesWeek === undefined || minutesWeek === null){
                        minutesWeek = 0;
                    }
                    var stundenWeek = Math.floor(minutesWeek / 60);
                    minutesWeek = minutesWeek %60;
                    var tageWeek = Math.floor(stundenWeek/24);
                    stundenWeek = stundenWeek % 24;


                    var minutesMonths = target.minutesMonths;
                    var minutesMonth = 0;
                    if(minutesMonths){
                        minutesMonth = minutesMonths[monat];
                    }                    
                    var stundenMonth = Math.floor(minutesMonth / 60);
                    minutesMonth = minutesMonth %60;
                    var tageMonth = Math.floor(stundenMonth/24);
                    stundenMonth = stundenMonth % 24;


                    var minutesYear = target.minutesYear;
                    if(minutesYear === undefined || minutesYear === null){
                        minutesYear = 0;
                    }
                    var stundenYear = Math.floor(minutesYear / 60);
                    minutesYear = minutesYear %60;
                    var tageYear = Math.floor(stundenYear/24);
                    stundenYear = stundenYear % 24;


                    var color = target.color;
                    if(color === undefined){
                        color = "DEFAULT";
                    }
                    
                    const embed = new MessageEmbed().setTitle("Onlinezeit Übersicht")
                                                    .setColor(color)
                                                    .setDescription(member.user.username.toString())
                                                    .setThumbnail(member.user.displayAvatarURL())
                                                    .addFields(
                                                        { name: 'Heute', value: stundenToday.toString()+ "h "+ minutesToday+"min", inline: true },
                                                        { name: 'Woche', value: tageWeek.toString()+"d "+ stundenWeek.toString()+ "h "+ minutesWeek+"min", inline : true },
                                                        { name: 'Monat', value: tageMonth.toString()+"d "+ stundenMonth.toString()+ "h "+ minutesMonth+"min", inline : true },
                                                        { name: 'Jahr', value: tageYear.toString()+"d "+ stundenYear.toString()+ "h "+ minutesYear+"min", inline : true },
                                                        { name: 'Gesamt', value: tageTotal.toString()+"d "+ stundenTotal.toString()+ "h "+ minutesTotal+"min", inline : true },
                                                    );
                    channel.send(embed);
                    
                }else{
                    message.reply("Oh jee! Du wurdest heute nicht überwacht!");
                }
            }
            break;
        }
        case "day":{
            if(member){
                bot.observer.update(member.id, message, Date.now()); //Targeteintrag updaten
                const target = bot.observer.getTarget(member.id); //Targeteintrag holen

                if(target !== null){
                    var minutesToday = target.minutesToday;
                    if(minutesToday === undefined || minutesToday === null){
                        minutesToday = 0;
                    }
                    var stunden = Math.floor(minutesToday / 60);
                    minutesToday = minutesToday %60;

                    var color = target.color;
                    if(color === undefined){
                        color = "DEFAULT";
                    }
                    
                    const embed = new MessageEmbed().setTitle("Onlinezeit heute")
                                                    .setColor(color)
                                                    .setDescription(member.user.username.toString())
                                                    .setThumbnail(member.user.displayAvatarURL())
                                                    .addFields(
                                                        { name: 'Stunden', value: stunden.toString(), inline : true },
                                                        { name: 'Minuten', value: minutesToday.toString(), inline: true },
                                                    );
                    channel.send(embed);
                    
                }else{
                    message.reply("Oh jee! Du wurdest heute nicht überwacht!");
                }
            }
            break;
        }

        case "week":{
            if(member){
                bot.observer.update(member.id, message, Date.now()); //Targeteintrag updaten
                const target = bot.observer.getTarget(member.id); //Targeteintrag holen

                if(target !== null){
                    var minutesWeek = target.minutesWeek;
                    if(minutesWeek === undefined || minutesWeek === null){
                        minutesWeek = 0;
                    }
                    var stunden = Math.floor(minutesWeek / 60);
                    minutesWeek = minutesWeek %60;
                    var tage = Math.floor(stunden/24);
                    stunden = stunden % 24;

                    var color = target.color;
                    if(color === undefined){
                        color = "DEFAULT";
                    }
                    
                    const embed = new MessageEmbed().setTitle("Onlinezeit in dieser Woche")
                                                    .setColor(color)
                                                    .setDescription(member.user.username.toString())
                                                    .setThumbnail(member.user.displayAvatarURL())
                                                    .addFields(
                                                        { name: 'Tage', value: tage.toString(), inline: true },
                                                        { name: 'Stunden', value: stunden.toString(), inline : true },
                                                        { name: 'Minuten', value: minutesWeek.toString(), inline: true },
                                                    );
                    channel.send(embed);
                    
                }else{
                    message.reply("Oh jee! Du wurdest heute nicht überwacht!");
                }
            }
            break;
        }

        case "month":{
            if(member){
                bot.observer.update(member.id, message, Date.now()); //Targeteintrag updaten
                const target = bot.observer.getTarget(member.id); //Targeteintrag holen
                const monat = new Date().getMonth();

                if(target !== null){
                    var minutesMonths = target.minutesMonths;
                    var minutesMonth = 0;
                    if(minutesMonths){
                        minutesMonth = minutesMonths[monat];
                    }
                    var stunden = Math.floor(minutesMonth / 60);
                    minutesMonth = minutesMonth %60;
                    var tage = Math.floor(stunden/24);
                    stunden = stunden % 24;

                    var color = target.color;
                    if(color === undefined){
                        color = "DEFAULT";
                    }
                    
                    const embed = new MessageEmbed().setTitle("Onlinezeit in diesem Monat")
                                                    .setColor(color)
                                                    .setDescription(member.user.username.toString())
                                                    .setThumbnail(member.user.displayAvatarURL())
                                                    .addFields(
                                                        { name: 'Tage', value: tage.toString(), inline: true },
                                                        { name: 'Stunden', value: stunden.toString(), inline : true },
                                                        { name: 'Minuten', value: minutesMonth.toString(), inline: true },
                                                    );
                    channel.send(embed);
                    
                }else{
                    message.reply("Oh jee! Du wurdest heute nicht überwacht!");
                }
            }
            break;
        }

        case "year":{
            if(member){
                bot.observer.update(member.id, message, Date.now()); //Targeteintrag updaten
                const target = bot.observer.getTarget(member.id); //Targeteintrag holen

                if(target !== null){
                    var minutesMonths = target.minutesMonths;
                    if(minutesMonths === undefined){
                        minutesMonths = [0,0,0,0,0,0,0,0,0,0,0,0];
                    }

                    var color = target.color;
                    if(color === undefined){
                        color = "DEFAULT";
                    }

                    var minutesYear = target.minutesYear;
                    if(minutesYear === undefined || minutesYear === null){
                        minutesYear = 0;
                    }
                    var stundenYear = Math.floor(minutesYear / 60);
                    minutesYear = minutesYear %60;
                    var tageYear = Math.floor(stundenYear/24);
                    stundenYear = stundenYear % 24;

                    const embed = new MessageEmbed().setTitle("Onlinezeit in diesem Jahr")
                                                    .setColor(color)
                                                    .setDescription(member.user.username.toString())
                                                    .setThumbnail(member.user.displayAvatarURL())
                                                    .addFields(
                                                        { name: 'Tage', value: tageYear.toString(), inline: true },
                                                        { name: 'Stunden', value: stundenYear.toString(), inline : true },
                                                        { name: 'Minuten', value: minutesYear.toString(), inline: true },
                                                    );

                    for(var i = 0; i< 12; i++){

                        var minutesMonth = minutesMonths[i];
                        var stundenMonth = Math.floor(minutesMonth / 60);
                        minutesMonth = minutesMonth %60;
                        var tagemonth = Math.floor(stundenMonth/24);
                        stundenMonth = stundenMonth % 24;
    
                        embed.addField(MONATESTRING[i], tagemonth.toString()+"d "+ stundenMonth.toString()+ "h "+ minutesMonth+"min", true);

                    }
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
        case "topTotal":{
            if(message.guild == null ){
                message.reply("Oh jee, das hat nicht geklappt");
                return;
            }
            const top = bot.observer.topTotal(3);

            const embed = new MessageEmbed().setTitle("Top 3 Onlinezeiten Insgesamt")
                                            .setColor("DARK_GOLD")
                                            .setFooter("Die Werte der einzelnen Mitglieder könnten veraltet sein");
                   

            for(const target of top ){

                if(target !== null){
                    var minutes = target.minutesOnServerToday;
                    if(minutes === undefined || minutes === null){
                        minutes = 0;
                    }
                    let stunden = Math.floor(minutes / 60);
                    minutes = minutes %60;
                    let tage = Math.floor(stunden/24);
                    stunden = stunden % 24;

                    const { id } = target;
                    const member = message.guild.members.resolve(id);

                    if (member) {
                        embed.addField(member.user.username.toString(), tage.toString() + " d "+ stunden.toString()+ " h "+ minutes.toString()+" min" );
                    }
                }
            }

            channel.send(embed);

            break;
        }
        case "topDay":{
            if(message.guild == null ){
                message.reply("Oh jee, das hat nicht geklappt");
                return;
            }
            const top = bot.observer.topToday(3);

            const embed = new MessageEmbed().setTitle("Top 3 Onlinezeiten des Tages")
                                            .setColor("DARK_GOLD")
                                            .setFooter("Die Werte der einzelnen Mitglieder könnten veraltet sein");
                   

            for(const target of top ){

                if(target !== null){
                    var minutes =0;
                    if(target.minutesToday){
                        minutes = target.minutesToday;
                    }
                    let stunden = Math.floor(minutes / 60);
                    minutes = minutes %60;
                    let tage = Math.floor(stunden/24);
                    stunden = stunden % 24;

                    const { id } = target;
                    const member = message.guild.members.resolve(id);

                    if (member) {
                        embed.addField(member.user.username.toString(), tage.toString() + " d "+ stunden.toString()+ " h "+ minutes.toString()+" min" );
                    }
                }
            }

            channel.send(embed);

            break;
        }        
        case "topWeek":{
            if(message.guild == null ){
                message.reply("Oh jee, das hat nicht geklappt");
                return;
            }
            const top = bot.observer.topWeek(3);

            const embed = new MessageEmbed().setTitle("Top 3 Onlinezeiten der Woche")
                                            .setColor("DARK_GOLD")
                                            .setFooter("Die Werte der einzelnen Mitglieder könnten veraltet sein");
                   

            for(const target of top ){

                if(target !== null){
                    var minutes =0;
                    if(target.minutesWeek){
                        minutes = target.minutesWeek;
                    }
                    let stunden = Math.floor(minutes / 60);
                    minutes = minutes %60;
                    let tage = Math.floor(stunden/24);
                    stunden = stunden % 24;

                    const { id } = target;
                    const member = message.guild.members.resolve(id);

                    if (member) {
                        embed.addField(member.user.username.toString(), tage.toString() + " d "+ stunden.toString()+ " h "+ minutes.toString()+" min" );
                    }
                }
            }

            channel.send(embed);

            break;
        }      
        case "topMonth":{
            if(message.guild == null ){
                message.reply("Oh jee, das hat nicht geklappt");
                return;
            }
            const top = bot.observer.topMonth(3);

            const embed = new MessageEmbed().setTitle("Top 3 Onlinezeiten des Monats")
                                            .setColor("DARK_GOLD")
                                            .setFooter("Die Werte der einzelnen Mitglieder könnten veraltet sein");
                   

            for(const target of top ){

                if(target !== null){
                    var minutes =0;
                    var monat = new Date().getMonth();
                    if(target.minutesMonths){
                        minutes = target.minutesMonths[monat];
                    }
                    let stunden = Math.floor(minutes / 60);
                    minutes = minutes %60;
                    let tage = Math.floor(stunden/24);
                    stunden = stunden % 24;

                    const { id } = target;
                    const member = message.guild.members.resolve(id);

                    if (member) {
                        embed.addField(member.user.username.toString(), tage.toString() + " d "+ stunden.toString()+ " h "+ minutes.toString()+" min" );
                    }
                }
            }

            channel.send(embed);

            break;
        }
        case "topYear":{
            if(message.guild == null ){
                message.reply("Oh jee, das hat nicht geklappt");
                return;
            }
            const top = bot.observer.topYear(3);

            const embed = new MessageEmbed().setTitle("Top 3 Onlinezeiten des Jahres")
                                            .setColor("DARK_GOLD")
                                            .setFooter("Die Werte der einzelnen Mitglieder könnten veraltet sein");
                   

            for(const target of top ){

                if(target !== null){
                    var minutes =0;
                    if(target.minutesYear){
                        minutes = target.minutesYear;
                    }
                    let stunden = Math.floor(minutes / 60);
                    minutes = minutes %60;
                    let tage = Math.floor(stunden/24);
                    stunden = stunden % 24;

                    const { id } = target;
                    const member = message.guild.members.resolve(id);

                    if (member) {
                        embed.addField(member.user.username.toString(), tage.toString() + " d "+ stunden.toString()+ " h "+ minutes.toString()+" min" );
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
    // if (msg.includes("alarm")) {
    //     const embed = new MessageEmbed().setTitle("ALARM").setColor(0xff0000).setDescription("ALARM! ALARM!");
    //     channel.send(embed);
    // }
    // if (msg.includes("maul")) {
    //     channel.send("Es gibt Maul und es gibt Halts Maul!");
    // }
    if (msg.includes("gute_nacht")) {
        message.react("🇨");
        message.react("🇮");
        message.react("🇦");
        message.react("🇴");
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
