import process from "process";

import {
    ActionRowBuilder,
    BaseGuildTextChannel,
    BaseGuildVoiceChannel,
    BaseMessageOptions,
    ButtonBuilder,
    ButtonInteraction,
    ChannelType,
    GuildChannel,
    InteractionEditReplyOptions,
    Message,
    MessageComponentInteraction,
    ModalComponentData,
    ModalSubmitInteraction,
    PermissionsBitField,
    StringSelectMenuInteraction,
    UserSelectMenuInteraction,
} from "discord.js";

import chalk from "chalk";

import { UI_GENERIC_SEPARATOR, UIAdapterBuildSource, UIArgs } from "@vertix/ui-v2/_base/ui-definitions";

import { UIAdapterReplyContext, UIAdapterStartContext, } from "@vertix/ui-v2/_base/ui-interaction-interfaces";

import { UIModalBase } from "@vertix/ui-v2/_base/ui-modal-base";

import { UIAdapterEntityBase } from "@vertix/ui-v2/_base/ui-adapter-entity-base";
import { UIAdapterManager } from "@vertix/ui-v2/ui-adapter-manager";

import { UIArgsManager } from "@vertix/ui-v2/_base/ui-args-manager";
import { GuildDataManager } from "@vertix/managers/guild-data-manager";
import { DirectMessageManager } from "@vertix/managers/direct-message-manager";
import { AppManager } from "@vertix/managers/app-manager";

import { UIRegenerateButton } from "@vertix/ui-v2/_base/regenerate/ui-regenerate-button";

import { UIInteractionMiddleware } from "@vertix/ui-v2/_base/ui-interaction-middleware";

