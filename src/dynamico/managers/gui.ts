import { DiscordComponentTypes } from "@dynamico/interfaces/ui";
import InitializeBase from "@internal/bases/initialize-base";
import ObjectBase from "@internal/bases/object-base";
import {
    APIEmbed,
    ButtonInteraction,
    ChannelType,
    EmbedBuilder,
    Interaction,
    InteractionReplyOptions,
    InteractionResponse,
    JSONEncodable,
    ModalSubmitInteraction,
    SelectMenuInteraction,
    UserSelectMenuInteraction
} from "discord.js";

import ComponentUIBase from "../ui/base/component-ui-base";

export class GUIManager extends InitializeBase {
    private userInterfaces = new Map<string, ComponentUIBase>;
    private callbacks = new Map<string, Function>;
    private continuesInteractions = new Map<string, InteractionResponse>;

    public static getName() {
        return "Dynamico/Managers/GUI";
    }

    public register( ui: typeof ComponentUIBase ) {
        const uiName = ui.getName();

        if ( this.userInterfaces.has( uiName ) ) {
            throw new Error( `User interface '${ uiName }' already exists` );
        }

        this.userInterfaces.set( uiName, new ui() );

        this.logger.info( this.register, `Registered user interface '${ uiName }'` );
    }

    public get( name: string ) {
        const result = this.userInterfaces.get( name );

        if ( ! result ) {
            throw new Error( `User interface '${ name }' does not exist` );
        }

        return result;
    }

    public storeCallback( sourceUI: ObjectBase, callback: Function, suffix = "" ) {
        let unique = sourceUI.getName() + ":" + callback.name.replace( "bound ", "" );

        if ( suffix ) {
            unique = unique + ":" + suffix;
        }

        if ( unique.length > 100 ) {
            this.logger.warn( this.storeCallback, `Callback '${ unique }' is too long` );

            unique = unique.replace( "Dynamico/", "" );

            if ( unique.length > 100 ) {
                this.logger.error( this.storeCallback, `Callback '${ unique }' is still too long` );

                unique = unique.substring( 0, 100 );
            }
        }

        this.logger.debug( this.storeCallback, `Storing callback '${ unique }'` );

        this.callbacks.set( unique, callback );

        return unique;
    }

    public getCallback( unique: string, middleware: ( interaction: Interaction ) => Promise<boolean>  ) {
        const result = this.callbacks.get( unique );

        if ( ! result ) {
            throw new Error( `Callback '${ unique }' does not exist` );
        }

        return async ( interaction: Interaction ) => {
            if ( await middleware( interaction ) ) {
                return result( interaction );
            }
        };
    }

    public createEmbed( title: string, content?: string ) {
        const embed = new EmbedBuilder()
            .setTitle( title );

        if ( content ) {
            embed.setDescription( content );
        }

        return embed;
    }

    public async continuesMessage( interaction: ModalSubmitInteraction | ButtonInteraction | UserSelectMenuInteraction | SelectMenuInteraction,
                                   message: string|false,
                                   embeds: ( JSONEncodable<APIEmbed> | APIEmbed )[] = [],
                                   components: DiscordComponentTypes[] = [] ) {
        if ( interaction.channel?.type && ChannelType.GuildVoice === interaction.channel.type ) {
            const args: InteractionReplyOptions = {
                ephemeral: true,
                embeds,
            };

            if ( message ) {
                args.content = message;
            }

            if ( components ) {
                args.components = components;
            }

            const isInteractionExist = this.continuesInteractions.has( interaction.channel.id );

            if ( ! isInteractionExist ) {
                const defer = await interaction.reply( args );

                this.continuesInteractions.set( interaction.channel.id, defer );

                return;
            }

            const defer = this.continuesInteractions.get( interaction.channel.id );

            if ( defer && defer.interaction.isRepliable() ) {
                defer.interaction.deleteReply();

                const newDefer = await interaction.reply( args );

                this.continuesInteractions.set( interaction.channel.id, newDefer );
            }
        }
    }
}

export const guiManager = new GUIManager();

export default guiManager;
