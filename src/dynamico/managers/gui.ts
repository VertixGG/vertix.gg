import {
    ActionRowData,
    APIActionRowComponent,
    APIEmbed,
    APIMessageActionRowComponent,
    ButtonInteraction,
    CommandInteraction,
    EmbedBuilder,
    InteractionReplyOptions,
    InteractionResponse,
    JSONEncodable,
    MessageActionRowComponentBuilder,
    MessageActionRowComponentData,
    ModalSubmitInteraction,
    SelectMenuInteraction,
    UserSelectMenuInteraction,
} from "discord.js";

import { ContinuesInteractionTypes, UIInteractionTypes } from "@dynamico/interfaces/ui";

import Debugger from "@dynamico/utils/debugger";

import UIBase from "@dynamico/ui/base/ui-base";
import UIGroupBase from "@dynamico/ui/base/ui-group-base";

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
    private static instance: GUIManager;

    private userInterfaces = new Map<string, UIBase>;
    private callbacks = new Map<string, Function>;
    private continuesInteractions = new Map<string, InteractionResponse>;
    private debugger: Debugger;

    public static getInstance() {
        if ( ! this.instance ) {
            this.instance = new GUIManager();
        }

        return this.instance;
    }

    public static getName() {
        return "Dynamico/Managers/GUI";
    }

    public constructor() {
        super();

        this.debugger = new Debugger( this );
    }

    public register( ui: typeof UIBase ) {
        const uiName = ui.getName();

        if ( this.userInterfaces.has( uiName ) ) {
            throw new Error( `User interface '${ uiName }' already exists` );
        }

        this.userInterfaces.set( uiName, new ui() );

        this.logger.info( this.register, `Registered user interface '${ uiName }'` );
    }

    public get( name: string, force = false ): UIBase|UIGroupBase {
        const result = this.userInterfaces.get( name );

        if ( ! force && ! result ) {
            throw new Error( `User interface '${ name }' does not exist` );
        }

        // TODO: Find a better way to do this, it may return undefined.
        return result as UIBase;
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

        // Remove every character after '>' including '>' itself, TODO: duplicate code.
        unique = unique.replace( />(.*)/g, "" );

        this.callbacks.set( unique, callback );

        return unique;
    }

    public async getCallback( unique: string, middleware: ( ( interaction: UIInteractionTypes ) => Promise<boolean> )[] ) {
        // Remove every character after '>' including '>' itself, TODO: duplicate code.
        unique = unique.replace( />(.*)/g, "" );

        const result = this.callbacks.get( unique );

        if ( ! result ) {
            return () => {
                this.logger.error( this.getCallback, `Callback '${ unique }' does not exist` );

                return true;
            };
        }

        // Run the middlewares.
        return async ( interaction: UIInteractionTypes ) => {
            for ( const middlewareItem of middleware ) {
                if ( ! await middlewareItem( interaction ) ) {
                    return false;
                }
            }

            return result( interaction );
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

    public async sendContinuesMessage( interaction: ContinuesInteractionTypes | CommandInteraction, component: UIBase, args?: any ): Promise<InteractionResponse | void>;
    public async sendContinuesMessage( interaction: ContinuesInteractionTypes, args: ContinuesInteractionArgs ): Promise<InteractionResponse | void>;
    public async sendContinuesMessage( interaction: ContinuesInteractionTypes, message: string ): Promise<InteractionResponse | void>;
    public async sendContinuesMessage( interaction: ContinuesInteractionTypes, context: ContinuesInteractionArgs | UIBase | string, args?: any ): Promise<InteractionResponse | void> {
        // Validate interaction type.
        const isInstanceTypeOfContinuesInteraction = interaction instanceof ButtonInteraction ||
            interaction instanceof SelectMenuInteraction ||
            interaction instanceof UserSelectMenuInteraction ||
            interaction instanceof ModalSubmitInteraction ||
            interaction instanceof CommandInteraction ||
            interaction.isCommand() ||
            interaction.isStringSelectMenu?.();

        if ( ! isInstanceTypeOfContinuesInteraction || undefined === interaction.channel?.type ) {
            this.logger.error( this.sendContinuesMessage,
                `Interaction type '${ interaction.constructor.name }' is not supported`
            );
            return;
        }

        if ( interaction.channel ) {
            let message: string | undefined,
                embeds: ( JSONEncodable<APIEmbed> | APIEmbed )[] | undefined,
                components: ComponentTypes[] | undefined,
                replyArgs: InteractionReplyOptions = {};

            if ( typeof context === "string" ) {
                message = context;
            } else if ( context instanceof UIBase ) {
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

            const sharedId = interaction.channel.id + interaction.user.id,
                isInteractionExist = this.continuesInteractions.has( sharedId );

            if ( ! isInteractionExist ) {
                // Validate interaction
                if ( interaction.isRepliable() ) {
                    return interaction.reply( replyArgs )
                        .catch( e => this.logger.warn( this.sendContinuesMessage, "", e ) )
                        .then( defer => {
                            if ( defer && interaction.channel ) {
                                this.continuesInteractions.set( sharedId, defer );
                            }

                            return defer;
                        } );
                }

                return;
            }

            const defer = this.continuesInteractions.get( sharedId );

            if ( defer?.interaction.isRepliable() ) {
                const warn = ( e: any ) => this.logger.warn( this.sendContinuesMessage, "", e );
                return defer.interaction.deleteReply().catch( warn ).then( async () => {
                    return interaction.reply( replyArgs ).catch( warn ).then( newDefer => {
                        if ( interaction.channel && newDefer ) {
                            this.continuesInteractions.set( sharedId, newDefer );
                        } else {
                            warn( "Interaction channel or defer is undefined" );
                        }

                        return newDefer;
                    } );
                } );
            }
        }
    }

    public async deleteContinuesInteraction( interaction: ContinuesInteractionTypes ) {
        if ( ! interaction.channel ) {
            return;
        }

        const defer = this.continuesInteractions.get( interaction.channel.id + interaction.user.id );

        if ( defer?.interaction.isRepliable() ) {
            return defer.interaction.deleteReply()
                .catch( ( e ) => this.logger.warn( this.deleteContinuesInteraction, "", e ) )
                .then( () => this.continuesInteractions.delete( interaction?.channel?.id + interaction.user.id ) );
        }
    }
}

export default GUIManager;

export const guiManager = GUIManager.getInstance();
