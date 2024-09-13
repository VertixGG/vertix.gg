import process from "process";

import { DEFAULT_GUILD_SETTINGS_KEY_LANGUAGE } from "@vertix.gg/base/src/definitions/guild-data-keys";
import { ForceMethodImplementation } from "@vertix.gg/base/src/errors";

import { GuildDataManager } from "@vertix.gg/base/src/managers/guild-data-manager";

import { createDebugger } from "@vertix.gg/base/src/modules/debugger";
import { Logger } from "@vertix.gg/base/src/modules/logger";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import {
    ActionRowBuilder,
    BaseGuildTextChannel,
    BaseGuildVoiceChannel,
    ButtonBuilder,
    ComponentType,
    GuildChannel,
    Message
} from "discord.js";

import picocolors from "picocolors";

import { UIAdapterEntityBase } from "@vertix.gg/gui/src/bases/ui-adapter-entity-base";

import { UIArgsManager } from "@vertix.gg/gui/src/bases/ui-args-manager";

import { UI_CUSTOM_ID_SEPARATOR } from "@vertix.gg/gui/src/bases/ui-definitions";

import { UIInteractionMiddleware } from "@vertix.gg/gui/src/bases/ui-interaction-middleware";

import { UI_LANGUAGES_INITIAL_CODE } from "@vertix.gg/gui/src/bases/ui-language-definitions";

import type { UIAdapterReplyContext, UIAdapterStartContext } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { UIAdapterBuildSource, UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIService } from "@vertix.gg/gui/src//ui-service";

import type { UIModalBase } from "@vertix.gg/gui/src/bases/ui-modal-base";

import type {
    BaseMessageOptions,
    ButtonInteraction,
    ChannelType,
    InteractionEditReplyOptions,
    MessageComponentInteraction,
    ModalComponentData,
    ModalSubmitInteraction,
    PermissionsBitField,
    StringSelectMenuInteraction,
    UserSelectMenuInteraction
} from "discord.js";
import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";

const REGENERATE_BUTTON_ID = "regenerate-button";

const ADAPTER_CLEANUP_EPHEMERAL_TIMEOUT = Number( process.env.ADAPTER_CLEANUP_EPHEMERAL_TIMEOUT ) ||
    600000; // 10 minutes.

const ADAPTER_CLEANUP_STATIC_ARGS_TIMEOUT = Number( process.env.ADAPTER_CLEANUP_STATIC_ARGS_TIMEOUT ) ||
    600000; // 10 minutes.

/**
 * TChannel - The channel type that will be used if the adapter starts interaction.
 * TInteraction - The channel type that will be used if the adapter replies to interaction.
 */
export abstract class UIAdapterBase<
    // TODO: Generic are useless...
    TChannel extends UIAdapterStartContext,
    TInteraction extends UIAdapterReplyContext,
