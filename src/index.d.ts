import { Client } from 'discord.js'

declare class TikTok extends Client {
    public constructor();

    private get reply(): object;

    private mergify(m: object, ...s: Array<object>): object;

    private timeify(ms: number): string;

    private ready(): null;

    private message(message: any): null;
}