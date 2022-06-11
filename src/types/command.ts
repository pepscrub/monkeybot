import { SlashCommandBuilder } from '@discordjs/builders';
import { BaseCommandInteraction, ChatInputApplicationCommandData, Client } from "discord.js";
import { Spinner } from "nanospinner";

/**
 * #### Best practice format
 * ```ts
 * {
 *  name: string
 *  description: string
 *  type: string
 *  run: Promise<() => void>
 * }
 * ```
 */
export interface Command extends ChatInputApplicationCommandData{
    run: (client: Client, interaction: BaseCommandInteraction) => void;
}