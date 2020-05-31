import { Target } from "./Target";
import { readFileSync, writeFileSync } from "fs";

const file = "./data/targets.json";
const encoding = "utf-8";

export class Observer {
    public targets: Target[];

    constructor() {
        try {
            const fileInput = readFileSync(file, encoding);
            this.targets = JSON.parse(fileInput);
        } catch (e) {
            console.log("Observer initialized to empty targets array!");
            this.targets = [];
        }
    }

    public addTarget(id: string) {
        const index = this.findIndexOfTarget(id);

        if (index === null) {
            const target: Target = {
                id: id,
                minutesOnServer: 0,
            };

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

    private findIndexOfTarget(id: string) {
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
}