import { Debugger } from "@internal/modules/debugger";
import { Logger } from "@internal/modules/logger";
import { ForceMethodImplementation } from "@internal/errors";

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
    private static adapterLogger: Logger = new Logger( this );
    private static adapterDebugger: Debugger = new Debugger(
        this,
        "",
        AppManager.isDebugOn( "UI", UIAdapterBase.getName() )
    );

    private static validatedOnce = false;

    private staticAdapter: typeof UIAdapterBase;

    // TODO: Clear them out after a while.
    private static ephemeralInteractions: {
        [ userIdPlusMessageId: string ]: MessageComponentInteraction | ModalSubmitInteraction;
    } = {};

    // TODO: Clear them out after a while.
    private static staticArgs = new UIArgsManager( chalk.green( "StaticArgs" ) );
    private static staticSystemArgs = new UIArgsManager( chalk.red( "SystemArgs" ) );

    private dynamicArgs = new UIArgsManager( chalk.blue( "DynamicArgs" ) );

    private argsManager: UIArgsManager;

    // TODO: Clear them out after a while, figure out how it works.
    private startedMessages: {
        [ channelId: string ]: {
            [ messageId: string ]: Message<true>,
        }
    } = {};

    protected uiManager: UIAdapterManager;

    public static getName() {
        return "Vertix/UI-V2/UIAdapterBase";
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

    public static cleanupWorker() {
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
            const interaction = UIAdapterBase.ephemeralInteractions[ id ];

            if ( Date.now() - interaction.createdAt.getTime() > ADAPTER_CLEANUP_EPHEMERAL_TIMEOUT ) {
                UIAdapterBase.adapterDebugger.log( UIAdapterBase.cleanupWorker,
                    `Deleting old ephemeral interaction: '${ interaction.id }' from memory`
                );

                delete UIAdapterBase.ephemeralInteractions[ id ];
            }
        }

        UIAdapterBase.adapterDebugger.dumpDown( UIAdapterBase.cleanupWorker, {
            staticArgs: UIAdapterBase.staticArgs.getData(),
            systemArgs: UIAdapterBase.staticSystemArgs.getData(),
            ephemeralInteractions: Object.values( UIAdapterBase.ephemeralInteractions ).map( ( interaction ) => {
                return {
                    id: interaction.id,
                    customId: interaction.customId,
                    createdAt: interaction.createdAt,
                };
            } ),
        } );
    }

    protected static getMiddlewares() {
        return [];
    }

    public constructor( uiManager: UIAdapterManager ) {
        super();

        this.uiManager = uiManager;

        const staticThis = this.constructor as typeof UIAdapterBase;

        this.staticAdapter = staticThis;

        if ( staticThis.adapterDebugger.isDebugging() ) {
            staticThis.adapterDebugger.enableCleanupDebug( this );
        }

        if ( this.isStatic() ) {
            this.argsManager = UIAdapterBase.staticArgs;
        } else {
            this.argsManager = this.dynamicArgs;
        }

        if ( ! this.shouldDisableMiddleware || ! this.shouldDisableMiddleware() ) {
            new UIInteractionMiddleware( this, {
                onChannelFailed: async ( channel, channelTypes ) => {
                    await uiManager.get( "Vertix/UI-V2/InvalidChannelTypeAdapter" )?.ephemeral( channel, {
                        channelTypes,
                    } );
                },

                onInteractionFailed: async ( interaction, missingPermissions ) => {
                    await uiManager.get( "Vertix/UI-V2/MissingPermissionsAdapter" )?.ephemeral( interaction, {
                        missingPermissions,
                    } );
                },
            } );
        }
    }

    public async build( args: UIArgs, from: UIAdapterBuildSource = "unknown", context: string | TInteraction | TChannel | Message<true> ) {
        await this.getComponent().waitUntilInitialized();

        const ownerId = "string" === typeof context ? context : context.guildId;

        if ( ownerId && ! args._language ) {
            // TODO: Move to hook.
            const language = await GuildDataManager.$.getData( {
                ownerId: "string" === typeof context ? context : context.guildId,
                key: "language",
                default: "en",
                cache: true,
            }, true );

            args._language = language?.values?.[ 0 ] ?? "en";
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

    public async send( channel: TChannel, sendArgs?: UIArgs ) {
        // TODO: When args switching from one adapter to another, the old args should be cleared out.
        // TODO: Old interaction should be cleared out.
        const args = await this.getArgsInternal( channel, sendArgs );

        this.staticAdapter.adapterDebugger.dumpDown( this.send, args, "getStartArgs" );

        await this.build( args, "send", channel );

        const message = await this.getMessage( "send", channel, sendArgs );

        if ( channel instanceof BaseGuildTextChannel || channel instanceof BaseGuildVoiceChannel ) {
            if ( ! this.startedMessages[ channel.id ] ) {
                this.startedMessages[ channel.id ] = {};
            }

            const result = await channel.send( message ).catch( ( e ) => {
                this.staticAdapter.adapterLogger.error( this.ephemeral, "", e );

                return null;
            } );

            if ( ! result ) {
                return null;
            }

            this.startedMessages[ channel.id ][ result.id ] = result;

            // New Interaction?
            this.argsManager.setInitialArgs( this, result.id, args );

            return result;
        }

        throw new Error( "Not implemented" );
    }

    public async sendToUser( guildId: string, userId: string, argsFromManager: UIArgs ) {
        this.staticAdapter.adapterDebugger.log(
            this.sendToUser, this.getName() + ` - Sending to user: '${ userId }' from guild id: '${ guildId }'`
        );

        await this.build( argsFromManager, "send-to-user", guildId );

        return await DirectMessageManager.$.sendToUser( userId, this.getMessage() );
    }

    public async editReply( interaction: TInteraction, newArgs?: UIArgs ) {
        // TODO: Add log middleware.
        this.staticAdapter.adapterDebugger.log( this.editReply, this.getName() + ` - Editing reply: '${ interaction.id }'` );

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

        const message = await this.getMessage( "edit", interaction, newArgs );

        if ( ! interaction.isCommand() && ! interaction.deferred ) {
            // TODO: Use dedicated method.
            if ( false === await interaction.deferUpdate().catch( ( e ) => {
                this.staticAdapter.adapterLogger.error( this.editReply, "", e );

                return false;
            } ) ) {
                return;
            }
        }

        return await interaction.editReply( message );
    }

    public async editMessage( message: Message<true>, newArgs?: UIArgs ) {
        const argsId = message.id;

        let args = this.argsManager.getArgsById( this, argsId );

        // TODO: Ensure how it possible that dynamic args exist.
        if ( ! args && this.isDynamic() ) {
            const argsInternal = await this.getArgsInternal( message, newArgs || {} );

            this.argsManager.setInitialArgs( this, argsId, argsInternal );
        }

        args = this.argsManager.getArgsById( this, argsId );

        await this.build( args, "edit-message", message );

        const newMessage = await this.getMessage( "edit-message", message.channel as TChannel, newArgs );

        return await message.edit( newMessage );
    }

    public async run( interaction: MessageComponentInteraction | ModalSubmitInteraction ) {
        const entityName = interaction.customId.split( UI_GENERIC_SEPARATOR )[ 1 ];

        this.staticAdapter.adapterDebugger.log( this.editReply, this.getName() + ` - Running: '${ interaction.customId }'` );

        if ( interaction.isMessageComponent() && REGENERATE_BUTTON_ID === entityName && this.regenerate ) {
            this.staticAdapter.adapterLogger.admin( this.run,
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
        this.argsManager.setInitialArgs( this, this.argsManager.getArgsId( interaction as TInteraction ), args || {} );

        return this.run( interaction as MessageComponentInteraction );
    }

    public async ephemeral( interaction: TInteraction, sendArgs?: UIArgs, deletePreviousInteraction = this.shouldDeletePreviousReply?.() || false ) {
        const args = await this.getArgsInternal( interaction, sendArgs );

        await this.build( args, "reply", interaction );

        const message = await this.getMessage( "reply", interaction, sendArgs ),
            shouldDeletePreviousInteraction = deletePreviousInteraction && ! interaction.isCommand() && interaction.message?.id,
            messageId = shouldDeletePreviousInteraction && interaction.message?.id || 0;

        if ( shouldDeletePreviousInteraction && this.staticAdapter.ephemeralInteractions[ interaction.user.id + messageId ] ) {
            // TODO: If interaction not used for awhile, it will be expired.
            const previousInteraction = this.staticAdapter.ephemeralInteractions[ interaction.user.id + messageId ];

            // TODO: Avoid catching here.
            await previousInteraction.deleteReply().catch( ( e ) => {
                this.staticAdapter.adapterLogger.error( this.ephemeral, "", e );
            } );
        }

        return interaction.reply( {
            ... message,
            ephemeral: true,
        } ).then( ( result ) => {
            if ( shouldDeletePreviousInteraction ) {
                this.staticAdapter.ephemeralInteractions[ interaction.user.id + messageId ] = interaction;
            }
        } ).catch( ( e ) => {
            this.staticAdapter.adapterLogger.error( this.ephemeral, "", e );
        } );
    }

    // TODO: Determine which interaction available showModal, and use it instead of MessageComponentInteraction.
    // TODO: Method does not favor dynamic/static approach.
    public async showModal( modalName: string, interaction: MessageComponentInteraction<"cached"> ) {
        const args = await this.getArgsInternal( interaction as TInteraction, {} );

        // const entity = this.staticAdapter.getComponent()
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
            .catch( ( error ) => this.staticAdapter.adapterLogger.error( this.showModal, "", error ) )
            .then( () => {
                // this.deleteArgs( this.getArgsId( interaction as TInteraction ) );
            } );
    }

    public async waitUntilInitialized() {
        return this.getComponent().waitUntilInitialized();
    }

    public getStartedMessages( channel: TChannel ) {
        return this.startedMessages[ channel.id ];
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
        if ( this.startedMessages[ channel.id ] ) {
            const messages = Object.entries( this.startedMessages[ channel.id ] ) || [],
                messageLength = messages.length;

            for ( let i = 0; i < messageLength; i++ ) {
                const [ id, message ] = messages[ i ];

                await message.delete();

                delete this.startedMessages[ channel.id ][ id ];
            }

            // If started channel has no messages, deletedStartedMessagesInternal it.
            if ( ! Object.keys( this.startedMessages[ channel.id ]?.messages || {} ).length ) {
                this.getArgsManager().deleteArgs( this, channel.id );

                delete this.startedMessages[ channel.id ];
            }
        }
    }

    public async deleteRelatedComponentMessagesInternal( channel: TChannel ) {
        const supported = channel instanceof BaseGuildTextChannel || channel instanceof BaseGuildVoiceChannel;

        if ( supported ) {
            const messages = await channel.messages.fetch();

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

    protected getStartArgs( channel?: TChannel, argsFromManager?: UIArgs ): Promise<UIArgs> | {} {
        throw new ForceMethodImplementation( this, "getStartArgs" );
    };

    // TODO: In reply context there are always interaction, ( ensure ).
    protected getReplyArgs( interaction?: TInteraction, argsFromManager?: UIArgs ): Promise<UIArgs> | {} {
        throw new ForceMethodImplementation( this, "getReplyArgs" );
    }

    protected getEditMessageArgs?( message?: Message<true>, argsFromManager?: UIArgs ): Promise<UIArgs> | {} {
        throw new ForceMethodImplementation( this, "getEditMessageArgs" );
    }

    protected buildModal( modal: UIModalBase ): ModalComponentData {
        const schema = modal.getSchema();

        return {
            ... schema.attributes,
            customId: this.getName() + ":" + modal.getName(),
            components: this.buildComponentsBySchema( schema.entities ),
        };
    }

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

    // Should be called when the interaction is manually created. ??
    // TODO: Check how claim works, ( maybe describe that in miro ) and try to bold the difference between channel rename, and claim.
    // TODO: Use miro to handle connection between the adapters.

    // TODO: The behavior of this method is not clear, cover it with tests.
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
                this.staticAdapter.adapterLogger.error( this.isArgsExpiredInternal, `Interaction id: '${ interaction.id }' failed to deferUpdate.`, e );
            } );
        }

        let errorLog = `Interaction id: '${ interaction.id }'`;

        if ( interaction.isMessageComponent() ) {
            errorLog += `, message id: '${ interaction.message.id }' customId: '${ interaction.customId }'`;
        }

        errorLog += " has expired.";

        this.staticAdapter.adapterLogger.warn( this.isArgsExpiredInternal, errorLog );

        const options: InteractionEditReplyOptions = {
            components: [],
            embeds: [],
            content: "The interaction has expired. Please create new one."
        };

        // TODO: Make dedicated method for this.
        // TODO: Add to FAQ.
        if ( this.regenerate ) {
            const button = new UIRegenerateButton();

            const buttonData = await button.build();

            buttonData.attributes.customId = this.getName() + UI_GENERIC_SEPARATOR + REGENERATE_BUTTON_ID;

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

        this.staticAdapter.adapterDebugger.dumpDown( this.getArgsInternal, {
            contextId,
            args,
            argsFromManager,
        } );

        return args;
    }
}
