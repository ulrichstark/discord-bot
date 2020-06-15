import { Target } from "./Target";
import { readFileSync, writeFileSync } from "fs";
import { Message } from "discord.js";
import { Bot } from "./Bot";

const file = "./data/targets.json";
const encoding = "utf-8";

export class Observer {
    public targets: Target[];
    public bot: Bot;
    public availableColors = [
        "DEFAULT",
        "WHITE",
        "AQUA",
        "GREEN",
        "BLUE",
        "YELLOW",
        "PURPLE",
        "LUMINOUS_VIVID_PINK",
        "GOLD",
        "ORANGE",
        "RED",
        "GREY",
        "DARKER_GREY",
        "NAVY",
        "DARK_AQUA",
        "DARK_GREEN",
        "DARK_BLUE",
        "DARK_PURPLE",
        "DARK_VIVID_PINK",
        "DARK_GOLD",
        "DARK_ORANGE",
        "DARK_RED",
        "DARK_GREY",
        "LIGHT_GREY",
        "DARK_NAVY",
        "RANDOM",
    ];

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

    public addTarget(id: string, message: Message) {
        const index = this.findIndexOfTarget(id);

        if (index === null) {
            const target: Target = {
                id: id,
                minutesOnServerToday: 0,
                color: "RANDOM",
                minutesMonths : [0,0,0,0,0,0,0,0,0,0,0,0],
                minutesToday : 0,
                minutesWeek :0,
                minutesYear: 0,                
            };

            if (message.member !== null) {
                if (message.member.voice.channel != null && message.member.voice.channel.guild.id === this.bot.guildid) {
                    console.log(message.member.user.username +" wurde hinzugefügt während er in einem Channel ist, ist in einem Channel und wird ab jetzt überwacht!");
                    target.activeSince = Date.now();
                }
            }

            this.targets.push(target);
            this.save();

            return 0;

        }else{
            return 1;
        }


    }

