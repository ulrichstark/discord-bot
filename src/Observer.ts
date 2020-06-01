import { Target } from "./Target";
import { readFileSync, writeFileSync } from "fs";
import { DiscordAPIError , Client, Message, VoiceStatus, Snowflake} from "discord.js";
import { Bot } from "./Bot";

const file = "./data/targets.json";
const encoding = "utf-8";


export class Observer {
    public targets: Target[];
    public bot: Bot;
    public availableColors = ["DEFAULT","WHITE","AQUA","GREEN","BLUE","YELLOW","PURPLE","LUMINOUS_VIVID_PINK","GOLD","ORANGE","RED","GREY","DARKER_GREY","NAVY","DARK_AQUA","DARK_GREEN","DARK_BLUE","DARK_PURPLE","DARK_VIVID_PINK","DARK_GOLD","DARK_ORANGE","DARK_RED","DARK_GREY","LIGHT_GREY","DARK_NAVY","RANDOM"];


    constructor(bot: Bot) {
        this.bot = bot;
        try {
            const fileInput = readFileSync(file, encoding);
            this.targets = JSON.parse(fileInput);
        } catch (e) {
            console.log("Observer initialized to empty targets array!");
            this.targets = [];
        }
    }


    public addTarget(id: string, message : Message) {
        const index = this.findIndexOfTarget(id);
        

        if (index === null) {
            
            const target: Target = {
                id: id,
                minutesOnServerToday: 0,
                color: "RANDOM"
            };

            if(message.member !== null){
                if (message.member.voice.channel != null && message.member.voice.channel.guild.id === this.bot.guildid){
                    console.log("Nutzer der hinzugefügt wurde, ist in einem Channel und wird ab jetzt überwacht!");
                    target.activeSince = Date.now();
                }
            }


            this.targets.push(target);
            this.save();
            
        }
    }

    public removeTarget(id: string) {
        const index = this.findIndexOfTarget(id);

        if (index !== null) {
            this.targets.splice(index, 1);
            this.save();
        }
    }

    public findIndexOfTarget(id: string) {
        for (let i = 0; i < this.targets.length; i++) {
            if (this.targets[i].id === id) {
                return i;
            }
        }
        return null;
    }

    public save() {
        const parsedTargets = JSON.stringify(this.targets);

        try {
            writeFileSync(file, parsedTargets, { encoding: encoding });
        } catch (e) {
            console.log("Observer save failed!");
        }
    }

    public connected(id: string, connectionTime: number){
        const index = this.findIndexOfTarget(id);
        
        if (index !== null) {
            
            if(this.targets[index].activeSince !== undefined){
                //Beim letzten Verlassen wurde nicht zurückgesetzt (Fehler)
                console.log("Das letzte Verlassen eines CHannels wurde nicht aufgezeichnet");
            }
            this.targets[index].activeSince = connectionTime;

            this.save();

        }else{
            console.log("Target welches bearbeitet werden sollte wurde nicht gefunden");
        }
    }

    public disconnected(id: string, disconnectionTime: number){
        const index = this.findIndexOfTarget(id);
        
        if (index!== null) {
            const target = this.targets[index];
            if(target.activeSince !== undefined){
                target.minutesOnServerToday += Math.floor((disconnectionTime - target.activeSince) / 60000);
                console.log("Minuten wurden überarbeitet auf"+ target.minutesOnServerToday);
                target.activeSince = undefined;
            }else{
                console.log("Das letzte Connecten wurde nicht aufgezeichnet");
            }

            this.save();

        }else{
            console.log("Target welches bearbeitet werden sollte wurde nicht gefunden");
        }
    }

    public update(id: string, message: Message, updateTime: number){
        const index = this.findIndexOfTarget(id);

        if (index!== null) {
            const target = this.targets[index];

            //Wenn der Nutzer aktuell aufgezeichnet wird
            if(target.activeSince !== undefined){
                target.minutesOnServerToday += Math.floor((updateTime - target.activeSince) / 60000);
                console.log("Minuten wurden überarbeitet auf"+ target.minutesOnServerToday);
                target.activeSince = undefined;
            }else{ //Wenn der Nutzer aktuell nicht aufgezeichnet wird
                console.log("Das letzte Connecten wurde nicht aufgezeichnet");
            }

            if(message.member !== null){    
                //Member befindet sich gerade in einem Channel
                if (message.member.voice.channel != null && message.member.voice.channel.guild.id === this.bot.guildid){
                    target.activeSince = updateTime;
                    console.log("zeit für den Member wurde gupdated");
                }
            }else{
                target.activeSince = undefined;
                console.log("zeit update fehlgeschlagen, da die Message keinen member besitzt");
            }
        
            this.save();

        }else{
            console.log("Target welches geupdated werden sollte wurde nicht gefunden");
        }
    }

    public setColor(id: string, color: string){
        const index = this.findIndexOfTarget(id);
        if(this.availableColors.includes(color)){
            if (index!== null) {
                const target = this.targets[index];
                target.color = color;

                this.save();
                return true;
            }
        }
        return false;
    }

    public getTarget(id: string){
        const index = this.findIndexOfTarget(id);
        if (index !== null) {
            return this.targets[index];
        }else{
            console.log("Target welches zurückgegeben werden sollte wurde nicht gefunden");
            return null;
        }
    }

    public findTop(count: number) {
        var top: Target[] = [];

        //Targets nach minutesOnServerToday absteigend sortieren
        this.targets.sort(function(a,b) {
            const amins = a.minutesOnServerToday;
            const bmins = b.minutesOnServerToday;
            if (amins < bmins) { return 1; }
            else if (amins == bmins) { return 0; }
            else { return -1; }
        });

        this.save();

        for (let i = 0; i < count && i<this.targets.length; i++) {
            top.push(this.targets[i]);
        }

        return top;
    }

}
