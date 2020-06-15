export interface Target {
    id: string; //Member id
    minutesOnServerToday: number; //aka insgesamte Zeit 
    activeSince?: number;
    color?: string;
    minutesToday?: number;
    minutesWeek?: number;
    minutesMonths?: number[];
    minutesYear?: number;
}
