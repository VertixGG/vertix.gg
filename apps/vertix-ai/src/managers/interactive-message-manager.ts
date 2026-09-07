import crypto from "crypto";

import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";

import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

import { PrismaAIClient } from "@vertix.gg/prisma/ai-client";

import type { ButtonInteraction, Client, EmbedField, SendableChannels } from "discord.js";

/** Discord allows five buttons per row, and this sends a single row. */
const MAX_BUTTONS = 5;

/** Prefix that marks a custom id as belonging to a runtime-created button. */
export const AI_BUTTON_PREFIX = "ai-btn:";

const STYLES: Record<string, ButtonStyle> = {
    primary: ButtonStyle.Primary,
    secondary: ButtonStyle.Secondary,
    success: ButtonStyle.Success,
    danger: ButtonStyle.Danger
};

export type InteractiveButtonSpec = {
    label: string;
    response: string;
    style?: string;
    emoji?: string;
};

export type InteractiveEmbedSpec = {
    title?: string;
    description?: string;
    color?: number;
    fields?: EmbedField[];
    footer?: string;
};

/**
 * Posts embeds with working buttons under this bot's own identity.
 *
 * The `ui_*` MCP tools do this by asking Vertix's UI runtime over IPC, which
 * means a different bot renders and posts. This builds the message with this
 * app's own Discord client instead, so what appears in the channel is this bot.
 */
export class InteractiveMessageManager extends InitializeBase {
    private static instance: InteractiveMessageManager;

    private client: Client | null = null;

    public static getName() {
        return "VertixAI/Managers/InteractiveMessage";
    }

    public static getInstance(): InteractiveMessageManager {
        if ( !InteractiveMessageManager.instance ) {
            InteractiveMessageManager.instance = new InteractiveMessageManager();
        }

        return InteractiveMessageManager.instance;
    }

    public static get $() {
        return InteractiveMessageManager.getInstance();
    }

    public setClient( client: Client ): void {
        this.client = client;
    }

    public async send(
        channelId: string,
        embed: InteractiveEmbedSpec,
        buttons: InteractiveButtonSpec[]
    ): Promise<string> {
        if ( !this.client ) {
            return "Tool error: Discord client is not ready yet.";
        }

        const channel = await this.client.channels.fetch( channelId ).catch( () => null );

        if ( !channel?.isSendable() ) {
            return `Tool error: channel ${ channelId } is not reachable or cannot be posted to.`;
        }

        const guildId = "guildId" in channel ? String( channel.guildId ) : "";

        const rows = await this.buildButtons( guildId, channelId, buttons.slice( 0, MAX_BUTTONS ) );

        const message = await ( channel as SendableChannels ).send( {
            embeds: [ this.buildEmbed( embed ) ],
            ...( rows ? { components: [ rows ] } : {} )
        } );

        this.logger.log(
            this.send,
            `Sent interactive message '${ message.id }' with '${ buttons.length }' button(s) to '${ channelId }'`
        );

        return `Posted the message to <#${ channelId }> with ${ buttons.length } button(s). Message id: ${ message.id }.`;
    }

    /** Returns the stored reply for a button, or null when it is not one of ours. */
    public async resolveButton( interaction: ButtonInteraction ): Promise<string | null> {
        if ( !interaction.customId.startsWith( AI_BUTTON_PREFIX ) ) {
            return null;
        }

        const token = interaction.customId.slice( AI_BUTTON_PREFIX.length );

        const stored = await PrismaAIClient.$.getClient().aIInteractiveButton.findUnique( { where: { token } } );

        if ( !stored ) {
            // The button outlived its row - the database was cleared, or it was
            // posted by a different deployment.
            return "That button is no longer active.";
        }

        return stored.response;
    }

    private buildEmbed( spec: InteractiveEmbedSpec ): EmbedBuilder {
        const embed = new EmbedBuilder();

        if ( spec.title ) {
            embed.setTitle( spec.title );
        }

        if ( spec.description ) {
            embed.setDescription( spec.description );
        }

        if ( "number" === typeof spec.color ) {
            embed.setColor( spec.color );
        }

        if ( spec.fields?.length ) {
            embed.addFields( spec.fields );
        }

        if ( spec.footer ) {
            embed.setFooter( { text: spec.footer } );
        }

        return embed;
    }

    private async buildButtons(
        guildId: string,
        channelId: string,
        buttons: InteractiveButtonSpec[]
    ): Promise<ActionRowBuilder<ButtonBuilder> | null> {
        if ( !buttons.length ) {
            return null;
        }

        const row = new ActionRowBuilder<ButtonBuilder>();

        for ( const button of buttons ) {
            const token = crypto.randomBytes( 8 ).toString( "hex" );

            await PrismaAIClient.$.getClient().aIInteractiveButton.create( {
                data: { token, guildId, channelId, label: button.label, response: button.response }
            } );

            const built = new ButtonBuilder()
                .setCustomId( `${ AI_BUTTON_PREFIX }${ token }` )
                .setLabel( button.label.slice( 0, 80 ) )
                .setStyle( STYLES[ button.style ?? "primary" ] ?? ButtonStyle.Primary );

            if ( button.emoji ) {
                built.setEmoji( button.emoji );
            }

            row.addComponents( built );
        }

        return row;
    }
}

export default InteractiveMessageManager;
