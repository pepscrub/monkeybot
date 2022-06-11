import { Client, ButtonInteraction, TextBasedChannel } from 'discord.js';

export enum ButtonTypes {
    report = 'button_report',
    delete_document = 'button_delete_document',
    ignore_document = 'button_ignore_document'
    
}

export interface Button {
    name: string;
    run: (client: Client, interaction: ButtonInteraction) => void;
}