> extends UIAdapterEntityBase {
    private static staticLogger: Logger = new Logger( this.getName() );
    private static staticDebugger = createDebugger( this.getName(), "UI" );

    private static validatedOnce = false;

    private static ephemeralInteractions: {
        [ userIdPlusMessageId: string ]: {
            interaction: MessageComponentInteraction | ModalSubmitInteraction,
            rawCustomId: string,
        }
    } = {};

    private static staticArgs = new UIArgsManager( picocolors.green( "StaticArgs" ) );
    private static staticSystemArgs = new UIArgsManager( picocolors.red( "SystemArgs" ) );

    /**
     * Managing Discord messages sent in different channels.
     *
     * The class keeps track of started messages, by channel and message ID.
     */
    private channelStartedMessages = new class StartedMessages {
        // TODO: Clear them out after a while, figure out how it works.
        private messages: {
            [ channelId: string ]: {
                [ messageId: string ]: Message<true>,
            }
        } = {};

        public get( channelId: string ) {
            return this.messages[ channelId ];
        }

        public set( channelId: string, messageId: string, message: Message<true> ) {
            if ( ! this.messages[ channelId ] ) {
                this.messages[ channelId ] = {};
            }

            this.messages[ channelId ][ messageId ] = message;
        }

        public delete( channelId: string, messageId: string ): void;
        public delete( channelId: string ): void;

        public delete( channelId: string, messageId?: string ) {
            if ( messageId ) {
                delete this.messages[ channelId ][ messageId ];
            } else {
                delete this.messages[ channelId ];
            }
        }
    } ();

    private readonly argsManager: UIArgsManager;

    private dynamicArgs = new UIArgsManager( picocolors.blue( "DynamicArgs" ) );

    protected uiService: UIService;

    public static getName() {
        return "VertixGUI/UIAdapterBase";
    }

    public static getInstanceType() {
        return this.getComponent().getInstanceType();
    }

    public static validate( validateDefaultGroups = true ) {
        if ( this.validatedOnce ) {
            throw new Error( `Component: '${ this.getName() }' has already been validated` );
        }

        this.getComponent().validate( validateDefaultGroups );

        this.validatedOnce = true;
    }

    public static cleanupTimer() {
        if ( ! UIAdapterBase.staticArgs ) {
            return;
        }

        const data = UIAdapterBase.staticArgs.getData();

        for ( const messageId in data ) {
            const messageData = data[ messageId ];

            for ( const id in messageData ) {
                const channelData = messageData[ id ];

                if ( Date.now() - channelData.updatedAt.getTime() > ADAPTER_CLEANUP_STATIC_ARGS_TIMEOUT ) {
                    UIAdapterBase.staticArgs.deleteArgs( messageId, id );
                    UIAdapterBase.staticSystemArgs.deleteArgs( messageId, id );
                }
            }
        }

        // Delete old ephemeral interactions.
        for ( const id in UIAdapterBase.ephemeralInteractions ) {
            const { interaction } = UIAdapterBase.ephemeralInteractions[ id ];

            if ( Date.now() - interaction.createdAt.getTime() > ADAPTER_CLEANUP_EPHEMERAL_TIMEOUT ) {
                UIAdapterBase.staticDebugger.log( UIAdapterBase.cleanupTimer,
                    `Deleting old ephemeral interaction: '${ interaction.id }' from memory`
                );

                delete UIAdapterBase.ephemeralInteractions[ id ];
            }
        }

        UIAdapterBase.staticDebugger.dumpDown( UIAdapterBase.cleanupTimer, {
            staticArgs: UIAdapterBase.staticArgs.getData(),
            systemArgs: UIAdapterBase.staticSystemArgs.getData(),
            ephemeralInteractions: Object.values( UIAdapterBase.ephemeralInteractions ).map( ( { interaction, rawCustomId } ) => {
                return {
                    id: interaction.id,
                    createdAt: interaction.createdAt,
                    customId: interaction.customId,
                    rawCustomId,
                };
            } ),
        } );
    }

    protected static getMiddlewares() {
        return [];
    }

    public constructor( protected options: TAdapterRegisterOptions ) {
        super( options );

        this.uiService = ServiceLocator.$.get( "VertixGUI/UIService" );

        if ( this.$$.staticDebugger.isEnabled() ) {
            this.$$.staticDebugger.enableCleanupDebug( this );
        }

        if ( this.isStatic() ) {
            this.argsManager = UIAdapterBase.staticArgs;
        } else {
            this.argsManager = this.dynamicArgs;
        }

        if ( ! this.shouldDisableMiddleware || ! this.shouldDisableMiddleware() ) {
            new UIInteractionMiddleware( this, {
                onChannelFailed: async ( channel, channelTypes ) => {
                    await this.uiService.get( "VertixGUI/InternalAdapters/InvalidChannelTypeAdapter" )?.ephemeral( channel, {
                        channelTypes,
                    } );
                },

                onInteractionFailed: async ( interaction, missingPermissions ) => {
                    await this.uiService.get( "VertixGUI/InternalAdapters/MissingPermissionsAdapter" )?.ephemeral( interaction, {
                        missingPermissions,
                    } );
                },
            } );
        }
    }

    public get $$() {
        return this.constructor as typeof UIAdapterBase;
    }

    public async build( args: UIArgs, from: UIAdapterBuildSource = "unknown", context: "direct-message" | string | TInteraction | TChannel | Message<true> ) {
        await this.getComponent().waitUntilInitialized();

        const ownerId = "string" === typeof context ? context : context.guildId;

        if ( ownerId === "direct-message" ) {
            args._language = UI_LANGUAGES_INITIAL_CODE;
        } else if ( ownerId && ! args._language ) {
            // TODO: Move to hook.
            const language = await GuildDataManager.$.getData( {
                ownerId: "string" === typeof context ? context : context.guildId,
                key: DEFAULT_GUILD_SETTINGS_KEY_LANGUAGE,
                default: UI_LANGUAGES_INITIAL_CODE,
                cache: true,
            }, true );

            args._language = language?.values?.[ 0 ] ?? UI_LANGUAGES_INITIAL_CODE;
        }

        if ( "unknown" !== from ) {
            await this.onBeforeBuild?.( args, from, context );
        }

        const schema = await this.getComponent().build( args );

        if ( "unknown" !== from ) {
            await this.onAfterBuild?.( args, from, context );
        }

        return schema;
    }

    /**
     * Sends a message to a channel.
     */
    public async send( channel: TChannel, sendArgs?: UIArgs ) {
        // TODO: When args switching from one adapter to another, the old args should be cleared out.
        // TODO: Old interaction should be cleared out.
        const args = await this.getArgsInternal( channel, sendArgs );

        this.$$.staticDebugger.dumpDown( this.send, args, "getStartArgs" );

        await this.build( args, "send", channel );

        const message = this.getMessage( "send", channel, sendArgs );

        if ( channel instanceof BaseGuildTextChannel || channel instanceof BaseGuildVoiceChannel ) {
            const result = await channel.send( message ).catch( ( e ) => {
                this.$$.staticLogger.error( this.ephemeral, "", e );

                return null;
            } );

            if ( ! result ) {
                return null;
            }

            this.channelStartedMessages.set( channel.id, result.id, result );

            // New Interaction?
            this.argsManager.setInitialArgs( this, result.id, args );

            return result;
        }

        throw new Error( "Not implemented" );
    }

    public async sendToUser( guildId: string | "direct-message", userId: string, argsFromManager: UIArgs ) {
        this.$$.staticDebugger.log(
            this.sendToUser, this.getName() + ` - Sending to user: '${ userId }' from guild id: '${ guildId }'`
        );

        await this.build( argsFromManager, "send-to-user", guildId );

        await ( await this.uiService.getClient().users.fetch( userId ) )
            .send( this.getMessage() )
            .catch(
                () => this.$$.staticLogger.error( this.sendToUser, `Failed to send message to user, userId: '${ userId }'` )
            );
    }

    public async editReply( interaction: TInteraction, newArgs?: UIArgs ) {
        // TODO: Add log middleware.
        this.$$.staticDebugger.log( this.editReply, this.getName() + ` - Editing reply: '${ interaction.id }'` );

        if ( await this.isArgsExpiredInternal( interaction ) ) {
            return;
        }

        if ( this.isDynamic() ) {
            const argsId = this.argsManager.getArgsId( interaction ),
                args = await this.getArgsInternal( interaction as TInteraction, newArgs );

            this.getArgsManager().setInitialArgs( this, argsId, args );
        }

        const args = this.argsManager.getArgs( this, interaction );

        await this.build( args, "edit", interaction );

        const message = this.getMessage( "edit", interaction, newArgs );

        if ( interaction.isUserSelectMenu() || interaction.isChannelSelectMenu() ) {
            const disabledComponents = JSON.parse( JSON.stringify( message.components ) );

            disabledComponents.forEach( ( row: any ) => {
                for ( const component of row.components ) {
                    if ( component.type === ComponentType.UserSelect || component.type === ComponentType.ChannelSelect ) {
                        row.components.splice( row.components.indexOf( component ), 1 );
                    }
                }
            } );

            const reindexDisabledComponents = [];

            for ( const row of disabledComponents ) {
                if ( row.components.length > 0 ) {
                    reindexDisabledComponents.push( row );
                }
            }

            await interaction.update( {
                components: reindexDisabledComponents,
                embeds: message.embeds,
            } ).catch( ( e ) => {
                this.$$.staticLogger.error( this.editReply, "", e );
            } );
        } else {
            if ( ! interaction.isCommand() && ! interaction.deferred ) {
                // TODO: Use dedicated method.
                if ( false === await interaction.deferUpdate().catch( ( e ) => {
                    this.$$.staticLogger.error( this.editReply, "", e );

                    return false;
                } ) ) {
                    return;
                }
            }
        }

        return await interaction.editReply( message ).catch( ( e ) => {
            this.$$.staticLogger.error( this.editReply, "", e );
        } );
    }

    public async editMessage( message: Message<true>, newArgs?: UIArgs ) {
        const argsId = await this.setDynamicInitialArgs( message, newArgs );

        const args = this.argsManager.getArgsById( this, argsId );

        await this.build( args, "edit-message", message );

        const newMessage = this.getMessage( "edit-message", message.channel as TChannel, newArgs );

        return await message.edit( newMessage );
    }

    protected async setDynamicInitialArgs( message: Message<true>, newArgs?: UIArgs ) {
        const argsId = message.id;

        let args = this.argsManager.getArgsById( this, argsId );

        // TODO: Ensure how it possible that dynamic args exist.
        if ( ! args && this.isDynamic() ) {
            const argsInternal = await this.getArgsInternal( message, newArgs || {} );

            this.argsManager.setInitialArgs( this, argsId, argsInternal );
        }

        return argsId;
    }

    public async run( interaction: MessageComponentInteraction | ModalSubmitInteraction ) {
        const customId = this.getCustomIdForEntity( interaction.customId ),
            entityName = customId.split( UI_CUSTOM_ID_SEPARATOR )[ 1 ];

        this.$$.staticDebugger.log( this.run, this.getName() + ` - Running: '${ customId }'` );

        if ( interaction.isMessageComponent() && REGENERATE_BUTTON_ID === entityName && this.regenerate ) {
            this.$$.staticLogger.admin( this.run,
                `⚡ Regenerating: '${ this.getName() }' - (${ interaction.guild?.name }) (${ interaction.guild?.memberCount })`
            );

            return this.regenerate( interaction as MessageComponentInteraction<"cached"> );
        }

        if ( await this.isArgsExpiredInternal( interaction as TInteraction ) ) {
            return;
        }

        if ( this.isDynamic() ) {
            const args = await this.getArgsInternal( interaction as TInteraction );

            await this.build( args, "run", interaction as TInteraction );
        }

        await this.runEntityCallback( entityName, interaction as TInteraction );
    }

    public async runInitial( interaction: MessageComponentInteraction, args?: UIArgs ) {
        this.argsManager.setInitialArgs( this, this.argsManager.getArgsId( interaction as TInteraction ), args || {}, {
            overwrite: true,
        } );

        return this.run( interaction as MessageComponentInteraction );
    }

    public async ephemeral( interaction: TInteraction, sendArgs?: UIArgs, deletePreviousInteraction = this.shouldDeletePreviousReply?.() || false ) {
        const args = await this.getArgsInternal( interaction, sendArgs ),
            caller = this.ephemeral.name;

        await this.build( args, "reply", interaction );

        const message =  this.getMessage( "reply", interaction, sendArgs ),
            shouldDeletePreviousInteraction = deletePreviousInteraction && ! interaction.isCommand() && interaction.message?.id,
            messageId = shouldDeletePreviousInteraction && interaction.message?.id || 0,
            interactionInternalId = interaction.user.id + UI_CUSTOM_ID_SEPARATOR + messageId;

        if ( shouldDeletePreviousInteraction && this.$$.ephemeralInteractions[ interactionInternalId ] ) {
            // TODO: If interaction not used for awhile, it will be expired.
            const previousInteraction =
                this.$$.ephemeralInteractions[ interactionInternalId ].interaction;

            // TODO: Avoid catching here.
            await previousInteraction.deleteReply().catch( ( e ) => {
                this.$$.staticLogger.error( caller, "", e );
            } );
        }

        return interaction.reply( {
            ... message,
            ephemeral: true,
        } ).then( _result => {
            if ( shouldDeletePreviousInteraction ) {
                this.$$.ephemeralInteractions[ interactionInternalId ] = {
                    interaction,
                    rawCustomId: this.getCustomIdForEntity( interaction.customId ),
                };
            }
        } ).catch( ( e ) => {
            this.$$.staticLogger.error( caller, "", e );
        } );
    }

    // TODO: Determine which interaction available showModal, and use it instead of MessageComponentInteraction.
    // TODO: Method does not favor dynamic/static approach.
    public async showModal( modalName: string, interaction: MessageComponentInteraction<"cached"> ) {
        const args = await this.getArgsInternal( interaction as TInteraction, {} );

        // const entity = this.$$.getComponent()
        //     .getEntities( { modals: true })
        //     .find( ( entity ) => entity.getName() === modalName );
        //
        // if ( ! entity ) {
        //     throw new Error( `Modal entity: '${ modalName }' not found` );
        // }

        // this.buildEntityMap( entity );

        await this.build( args, "show-modal", interaction as TInteraction );

        const entityMapped = this.getEntityMap( modalName ),
            modalInstance = this.getEntityInstance( entityMapped.entity ) as UIModalBase,
            modal = this.buildModal( modalInstance );

        await interaction.showModal( modal )
            .catch( ( error ) => this.$$.staticLogger.error( this.showModal, "", error ) )
            .then( () => {
                // this.deleteArgs( this.getArgsId( interaction as TInteraction ) );
            } );
    }

    public async waitUntilInitialized() {
        return this.getComponent().waitUntilInitialized();
    }

    public getStartedMessages( channel: TChannel ) {
        return this.channelStartedMessages.get( channel.id );
    }

    public getPermissions(): PermissionsBitField {
        throw new ForceMethodImplementation( this, "getPermissions" );
    }

    public getChannelTypes(): ChannelType[] {
        throw new ForceMethodImplementation( this, "getChannelTypes" );
    }

    public deleteArgs( interaction: TInteraction ) {
        const id = this.getArgsManager().getArgsId( interaction );

        this.getSystemArgs().deleteArgs( this, id );
        this.getArgsManager().deleteArgs( this, id );
    }

    public async deletedStartedMessagesInternal( channel: TChannel ) {
        const startedMessages = this.channelStartedMessages.get( channel.id );

        if ( startedMessages ) {
            const messages = Object.entries( startedMessages ) || [],
                messageLength = messages.length;

            for ( let i = 0 ; i < messageLength ; i++ ) {
                const [ id, message ] = messages[ i ];

                await message.delete();

                this.channelStartedMessages.delete( channel.id, id );
            }

            // If started channel has no messages, deletedStartedMessagesInternal it.
            if ( ! Object.keys( this.channelStartedMessages.get( channel.id )?.messages || {} ).length ) {
                this.getArgsManager().deleteArgs( this, channel.id );

                this.channelStartedMessages.delete( channel.id );
            }
        }
    }

    public async deleteRelatedComponentMessagesInternal( channel: TChannel ) {
        const supported = channel instanceof BaseGuildTextChannel || channel instanceof BaseGuildVoiceChannel;

        if ( supported ) {
            const messages = await channel.messages.fetch().catch( ( e ) => {
                this.$$.staticLogger.error( this.deleteRelatedComponentMessagesInternal, "", e );
            } );

            if ( ! messages ) {
                return;
            }

            // Remove all messages that have adapter's components.
            const messagesToDelete = messages.filter( ( message ) => {
                const json = message.toJSON() as any;

                if ( json?.components ) {
                    return json.components.some( ( row: any ) =>
                        row.components.some( ( component: any ) =>
                            component.custom_id?.startsWith( this.getName() )
                        )
                    );
                }
            } );

            await channel.bulkDelete( messagesToDelete );
        }
    }

    public async deleteRelatedEphemeralInteractionsInternal( interaction: TInteraction, customId: string, count: number ) {
        let deletedCount = 0;

        for ( const [ key, it ] of Object.entries( this.$$.ephemeralInteractions ) ) {
            if ( deletedCount >= count ) {
                break;
            }

            if ( key.includes( interaction.user.id ) && it.rawCustomId === customId ) {
                await it.interaction.deleteReply().catch( ( e ) => {
                    this.$$.staticLogger.error( this.ephemeral, "", e );
                } );

                delete this.$$.ephemeralInteractions[ key ];

                ++deletedCount;
            }
        }

        return deletedCount;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async isPassingInteractionRequirementsInternal( interaction: TInteraction ): Promise<boolean> {
        return true;
    }

    // Can those be in interface?
    protected async onBeforeBuild?( args: UIArgs, from: UIAdapterBuildSource, context?: string | TInteraction | TChannel | Message<true> ): Promise<void>;

    protected async onAfterBuild?( args: UIArgs, from: UIAdapterBuildSource, context?: string | TInteraction | TChannel | Message<true> ): Promise<void>;

    protected shouldDisableMiddleware?(): boolean;

    protected shouldRequireArgs?( interaction?: TInteraction, args?: UIArgs ): boolean;

    protected shouldDeletePreviousReply?(): boolean;

    protected async regenerate?( interaction: MessageComponentInteraction<"cached"> ): Promise<void>;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected getStartArgs( channel?: TChannel, argsFromManager?: UIArgs ): Promise<UIArgs> | {} {
        throw new ForceMethodImplementation( this, "getStartArgs" );
    };

    // TODO: In reply context there are always interaction, ( ensure ).
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected getReplyArgs( interaction?: TInteraction, argsFromManager?: UIArgs ): Promise<UIArgs> | {} {
        throw new ForceMethodImplementation( this, "getReplyArgs" );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected getEditMessageArgs?( message?: Message<true>, argsFromManager?: UIArgs ): Promise<UIArgs> | {} {
        throw new ForceMethodImplementation( this, "getEditMessageArgs" );
    }

    protected buildModal( modal: UIModalBase ): ModalComponentData {
        const schema = modal.getSchema();

        return {
            ... schema.attributes,
            customId: this.generateCustomIdForEntity( schema ),
            components: this.buildComponentsBySchema( schema.entities ),
        };
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected getMessage( from?: UIAdapterBuildSource, context?: TChannel | TInteraction, argsFromManager?: UIArgs ): BaseMessageOptions {
        const result: BaseMessageOptions = {
            embeds: [],
            components: [],
            content: "",
        };

        let schema = this.getComponent().getSchema();

        switch ( schema.type ) {
            case "component":
                if ( schema.entities.embeds ) {
                    result.embeds = schema.entities.embeds.map( ( embed: any ) => embed.attributes );
                }

                if ( schema.entities.elements ) {
                    result.components = this.buildComponentsBySchema( schema.entities.elements );
                }
                break;

            default:
                throw new Error( `Unknown schema type: '${ schema.type }'` );
        }

        return result;
    }

    protected getArgsManager() {
        return this.argsManager;
    }

    protected getSystemArgs() {
        return UIAdapterBase.staticSystemArgs;
    }

    protected bindButton<TBindInteraction = ButtonInteraction<"cached">>( buttonName: string, callback: ( interaction: TBindInteraction ) => Promise<void> ) {
        const buttonMap = this.getEntityMap( buttonName );

        this.storeEntityCallback( buttonMap, callback );
    }

    protected bindModal<TBindInteraction = ModalSubmitInteraction<"cached">>( modalName: string, callback: ( interaction: TBindInteraction ) => Promise<void> ) {
        const modalMap = this.getEntityMap( modalName );

        this.storeEntityCallback( modalMap, callback );
    }

    protected bindModalWithButton<TBindInteraction = ModalSubmitInteraction<"cached">>( buttonName: string, modalName: string, callback: ( interaction: TBindInteraction ) => Promise<void> ) {
        this.bindModal<TBindInteraction>( modalName, callback );

        this.bindButton( buttonName, async ( interaction ) => {
            await this.showModal( modalName, interaction );
        } );
    }

    protected bindSelectMenu<TBindInteraction = StringSelectMenuInteraction<"cached">>( selectMenuName: string, callback: ( interaction: TBindInteraction ) => Promise<void> ) {
        const selectMenuMap = this.getEntityMap( selectMenuName );

        this.storeEntityCallback( selectMenuMap, callback );
    }

    protected bindUserSelectMenu<TBindInteraction = UserSelectMenuInteraction<"cached">>( selectMenuName: string, callback: ( interaction: TBindInteraction ) => Promise<void> ) {
        const selectMenuMap = this.getEntityMap( selectMenuName );

        this.storeEntityCallback( selectMenuMap, callback );
    }

    public async awakeInternal( message: Message<true>, argsFromManager?: UIArgs ) {
        const args = {
            ... await this.getArgsInternal( message.channel as TChannel, argsFromManager ),
            ... await this.getArgsInternal( message, argsFromManager ),
        };

        this.argsManager.setInitialArgs( this, message.id, args );

        return this.argsManager.getArgsById( this, message.id );
    }

    private async isArgsExpiredInternal( interaction: TInteraction ) {
        if ( ! this.shouldRequireArgs || ! this.shouldRequireArgs( interaction ) ) {
            return false;
        }

        const args = this.argsManager.getArgs( this, interaction );

        if ( args ) {
            return false;
        }

        if ( ! interaction.isCommand() ) {
            // Use main deferUpdate method.
            await interaction.deferUpdate().catch( ( e ) => {
                this.$$.staticLogger.error( this.isArgsExpiredInternal, `Interaction id: '${ interaction.id }' failed to deferUpdate.`, e );
            } );
        }

        let errorLog = `Interaction id: '${ interaction.id }'`;

        if ( interaction.isMessageComponent() ) {
            errorLog += `, message id: '${ interaction.message.id }' customId: '${ interaction.customId }'`;
        }

        errorLog += " has expired.";

        this.$$.staticLogger.warn( this.isArgsExpiredInternal, errorLog );

        const options: InteractionEditReplyOptions = {
            components: [],
            embeds: [],
            content: "The interaction has expired. Please create new one."
        };

        // TODO: Make dedicated method for this.
        // TODO: Add to FAQ.
        const { RegenerateButton } = this.uiService.$$.getSystemElements();

        if ( RegenerateButton && this.regenerate ) {
            const button = new RegenerateButton();

            const buttonData = await button.build();

            buttonData.attributes.customId = this.customIdStrategy
                .generateId( this.getName() + UI_CUSTOM_ID_SEPARATOR + REGENERATE_BUTTON_ID );

            const buttonBuilder = new ButtonBuilder( buttonData.attributes );

            const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents( buttonBuilder );

            options.components = [ actionRow ];
        }

        await interaction.editReply( options );

        return true;
    }

    private async getArgsInternal( context: TChannel | TInteraction | Message<true>, argsFromManager?: UIArgs ): Promise<UIArgs> {
        // TODO: Refactor this method.
        let args: UIArgs = {},
            contextId: "start" | "reply" | "edit-message" | "unknown" = "unknown";

        if ( context instanceof Message ) {
            contextId = "edit-message";
        } else if ( context instanceof GuildChannel ) {
            contextId = "start";
        } else if ( context.isMessageComponent() || context.isCommand() || context.isModalSubmit() ) {
            contextId = "reply";
        }

        switch ( contextId ) {
            case "start":
                args = await this.getStartArgs( context as TChannel, argsFromManager );
                break;

            case "reply":
                args = await this.getReplyArgs( context as TInteraction, argsFromManager );
                break;

            case "edit-message":
                const conditionalArgs = await this.getEditMessageArgs?.( context as Message<true>, argsFromManager );

                if ( conditionalArgs ) {
                    args = conditionalArgs;
                }
                break;

            default:
                // TODO:
                // throw new NotImplementedError( this.getArgsInternal, this.getName() );

                throw new Error( `Not implemented context, source: '${ this.getName() }'` );
        }

        args = Object.assign( {}, args );

        this.$$.staticDebugger.dumpDown( this.getArgsInternal, {
            contextId,
            args,
            argsFromManager,
        } );

        return args;
    }

}
