import {
    ButtonInteraction,
    ChannelType,
    Client,
    CommandInteraction,
    EmbedBuilder,
    Events,
    Interaction,
    ModalSubmitInteraction,
    SelectMenuInteraction,
    UserSelectMenuInteraction
} from "discord.js";

import { Commands } from "../interactions/commands";
import guiManager from "../managers/gui";

import GlobalLogger from "@dynamico/global-logger";
import {
    ChannelManager,
    MasterChannelManager
} from "@dynamico/managers";

import * as process from "process";

const globalLogger = GlobalLogger.getInstance();

export function interactionHandler( client: Client ) {
    client.on( Events.InteractionCreate, async ( interaction: Interaction ) => {
        if ( interaction.isCommand() || interaction.isContextMenuCommand() ) {
            await handleSlashCommand( client, interaction as CommandInteraction );
        } else if ( interaction.isButton() ) {
            await handleButton( client, interaction as ButtonInteraction );
        } else if ( interaction.isModalSubmit() ) {
            await handleModalSubmit( client, interaction );
        } else if ( interaction.isUserSelectMenu() || interaction.isStringSelectMenu() ) {
            await handleUserSelectMenuInteraction( client, interaction as UserSelectMenuInteraction );
        } else if ( process.env.debug_mode === "discord" ) {
            globalLogger.log( interactionHandler, "", interaction );
        }
    } );
};

const handleSlashCommand = async ( client: Client, interaction: CommandInteraction ): Promise<void> => {
    console.log( `Slash command '${ interaction.commandName }' was used by '${ interaction.user.username }'` );

    const slashCommand = Commands.find( c => c.name === interaction.commandName );

    if ( ! slashCommand ) {
        await interaction.followUp( { content: "An error has occurred" } );
        return;
    }

    await interaction.deferReply( {
        ephemeral: true,
    } );

    slashCommand.run( client, interaction );
};

async function authMiddleware( interaction: Interaction ) {
    // Only the channel owner can pass the middleware
    if ( interaction.channel?.type && ChannelType.GuildVoice === interaction.channel.type && interaction.guildId ) {
        const channel = await ChannelManager.getInstance().getChannel( interaction.guildId, interaction.channel.id, true );

        if ( channel?.userOwnerId === interaction.user.id ) {
            return true;
        }

        if ( interaction.isButton() || interaction.isStringSelectMenu() || interaction.isModalSubmit() ) {
            const embed = new EmbedBuilder(),
                masterChannel = await MasterChannelManager.getInstance().getByDynamicChannel( interaction, true );

            let message = "You should open your own channel and try again";

            if ( masterChannel ) {
                message = `${ message }:\n<#${ masterChannel.id }>`;
            }

            embed.setTitle( "Oops, this is not your channel !" );
            embed.setDescription( message );

            await interaction.reply( {
                embeds: [ embed ],
                ephemeral: true,
            } );
        }
    }

    return false;
}

async function handleButton( client: Client, interaction: ButtonInteraction ) {
    globalLogger.info( handleButton,
        `Button id '${ interaction.customId }' was used by '${ interaction.user.username }'`
    );

    await guiManager.getCallback( interaction.customId, authMiddleware )( interaction );
};

async function handleModalSubmit( client: Client, interaction: ModalSubmitInteraction ) {
    globalLogger.log( handleModalSubmit,
        `Modal submit id '${ interaction.customId }' was used by '${ interaction.user.username }'`
    );

    await guiManager.getCallback( interaction.customId, authMiddleware )( interaction );
}

async function handleUserSelectMenuInteraction( client: Client, interaction: UserSelectMenuInteraction | SelectMenuInteraction ) {
    globalLogger.log( handleUserSelectMenuInteraction,
        `UserSelectMenuInteraction|SelectMenuInteraction id '${ interaction.customId }' was used by '${ interaction.user.username }'`
    );

    await guiManager.getCallback( interaction.customId, authMiddleware )( interaction );
}
