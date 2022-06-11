import { Client, ModalSubmitInteraction } from 'discord.js';
import { Button } from './button';
export enum ModalTypes {
    report = 'report_modal',
    confirmation = 'confirmation_modal',
    deleteDocument = 'delete_document_modal'
};

export enum ModalFields { 
    report_select = 'report_modal_select_menu',
    report_input = 'report_modal_user_input'
};

export interface Modal extends Omit<Button, "run"> {
    run: (client: Client, interaction: ModalSubmitInteraction) => void;
};