    public removeTarget(id: string) {
        const index = this.findIndexOfTarget(id);

        if (index !== null) {
            this.targets.splice(index, 1);
            this.save();
            return 0;
        }else{  
            return 1;
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

    public connected(id: string, connectionTime: number) {
        const index = this.findIndexOfTarget(id);

        if (index !== null) {
            if (this.targets[index].activeSince !== undefined) {
                //Beim letzten Verlassen wurde nicht zurückgesetzt (Fehler)
                console.log("Das letzte Verlassen von "+id+" eines CHannels wurde nicht aufgezeichnet");
            }
            this.targets[index].activeSince = connectionTime;

            this.save();
        } else {
            console.log(id+" welches bearbeitet werden sollte wurde nicht gefunden");
        }
    }

    public disconnected(id: string, disconnectionTime: number) {
        const index = this.findIndexOfTarget(id);

        if (index !== null) {
            const target = this.targets[index];
            if (target.activeSince !== undefined) {
                var mins = Math.floor((disconnectionTime - target.activeSince) / 60000);

                this.setTime(target, mins);

                console.log("Minuten von "+ id+ " wurden überarbeitet auf " + target.minutesOnServerToday);
                target.activeSince = undefined;
            } else {
                console.log("Das letzte Connecten von "+id+" wurde nicht aufgezeichnet");
            }
            this.save();
        } else {
            console.log(id+" welcher bearbeitet werden sollte wurde nicht gefunden");
        }
    }

    public setTime(target: Target, minutes: number){
        const monat = new Date().getMonth();
        target.minutesOnServerToday+= minutes;

        if(target.minutesToday)
            target.minutesToday += minutes; 
        else
            target.minutesToday=minutes;

        if(target.minutesWeek)
            target.minutesWeek += minutes;
        else
            target.minutesWeek = minutes

        if(target.minutesMonths){
            target.minutesMonths[monat] += minutes;
        }
        else{
            target.minutesMonths = [0,0,0,0,0,0,0,0,0,0,0,0];
            target.minutesMonths[monat] = minutes;
        }

        if(target.minutesYear)
            target.minutesYear+=minutes;
        else
            target.minutesYear=minutes;
    }

    public update(id: string, message: Message, updateTime: number) {
        const index = this.findIndexOfTarget(id);

        if (index !== null) {
            const target = this.targets[index];

            //Wenn der Nutzer aktuell aufgezeichnet wird
            if (target.activeSince !== undefined) {
                var mins = Math.floor((updateTime - target.activeSince) / 60000);

                if (message.member && message.member.voice.channel == null) {
                    target.activeSince = undefined;
                    console.log(message.member.user.username+ " befand sich beim update in keinem Channel aber seine aktiveSince war nicht zurückgesetzt ->Fehler)");
                    mins = 0;
                }
                this.setTime(target,mins);
                console.log("Minuten von "+id+" wurden überarbeitet auf " + target.minutesOnServerToday);
                target.activeSince = undefined;
            } 
            if (message.member !== null) {
                //Member befindet sich gerade in einem Channel
                if (message.member.voice.channel != null && message.member.voice.channel.guild.id === this.bot.guildid) {
                    target.activeSince = updateTime;
                    console.log(message.member.user.username+ " befand sich beim update in einem Channel und seine Zeit wurde gupdated auf "+ updateTime.toString());
                }
            } else {
                target.activeSince = undefined;
                console.log("zeit update für " + id+ " fehlgeschlagen, da die Message keinen member besitzt");
            }
            //console.log("save");
            this.save();
        } else {
            console.log(id+" welches geupdated werden sollte wurde nicht gefunden");
        }
    }

    public setColor(id: string, color: string) {
        const index = this.findIndexOfTarget(id);
        if (this.availableColors.includes(color)) {
            if (index !== null) {
                const target = this.targets[index];
                target.color = color;

                this.save();
                return true;
            }
        }
        return false;
    }

    public getTarget(id: string) {
        const index = this.findIndexOfTarget(id);
        if (index !== null) {
            return this.targets[index];
        } else {
            console.log(id+" welches zurückgegeben werden sollte wurde nicht gefunden");
            return null;
        }
    }

    public topTotal(count: number) {
        var top: Target[] = [];

        //Targets nach minutesOnServerToday absteigend sortieren
        this.targets.sort((a, b) => b.minutesOnServerToday - a.minutesOnServerToday);

        for (let i = 0; i < count && i < this.targets.length; i++) {
            top.push(this.targets[i]);
        }

        return top;
    }

    public topToday(count: number){
        var top: Target[] = [];

        //Targets nach minutesweek absteigend sortieren
        this.targets.sort((a, b) => {
            if(b.minutesToday === undefined){
                return -1;
            }
            else if(a.minutesToday === undefined){
                return 1;
            }
            else{
                return (b.minutesToday - a.minutesToday);
            }
        });

        for (let i = 0; i < count && i < this.targets.length; i++) {
            top.push(this.targets[i]);
        }

        return top;
    }

    public topWeek(count: number){
        var top: Target[] = [];

        //Targets nach minutesweek absteigend sortieren
        this.targets.sort((a, b) => {
            if(b.minutesWeek === undefined){
                return -1;
            }
            else if(a.minutesWeek === undefined){
                return 1;
            }
            else{
                return (b.minutesWeek - a.minutesWeek);
            }
        });

        for (let i = 0; i < count && i < this.targets.length; i++) {
            top.push(this.targets[i]);
        }

        return top;
    }

    public topMonth(count: number){
        var top: Target[] = [];
        const monat = new Date().getMonth();

        //Targets nach minutesMonth absteigend sortieren
        this.targets.sort((a, b) => {
            if(b.minutesMonths === undefined){
                return -1;
            }
            else if(a.minutesMonths === undefined){
                return 1;
            }
            else{
                return (b.minutesMonths[monat] - a.minutesMonths[monat]);
            }
        });

        for (let i = 0; i < count && i < this.targets.length; i++) {
            top.push(this.targets[i]);
        }

        return top;
    }

    public topYear(count: number){
        var top: Target[] = [];

        //Targets nach minutesweek absteigend sortieren
        this.targets.sort((a, b) => {
            if(b.minutesYear === undefined){
                return -1;
            }
            else if(a.minutesYear === undefined){
                return 1;
            }
            else{
                return (b.minutesYear - a.minutesYear);
            }
        });

        for (let i = 0; i < count && i < this.targets.length; i++) {
            top.push(this.targets[i]);
        }

        return top;
    }

    public botRestart() {
        //Alle onSince Zeiten zurücksetzen
        for (let i = 0; i < this.targets.length; i++) {
            this.targets[i].activeSince = undefined;
        }
        this.save();
    }


    public timeSchedule() {

        const hour = 6;
        const minute = 0;
    
        // create a Date object at the desired timepoint
        const startTime = new Date();
        startTime.setHours(hour, minute);
        const now = new Date();
    
        // increase timepoint by 24 hours if in the past
        if (startTime.getTime() < now.getTime()) {
          startTime.setHours(startTime.getHours() + 24);
        }
    
        // get the interval in ms from now to the timepoint when to trigger the alarm
        const firstTriggerAfterMs = startTime.getTime() - now.getTime();
    
        // trigger the function triggerThis() at the timepoint
        // create setInterval when the timepoint is reached to trigger it every day at this timepoint
        console.log("nächster Tagesreset in: "+ Math.floor(firstTriggerAfterMs/1000/60)  + " minuten um "+ startTime.toString());

        const bot = this;
        setTimeout(function(){
            bot.minuteReset();
            setInterval(bot.minuteReset, 24 * 60 * 60 * 1000);
          }, firstTriggerAfterMs);
    
    }    

    public minuteReset(){
        const day = new Date();

        //Es ist 6Uhr
        for (let i = 0; i < this.targets.length; i++) {
            this.targets[i].minutesToday = 0;
        }
        console.log("Tagesreset um 6Uhr");

        if(day.getDate() === 1){//Falls es der 1. des Monats ist

            for (let i = 0; i < this.targets.length; i++) {
                const target = this.targets[i];
                if(target.minutesMonths){
                    target.minutesMonths[day.getMonth()] = 0;
                }else{
                    target.minutesMonths = [0,0,0,0,0,0,0,0,0,0,0,0];
                    console.log("Monatsreset von Monat "+ day.getMonth().toString()+ " bei user "+ target.id+toString() + " fehlgeschlagen. Monatarray resettet" );
                }
            }
            console.log("Monatsreset von Monat "+ day.getMonth().toString() );
            
            if(day.getMonth() === 0){//Falls es Januar ist 
                for (let i = 0; i < this.targets.length; i++) {
                    this.targets[i].minutesYear = 0;
                }
                console.log("Jahresreset");
            }
        } 
        if(day.getDay() === 1){//Falls es Montag ist

            for (let i = 0; i < this.targets.length; i++) {
                this.targets[i].minutesWeek = 0;
            }
            console.log("Wochenreset");

        }
    
        this.save();   
    }


}
