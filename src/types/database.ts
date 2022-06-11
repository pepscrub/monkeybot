import { HexColorString } from "discord.js";
import { WithId } from "mongodb";

export enum Columns {
    limiting = 'ratelimit',
    monkey = 'monkey_rankings',
    settings = 'settings',
    suggestions = 'suggestions',
    vote = 'vote',
    serverData = 'commands'
}

export type Rankings = '🟧' | '🟥'  | '🟪'  | '🟦'  | '⬜' | '❌';

export interface MonkeySettings{
    colors: Record<Rankings, string[]>;
    reactions: Rankings[];
    randomnoise: string[];
    ratelimit: number;
    search_terms: string[];
    subreddits: string[];
}

export interface StoredMonkey extends WithId<Document> {
    url: string;
    rank: Rankings[];
    color: HexColorString[];
    users: string | string[];
}

interface Users {
    id: string;
    name: string;
    pfp: string;
    commandusage: [string[] | number[]][]
}

export interface SavedCommands extends WithId<Document> {
    server: {
        id: string;
        name: string;
        icon: string;
        banner: string | null;
        dbanner: string | null;
    }
    users: Users[];
}