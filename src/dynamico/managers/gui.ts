import {
    ActionRowData,
    APIActionRowComponent,
    APIEmbed,
    APIMessageActionRowComponent,
    ButtonInteraction,
    ChannelType,
    EmbedBuilder,
    Interaction,
    InteractionReplyOptions,
    InteractionResponse,
    JSONEncodable,
    MessageActionRowComponentBuilder,
    MessageActionRowComponentData,
    ModalSubmitInteraction,
    SelectMenuInteraction,
    UserSelectMenuInteraction,
} from "discord.js";

import { ContinuesInteractionTypes } from "@dynamico/interfaces/ui";

import Debugger from "@dynamico/utils/debugger";

import UIComponentBase from "@dynamico/ui/base/ui-component-base";

import InitializeBase from "@internal/bases/initialize-base";
import ObjectBase from "@internal/bases/object-base";

type ComponentTypes = (
    | JSONEncodable<APIActionRowComponent<APIMessageActionRowComponent>>
    | ActionRowData<MessageActionRowComponentData | MessageActionRowComponentBuilder>
    | APIActionRowComponent<APIMessageActionRowComponent>
    );

interface ContinuesInteractionArgs {
    message?: string,
    embeds?: ( JSONEncodable<APIEmbed> | APIEmbed )[],
    components?: ComponentTypes[]
}

export class GUIManager extends InitializeBase {
    private userInterfaces = new Map<string, UIComponentBase>;
    private callbacks = new Map<string, Function>;
    private continuesInteractions = new Map<string, InteractionResponse>;
    private debugger: Debugger;

    public static getName() {
        return "Dynamico/Managers/GUI";
    }

    public constructor() {
        super();

        this.debugger = new Debugger( this );
    }

    public register( ui: typeof UIComponentBase ) {
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

        this.debugger.log( this.storeCallback, `Storing callback '${ unique }'` );

        this.callbacks.set( unique, callback );

        return unique;
    }

    public getCallback( unique: string, middleware: ( interaction: Interaction ) => Promise<boolean> ) {
        const result = this.callbacks.get( unique );

        if ( ! result ) {
            return () => {
                this.logger.error(  this.getCallback, `Callback '${ unique }' does not exist` );

                return true;
            };
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

    public async sendContinuesMessage( interaction: ContinuesInteractionTypes, component: UIComponentBase, args?: any ): Promise<void>;
    public async sendContinuesMessage( interaction: ContinuesInteractionTypes, args: ContinuesInteractionArgs ): Promise<void>;
    public async sendContinuesMessage( interaction: ContinuesInteractionTypes, message: string ): Promise<void>;
    public async sendContinuesMessage( interaction: ContinuesInteractionTypes, context: ContinuesInteractionArgs | UIComponentBase | string, args?: any ): Promise<void> {
        // Validate interaction type.
        const isInstanceTypeOfContinuesInteraction = interaction instanceof ButtonInteraction ||
            interaction instanceof SelectMenuInteraction ||
            interaction instanceof UserSelectMenuInteraction ||
            interaction instanceof ModalSubmitInteraction ||
            interaction.isStringSelectMenu();

        if ( ! isInstanceTypeOfContinuesInteraction ) {
            this.logger.error( this.sendContinuesMessage,
                `Interaction type '${ interaction.constructor.name }' is not supported`
            );
            return;
        }

        if ( interaction.channel?.type && ChannelType.GuildVoice === interaction.channel.type ) {
            let message: string | undefined,
                embeds: ( JSONEncodable<APIEmbed> | APIEmbed )[] | undefined,
                components: ComponentTypes[] | undefined,
                replyArgs: InteractionReplyOptions = {};

            if ( typeof context === "string" ) {
                message = context;
            } else if ( context instanceof UIComponentBase ) {
                replyArgs = await context.getMessage( interaction, args );
                replyArgs.ephemeral = true;
            } else {
                message = context.message;
                embeds = context.embeds;
                components = context.components;
            }

            if ( ! replyArgs.components && ! replyArgs.embeds && ! replyArgs.content ) {
                replyArgs = {
                    ephemeral: true,
                    embeds,
                };
            }

            if ( message ) {
                replyArgs.content = message;
            }

            if ( components ) {
                replyArgs.components = components;
            }

            const isInteractionExist = this.continuesInteractions.has( interaction.channel.id );

            if ( ! isInteractionExist ) {
                // Validate interaction
                if ( interaction.isRepliable() ) {
                    const defer = await interaction.reply( replyArgs );

                    this.continuesInteractions.set( interaction.channel.id, defer );
                }

                return;
            }

            const defer = this.continuesInteractions.get( interaction.channel.id );

            if ( defer && defer.interaction.isRepliable() ) {
                const warn = ( e: any ) => this.logger.warn( this.sendContinuesMessage, "", e );
                defer.interaction.deleteReply().catch( warn ).then( async () => {
                    interaction.reply( replyArgs ).catch( warn ).then( newDefer => {
                        if ( interaction.channel && newDefer ) {
                            this.continuesInteractions.set( interaction.channel.id, newDefer );
                        } else {
                            warn( "Interaction channel or defer is undefined" );
                        }
                    } );
                } );
            }
        }
    }
}

export const guiManager = new GUIManager();

export default guiManager;
