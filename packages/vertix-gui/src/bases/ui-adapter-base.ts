import process from "process";

import { DEFAULT_GUILD_SETTINGS_KEY_LANGUAGE } from "@vertix.gg/definitions/src/guild-data-keys";
import { ForceMethodImplementation } from "@vertix.gg/base/src/errors";

import { GuildDataManager } from "@vertix.gg/data/src/managers/guild-data-manager";

import { createDebugger } from "@vertix.gg/base/src/modules/debugger";
import { Logger } from "@vertix.gg/base/src/modules/logger";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";
import { InteractionTrace } from "@vertix.gg/base/src/modules/trace/interaction-trace";

import {
    ActionRowBuilder,
    BaseGuildTextChannel,
    BaseGuildVoiceChannel,
    ButtonBuilder,
    ComponentType,
    GuildChannel,
    Message,
    MessageFlags
} from "discord.js";

import picocolors from "picocolors";

import { UIAdapterEntityBase } from "@vertix.gg/gui/src/bases/ui-adapter-entity-base";

import { UIArgsManager } from "@vertix.gg/gui/src/bases/ui-args-manager";

import { UI_CUSTOM_ID_SEPARATOR } from "@vertix.gg/gui/src/bases/ui-definitions";

import { UIInteractionMiddleware } from "@vertix.gg/gui/src/bases/ui-interaction-middleware";

import { UI_LANGUAGES_INITIAL_CODE } from "@vertix.gg/gui/src/bases/ui-language-definitions";

import { UIContainerRenderer } from "@vertix.gg/gui/src/runtime/ui-container-renderer";

import type { UIAdapterReplyContext, UIAdapterStartContext } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type {
    UIAdapterBuildSource,
    UIArgs,
    UIContainerEmbedAttributes,
    UIEntitySchemaBase,
    UIMessageOptions
} from "@vertix.gg/gui/src/bases/ui-definitions";

import type { UIService } from "@vertix.gg/gui/src//ui-service";

import type { UIModalBase } from "@vertix.gg/gui/src/bases/ui-modal-base";

import type {
    MessagePayload,
    ButtonInteraction,
    ChannelType,
    Client,
    CommandInteraction,
    InteractionEditReplyOptions,
    MessageActionRowComponentBuilder,
    MessageComponentInteraction,
    ModalComponentData,
    ModalSubmitInteraction,
    PermissionsBitField,
    StringSelectMenuInteraction,
    UserSelectMenuInteraction
} from "discord.js";
import type { TAdapterRegisterOptions, TAdapterStaticContract } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";

const REGENERATE_BUTTON_ID = "regenerate-button";

const ADAPTER_CLEANUP_EPHEMERAL_TIMEOUT = Number( process.env.ADAPTER_CLEANUP_EPHEMERAL_TIMEOUT ) || 600000; // 10 minutes.

const ADAPTER_CLEANUP_STATIC_ARGS_TIMEOUT = Number( process.env.ADAPTER_CLEANUP_STATIC_ARGS_TIMEOUT ) || 600000; // 10 minutes.

// How long the interaction that opened a screen can still be used to change it. Discord's own
// window is fifteen minutes; it is read from the environment because the number is Discord's
// rather than ours, and a deployment that finds it has moved should not need a new build.
/**
 * What a screen's interaction is kept for: changing that screen later, taking it away, and knowing
 * how much of its token is left.
 *
 * Described by what it has to do rather than named as one of discord.js's interaction types, so
 * that a command, a button and a modal submit all satisfy it - a screen can be opened by any of
 * them, and what happens afterwards is the same whichever it was.
 */
export interface UIScreenOwner {
    createdAt: Date;
    editReply( options: string | MessagePayload | InteractionEditReplyOptions ): Promise<unknown>;
    deleteReply(): Promise<unknown>;
}

const ADAPTER_INTERACTION_TOKEN_LIFETIME = Number( process.env.ADAPTER_INTERACTION_TOKEN_LIFETIME ) || 900000; // 15 minutes.

/**
 * TChannel - The channel type that will be used if the adapter starts interaction.
 * TInteraction - The channel type that will be used if the adapter replies to interaction.
 */
/**
 * Function fillGapsFrom() :: What the caller handed in, under what the adapter worked out.
 *
 * An adapter's `getReplyArgs()` is free to answer with only what it knows, and most do - they
 * rebuild the screen from the channel every time, which is why they can be trusted over anything
 * held from before. What they cannot know is whatever exists only in the press that is being
 * answered: which member was picked, which way an owner answered a knock, which channels there were
 * to choose between. That arrives here as the args the caller passed, and an adapter that named
 * none of it used to drop it.
 *
 * Nothing about that failed. The screen rendered, having been given args it could build from, and
 * an embed handed no answer prints the branch for no answer - so somebody let into a channel was
 * told they had not been.
 *
 * Gaps rather than a merge in either direction: the adapter wins every key it actually answered,
 * and a key it answered as `undefined` is not an answer. Assigning either object wholesale over the
 * other gets one of those two wrong.
 */
export function fillGapsFrom( args: UIArgs, argsFromManager?: UIArgs ): UIArgs {
    const filled: UIArgs = Object.assign( {}, args );

    for ( const [ key, value ] of Object.entries( argsFromManager ?? {} ) ) {
        if ( undefined === filled[ key ] ) {
            filled[ key ] = value;
        }
    }

    return filled;
}

/**
 * Function componentsBelongTo() :: Whether a message is drawing one adapter's own controls.
 *
 * Custom ids reach discord hashed, so an adapter's name cannot be read off one directly - `decode`
 * is what puts a hash back through the table that made it, and it is passed in rather than reached
 * for because which table that is belongs to the adapter's module.
 *
 * Decoding has to be the quiet kind. This is asked about every component in a channel, most of
 * which belong to another adapter or to another bot entirely, and not recognising one of those is
 * the answer rather than a fault.
 */
export function componentsBelongTo(
    rows: Message[ "components" ],
    adapterName: string,
    decode: ( customId: string ) => string
): boolean {
    return rows.some( ( row ) => {
        if ( ComponentType.ActionRow !== row.type ) {
            return false;
        }

        return row.components.some(
            ( component ) =>
                "customId" in component && !!component.customId && decode( component.customId ).startsWith( adapterName )
        );
    } );
}

export abstract class UIAdapterBase<
    // TODO: Generic are useless...
    TChannel extends UIAdapterStartContext,
    TInteraction extends UIAdapterReplyContext
> extends UIAdapterEntityBase {
    protected static staticLogger: Logger = new Logger( this.getName() );
    private static staticDebugger = createDebugger( this.getName(), "UI" );

    private static validatedOnce = false;

    private static ephemeralInteractions: {
        [userIdPlusMessageId: string]: {
            interaction: MessageComponentInteraction | ModalSubmitInteraction;
            rawCustomId: string;
        };
    } = {};

    /**
     * The interaction each user's screen was last opened or moved by, per adapter.
     *
     * An ephemeral message has no channel route to edit it by - the only way back to one is the
     * token of the interaction that sent it. Holding that token lets a screen be changed without
     * spending the response of whatever was just pressed on it, which is what leaves the press free
     * to be answered with Discord's own "thinking" state.
     *
     * A token dies after `ADAPTER_INTERACTION_TOKEN_LIFETIME`, so this is a way to reach a screen
     * rather than a promise of reaching one. Every caller has to have an answer for not reaching it.
     */
    private static screenOwners: {
        [ userIdPlusAdapterName: string ]: UIScreenOwner;
    } = {};

    private static staticArgs = new UIArgsManager( picocolors.green( "StaticArgs" ) );
    // TODO: Rename to dynamicArgs.
    private static dynamicArgs = new UIArgsManager( picocolors.blue( "DynamicArgs" ) );
    private static staticSystemArgs = new UIArgsManager( picocolors.red( "SystemArgs" ) );

    /**
     * Managing Discord messages sent in different channels.
     *
     * The class keeps track of started messages, by channel and message ID.
     */
    private channelStartedMessages = new ( class StartedMessages {
        // TODO: Clear them out after a while, figure out how it works.
        private messages: {
            [channelId: string]: {
                [messageId: string]: Message<true>;
            };
        } = {};

        public get( channelId: string ) {
            return this.messages[ channelId ];
        }

        public set( channelId: string, messageId: string, message: Message<true> ) {
            if ( !this.messages[ channelId ] ) {
                this.messages[ channelId ] = {};
            }

            this.messages[ channelId ][ messageId ] = message;
        }

        public delete( channelId: string, messageId?: string ): void;
        public delete( channelId: string ): void;

        public delete( channelId: string, messageId?: string ) {
            if ( messageId ) {
                delete this.messages[ channelId ][ messageId ];
            } else {
                delete this.messages[ channelId ];
            }
        }
    } )();

    private readonly argsManager: UIArgsManager;

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
        if ( !UIAdapterBase.staticArgs ) {
            return;
        }

        const data = UIAdapterBase.staticArgs.getData();

        for ( const messageId in data ) {
            const messageData = data[ messageId ];

            for ( const id in messageData ) {
                const channelData = messageData[ id ];

                // Counted from the last time the screen was read rather than the last time it was
                // written to. A member who opens a menu and works down it without submitting
                // anything never writes, and evicting on the write would take their state out from
                // under a screen they are still using - which reads as the screen losing what it
                // knew, because that is exactly what happened.
                if ( Date.now() - channelData.accessedAt.getTime() > ADAPTER_CLEANUP_STATIC_ARGS_TIMEOUT ) {
                    UIAdapterBase.staticArgs.deleteArgs( messageId, id );
                    UIAdapterBase.staticSystemArgs.deleteArgs( messageId, id );
                }
            }
        }

        // Delete old ephemeral interactions.
        for ( const id in UIAdapterBase.ephemeralInteractions ) {
            const { interaction } = UIAdapterBase.ephemeralInteractions[ id ];

            if ( Date.now() - interaction.createdAt.getTime() > ADAPTER_CLEANUP_EPHEMERAL_TIMEOUT ) {
                UIAdapterBase.staticDebugger.log(
                    UIAdapterBase.cleanupTimer,
                    `Deleting old ephemeral interaction: '${ interaction.id }' from memory`
                );

                delete UIAdapterBase.ephemeralInteractions[ id ];
            }
        }

        // Drop owners whose token has died; holding them only keeps interactions from being freed.
        for ( const key in UIAdapterBase.screenOwners ) {
            const owner = UIAdapterBase.screenOwners[ key ];

            if ( Date.now() - owner.createdAt.getTime() > ADAPTER_INTERACTION_TOKEN_LIFETIME ) {
                delete UIAdapterBase.screenOwners[ key ];
            }
        }

        UIAdapterBase.staticDebugger.dumpDown( UIAdapterBase.cleanupTimer, {
            staticArgs: UIAdapterBase.staticArgs.getData(),
            systemArgs: UIAdapterBase.staticSystemArgs.getData(),
            ephemeralInteractions: Object.values( UIAdapterBase.ephemeralInteractions ).map(
                ( { interaction, rawCustomId } ) => {
                    return {
                        id: interaction.id,
                        createdAt: interaction.createdAt,
                        customId: interaction.customId,
                        rawCustomId
                    };
                }
            )
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
            this.argsManager = UIAdapterBase.dynamicArgs;
        }

        if ( !this.shouldDisableMiddleware || !this.shouldDisableMiddleware() ) {
            new UIInteractionMiddleware( this, {
                onChannelFailed: async( channel, channelTypes ) => {
                    await this.uiService
                        .get( "VertixGUI/InternalAdapters/InvalidChannelTypeAdapter" )
                        ?.ephemeral( channel, {
                            channelTypes
                        } );
                },

                onInteractionFailed: async( interaction, missingPermissions ) => {
                    await this.uiService
                        .get( "VertixGUI/InternalAdapters/MissingPermissionsAdapter" )
                        ?.ephemeral( interaction, {
                            missingPermissions
                        } );
                }
            } );
        }
    }

    public get $$() {
        return this.constructor as typeof UIAdapterBase;
    }

    public async build(
        args: UIArgs,
        from: UIAdapterBuildSource = "unknown",
        context: "direct-message" | string | TInteraction | TChannel | Message<true>
    ) {
        await this.getComponent().waitUntilInitialized();

        if ( !args ) {
            this.$$.staticLogger.error( this.build, `Attempted to build '${ this.getName() }' with undefined args from source: '${ from }'` );
            return null;
        }

        const ownerId = "string" === typeof context ? context : context.guildId;

        // Set _guildId for customization support (null for direct messages)
        if ( ownerId && ownerId !== "direct-message" ) {
            args._guildId = ownerId;

            // What the overrides apply to: the component's own name, and the state being rendered.
            // Neither is shortened - `UI-V2/DynamicChannel` and `UI-V3/DynamicChannel` are
            // different components, and a name trimmed to its last segment cannot say which.
            if ( !args._customizationComponent ) {
                args._customizationComponent = this.getComponent().getName();

                const staticClass = this.constructor as Partial<TAdapterStaticContract>;

                if ( !args._customizationState && typeof staticClass.getTransactions === "function" ) {
                    const transactions = staticClass.getTransactions();

                    if ( transactions ) {
                        args._customizationState = transactions.getInitialState();
                    }
                }
            }
        }

        if ( ownerId === "direct-message" ) {
            args._language = UI_LANGUAGES_INITIAL_CODE;
        } else if ( ownerId && args && !args._language ) {
            // TODO: Move to hook.
            const language = await GuildDataManager.$.getData(
                {
                    ownerId: "string" === typeof context ? context : context.guildId,
                    key: DEFAULT_GUILD_SETTINGS_KEY_LANGUAGE,
                    default: UI_LANGUAGES_INITIAL_CODE,
                    cache: true
                },
                true
            );

            args._language = language?.values?.[ 0 ] ?? UI_LANGUAGES_INITIAL_CODE;
        }

        if ( "unknown" !== from ) {
            await this.onBeforeBuild?.( args, from, context );
        }

        const schema = await InteractionTrace.$.span( "gui-build", this.getName(), () => this.getComponent().build( args ) );

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

            if ( !result ) {
                return null;
            }

            this.channelStartedMessages.set( channel.id, result.id, result );

            // New Interaction?
            this.argsManager.setInitialArgs( this, result.id, args );

            return result;
        }

        throw new Error( "Not implemented" );
    }

    /**
     * Re-renders an existing message with this adapter, exactly as `send()` would have rendered a
     * new one. Unlike `editMessage()` it does not run the execution-step machinery, so it works for
     * a message that another adapter originally posted - which is what a panel navigated by
     * several adapters needs.
     */
    public async rerenderMessage( message: Message<true>, sendArgs?: UIArgs ) {
        const channel = message.channel as TChannel;

        const args = await this.getArgsInternal( channel, sendArgs );

        await this.build( args, "send", channel );

        const result = await message.edit( this.getMessage( "send", channel, sendArgs ) );

        this.channelStartedMessages.set( message.channel.id, result.id, result );

        this.argsManager.setInitialArgs( this, result.id, args, { overwrite: true, silent: true } );

        return result;
    }

    public async sendToUser(
        guildId: string | "direct-message",
        userId: string,
        argsFromManager: UIArgs,
        client?: Client<true>
    ) {
        this.$$.staticDebugger.log(
            this.sendToUser,
            this.getName() + ` - Sending to user: '${ userId }' from guild id: '${ guildId }'`
        );

        await this.build( argsFromManager, "send-to-user", guildId );

        await ( await ( client ?? this.uiService.getClient() ).users.fetch( userId ) )
            .send( this.getMessage() )
            .catch( () =>
                this.$$.staticLogger.error( this.sendToUser, `Failed to send message to user, userId: '${ userId }'` )
            );
    }

    public async editReply( interaction: TInteraction, newArgs?: UIArgs ) {
        // TODO: Add log middleware.
        this.$$.staticDebugger.log( this.editReply, this.getName() + ` - Editing reply: '${ interaction.id }'` );

        if ( await this.isArgsExpiredInternal( interaction ) ) {
            return;
        }

        const argsId = this.argsManager.getArgsId( interaction ),
            currentArgs = this.getArgsManager().getArgsById( this, argsId ),
            // Args are kept per message, so an adapter asked to replace a screen it did not draw -
            // a notice taking over the message a press came from - looks under an id it never wrote
            // under, and finds nothing. Resolving its own, which is what `ephemeral()` does for the
            // same adapter on the same press, is the difference between a sentence and a press that
            // dies unanswered: `build` refuses `undefined` args, and `getMessage` is then left with
            // no schema to read. A static adapter that does have args stored keeps using them;
            // only the empty case is new.
            shouldRefreshArgs = ! currentArgs || ( this.isDynamic() && !! newArgs );

        if ( shouldRefreshArgs ) {
            const resolvedArgs = await this.getArgsInternal( interaction as TInteraction, newArgs );

            this.preserveSystemArgs( resolvedArgs, newArgs );

            if ( currentArgs ) {
                this.getArgsManager().setArgs( this, interaction, resolvedArgs );
            } else {
                this.getArgsManager().setInitialArgs( this, argsId, resolvedArgs );
            }
        }

        const args = this.argsManager.getArgs( this, interaction );

        await this.build( args, "edit", interaction );

        const message = this.getMessage( "edit", interaction, newArgs );

        // A container's components are the container itself rather than rows of menus, and it can
        // carry no embeds - so the rewrite below has nothing to walk and nothing to send. Deferring
        // and editing redraws the same screen either way, which is what that branch is for.
        if ( ! this.shouldRenderAsContainer() && ( interaction.isUserSelectMenu() || interaction.isChannelSelectMenu() ) ) {
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

            await interaction
                .update( {
                    components: reindexDisabledComponents,
                    embeds: message.embeds
                } )
                .catch( ( e ) => {
                    this.$$.staticLogger.error( this.editReply, "", e );
                } );
        } else {
            // `replied` covers an interaction already answered with an update - a screen that greyed
            // its own controls before starting work. Deferring one of those throws "already
            // acknowledged", and the throw used to end the edit here, leaving the screen locked.
            if ( !interaction.isCommand() && !interaction.deferred && !interaction.replied ) {
                // TODO: Use dedicated method.
                if (
                    false ===
                    ( await interaction.deferUpdate().catch( ( e ) => {
                        this.$$.staticLogger.error( this.editReply, "", e );

                        return false;
                    } ) )
                ) {
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

        if ( this.isDynamic() && newArgs ) {
            const refreshedArgs = {
                ...( await this.getArgsInternal( message.channel as TChannel, newArgs ) ),
                ...( await this.getArgsInternal( message, newArgs ) )
            };

            this.argsManager.setInitialArgs( this, argsId, refreshedArgs, {
                overwrite: true,
                silent: true
            } );

            args = refreshedArgs;
        }

        // TODO: Ensure how it possible that dynamic args exist.
        if ( !args && this.isDynamic() ) {
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
            this.$$.staticLogger.admin(
                this.run,
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

            /**
             * What was just worked out is put where the press can read it, when there is nothing
             * there already.
             *
             * These args were only ever built to draw with, and drawing is not what a press does -
             * a handler reads the screen's args through the manager, and after a restart the
             * manager holds none: the note is written by whatever sent the message, and this
             * process sent nothing. So a handler reaching for a field got `undefined.field` and
             * threw, which the interaction handler catches - leaving the press unanswered and
             * whoever made it looking at "this interaction failed".
             *
             * What comes back cannot always be the whole screen. An adapter rebuilds from the
             * channel, and anything that only ever arrived in the args the message was sent with -
             * who knocked, say - is not there to rebuild. But an adapter reading a field it has no
             * answer for takes its own path for not knowing, which is a screen saying so; reading
             * a field off nothing at all is a throw and silence.
             *
             * Only where nothing is stored. Args that exist are the screen's own and may hold what
             * no rebuild could produce, so they are not written over on the strength of a press.
             */
            const argsId = this.argsManager.getArgsId( interaction as TInteraction );

            if ( !this.argsManager.getArgsById( this, argsId ) ) {
                this.argsManager.setInitialArgs( this, argsId, args, { overwrite: true, silent: true } );
            }
        }

        await this.runEntityCallback( entityName, interaction as TInteraction );
    }

    public async runInitial( interaction: MessageComponentInteraction, args?: UIArgs ) {
        this.argsManager.setInitialArgs( this, this.argsManager.getArgsId( interaction as TInteraction ), args || {}, {
            overwrite: true
        } );

        return this.run( interaction as MessageComponentInteraction );
    }

    public async ephemeral(
        interaction: TInteraction,
        sendArgs?: UIArgs,
        deletePreviousInteraction = this.shouldDeletePreviousReply?.() || false
    ) {
        const args = this.preserveSystemArgs(
                await this.getArgsInternal( interaction, sendArgs ),
                sendArgs
            ),
            caller = this.ephemeral.name;

        await this.build( args, "reply", interaction );

        const message = this.getMessage( "reply", interaction, sendArgs ),
            shouldDeletePreviousInteraction =
                deletePreviousInteraction && !interaction.isCommand() && interaction.message?.id,
            messageId = ( shouldDeletePreviousInteraction && interaction.message?.id ) || 0,
            interactionInternalId = interaction.user.id + UI_CUSTOM_ID_SEPARATOR + messageId;

        if ( shouldDeletePreviousInteraction && this.$$.ephemeralInteractions[ interactionInternalId ] ) {
            // TODO: If interaction not used for awhile, it will be expired.
            const previousInteraction = this.$$.ephemeralInteractions[ interactionInternalId ].interaction;

            // TODO: Avoid catching here.
            await previousInteraction.deleteReply().catch( ( e ) => {
                this.$$.staticLogger.error( caller, "", e );
            } );
        }

        /**
         * An interaction can only be answered once, and by the time a screen is shown the answer
         * has often already gone out: a wizard defers its finish button before running the
         * callback, and the screen that reports what the callback failed at comes after that.
         * `reply()` throws `InteractionAlreadyReplied` on such an interaction, and the throw lands
         * in the `catch` below as a logged line nobody reads - the user presses the button and
         * sees nothing at all, which reads as a dead bot rather than as a problem they could fix.
         *
         * `followUp()` is how discord takes a further ephemeral message on an interaction already
         * answered, so take it that way whenever the first answer is spent. It returns the message
         * directly rather than wrapping it in an interaction callback response, so both branches
         * are normalised to the message before the shared handling below.
         */
        const isAlreadyAnswered = interaction.deferred || interaction.replied;

        /**
         * Merged rather than set, because a container screen arrives carrying `IsComponentsV2` and
         * the flag cannot be taken back off a message once sent - overwriting it here would send
         * the container as an ordinary message, which discord refuses since it has no `content`
         * and no `embeds`. Given as a list so the two are combined by discord.js rather than by
         * arithmetic this file would have to cast the result of.
         */
        const flags: ( MessageFlags.Ephemeral | MessageFlags.IsComponentsV2 )[] = message.flags
            ? [ MessageFlags.Ephemeral, message.flags ]
            : [ MessageFlags.Ephemeral ];

        return ( isAlreadyAnswered
            ? interaction.followUp( { ...message, flags } )
            : interaction
                .reply( {
                    ...message,
                    flags,
                    withResponse: true
                } )
                .then( ( result ) => result?.resource?.message )
        )
            .then( ( reply ) => {
                this.setScreenOwner( interaction.user.id, interaction );

                // The reply is a message in its own right, and every component drawn on it arrives
                // naming it rather than whatever was pressed to open it. Args are kept per message,
                // so without this the first press on a fresh ephemeral asks for an id nothing was
                // ever stored under - it lands as `ArgsNotFound`, and whatever that press meant to
                // record is dropped.
                //
                // `send()` has always stored against the message it created; this is that, for the
                // message a reply creates. Asked for with the reply rather than fetched after it,
                // so the screen costs one call as it always did.
                if ( reply ) {
                    this.argsManager.setInitialArgs( this, reply.id, args, {
                        overwrite: true,
                        silent: true
                    } );
                }

                if ( shouldDeletePreviousInteraction ) {
                    this.$$.ephemeralInteractions[ interactionInternalId ] = {
                        interaction,
                        rawCustomId: this.getCustomIdForEntity( interaction.customId )
                    };
                }
            } )
            .catch( ( e ) => {
                this.$$.staticLogger.error( caller, "", e );
            } );
    }

    // TODO: Method does not favor dynamic/static approach.
    /**
     * Function showModal() :: Puts a modal in front of whoever asked for one.
     *
     * Takes a command interaction as well as a component one, because a modal is how a slash
     * command asks for a line of text just as much as a button is - discord lets either open one,
     * and the two used to differ here only because a button was the only thing that ever did.
     */
    public async showModal(
        modalName: string,
        interaction: MessageComponentInteraction<"cached"> | CommandInteraction<"cached">
    ): Promise<boolean> {
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

        const argsId = this.argsManager.getArgsId( interaction as TInteraction );

        // Only a dynamic screen's args are rewritten here, the same condition `editReply` keeps.
        // These are reply args, worked out from the interaction alone: a dynamic screen can be
        // rebuilt from one, so writing them back is a refresh. A static screen cannot - what it
        // knows was put there once, by whatever opened it, and is the generator it was told to
        // edit. Writing over that hands the modal a screen that has forgotten what it is editing.
        if ( this.isDynamic() ) {
            this.argsManager.setInitialArgs( this, argsId, args, { overwrite: true, silent: true } );
        }

        const entityMapped = this.getEntityMap( modalName ),
            modalInstance = this.getEntityInstance( entityMapped.entity ) as UIModalBase,
            modal = this.buildModal( modalInstance );

        // Answers whether the modal is actually on screen.
        //
        // It used to swallow the failure into the log and return as though it had worked, which
        // left the interaction unanswered - and an unanswered interaction is discord's own error
        // to show, in discord's own words. Whoever asked to rename their channel got a bare red
        // "Missing Permissions" from discord, where every other refusal in the bot is an embed
        // that says what to do about it.
        return interaction
            .showModal( modal )
            .then( () => true )
            .catch( ( error ) => {
                this.$$.staticLogger.error( this.showModal, "", error );

                return false;
            } );
    }

    public async waitUntilInitialized() {
        return this.getComponent().waitUntilInitialized();
    }

    private getScreenOwnerKey( userId: string ) {
        return userId + UI_CUSTOM_ID_SEPARATOR + this.getName();
    }

    /**
     * Function getScreenOwner() :: The interaction a user's screen can still be changed through.
     *
     * `null` once the token is too old to use, which the caller has to treat as "the screen cannot
     * be reached" rather than as an error - the screen is still there, it just cannot be edited by
     * anything except the response of a press on it.
     */
    public getScreenOwner( userId: string ): UIScreenOwner | null {
        const key = this.getScreenOwnerKey( userId ),
            owner = this.$$.screenOwners[ key ];

        if ( ! owner ) {
            return null;
        }

        if ( Date.now() - owner.createdAt.getTime() > ADAPTER_INTERACTION_TOKEN_LIFETIME ) {
            delete this.$$.screenOwners[ key ];

            return null;
        }

        return owner;
    }

    /**
     * Function setScreenOwner() :: Records which interaction a user's screen now answers to.
     *
     * Called when a screen is sent, and again whenever it moves into a different message - a reply
     * that a screen was written into owns that screen from then on.
     */
    public setScreenOwner( userId: string, interaction: UIScreenOwner ) {
        this.$$.screenOwners[ this.getScreenOwnerKey( userId ) ] = interaction;
    }

    /**
     * Function getStartedMessages() :: The messages this adapter has standing in a channel.
     *
     * The note of them is written when they are sent, so a process that did not send them knows of
     * none - which after a restart is every message the adapter has ever put anywhere. The messages
     * themselves are in discord and outlived the process perfectly well; only the note of them did
     * not, so when there is none the channel is asked instead.
     *
     * What comes back is kept, so the channel is asked once rather than on every press - and so
     * that taking the messages down later, which reads the same note, finds them there to take.
     */
    public async getStartedMessages( channel: TChannel ) {
        const known = this.channelStartedMessages.get( channel.id );

        if ( known && Object.keys( known ).length ) {
            return known;
        }

        const found = await this.findStartedMessages( channel );

        Object.entries( found ).forEach( ( [ id, message ] ) =>
            this.channelStartedMessages.set( channel.id, id, message )
        );

        return this.channelStartedMessages.get( channel.id );
    }

    /**
     * Function findStartedMessages() :: This adapter's own messages, as the channel still holds them.
     */
    private async findStartedMessages( channel: TChannel ) {
        const result: { [messageId: string]: Message<true> } = {};

        const supported = channel instanceof BaseGuildTextChannel || channel instanceof BaseGuildVoiceChannel;

        if ( !supported ) {
            return result;
        }

        const messages = await channel.messages.fetch().catch( ( e ) => {
            this.$$.staticLogger.error( this.findStartedMessages, "", e );
        } );

        if ( !messages ) {
            return result;
        }

        messages.forEach( ( message ) => {
            if ( message.author.id === channel.client.user.id && this.ownsComponentsOf( message ) ) {
                result[ message.id ] = message as Message<true>;
            }
        } );

        return result;
    }

    private ownsComponentsOf( message: Message ) {
        return componentsBelongTo( message.components, this.getName(), ( customId ) =>
            this.customIdStrategy.getIdSilent( customId )
        );
    }

    public async updateInteractionDefer( interaction: TInteraction ) {
        if ( interaction.isMessageComponent() ) {
            await interaction.deferUpdate().catch( () => { } );
        }
    }

    public getPermissions(): PermissionsBitField {
        throw new ForceMethodImplementation( this, "getPermissions" );
    }

    public getChannelTypes(): ChannelType[] {
        throw new ForceMethodImplementation( this, "getChannelTypes" );
    }

    public deleteArgs( interaction: TInteraction | Message<true> ) {
        const id = this.getArgsManager().getArgsId( interaction );

        this.getSystemArgs().deleteArgs( this, id );
        this.getArgsManager().deleteArgs( this, id );
    }

    public async deletedStartedMessagesInternal( channel: TChannel ) {
        const startedMessages = this.channelStartedMessages.get( channel.id );

        if ( startedMessages ) {
            const messages = Object.entries( startedMessages ) || [],
                messageLength = messages.length;

            for ( let i = 0; i < messageLength; i++ ) {
                const [ id, message ] = messages[ i ];

                await message.delete();

                this.channelStartedMessages.delete( channel.id, id );
            }

            // If started channel has no messages, deletedStartedMessagesInternal it.
            if ( !Object.keys( this.channelStartedMessages.get( channel.id )?.messages || {} ).length ) {
                this.getArgsManager().deleteArgs( this, channel.id );

                this.channelStartedMessages.delete( channel.id );
            }
        }
    }

    /**
     * Function deleteRelatedComponentMessagesInternal() :: Takes down what this adapter left standing.
     *
     * It used to look for its own name at the front of a component's custom id as written. Both
     * interface modules hash their ids, so the name is not there to find and this matched nothing -
     * it has been walking channels and deleting none of them for as long as the hashing has been on.
     * `ownsComponentsOf` asks the question the way the id was made.
     */
    public async deleteRelatedComponentMessagesInternal( channel: TChannel ) {
        const supported = channel instanceof BaseGuildTextChannel || channel instanceof BaseGuildVoiceChannel;

        if ( !supported ) {
            return;
        }

        const messages = await channel.messages.fetch().catch( ( e ) => {
            this.$$.staticLogger.error( this.deleteRelatedComponentMessagesInternal, "", e );
        } );

        if ( !messages ) {
            return;
        }

        // Remove all messages that have adapter's components.
        const messagesToDelete = messages.filter( ( message ) => this.ownsComponentsOf( message ) );

        if ( !messagesToDelete.size ) {
            return;
        }

        /**
         * Old messages are passed over rather than allowed to throw.
         *
         * Discord refuses to bulk delete anything over a fortnight old, and this is walked down a
         * list of every channel there is on startup - one message too old would have ended the walk
         * where it stood and left every channel after it untouched. That cost nothing while the
         * match above found nothing; now that it finds things, it would.
         */
        await channel.bulkDelete( messagesToDelete, true ).catch( ( e ) => {
            this.$$.staticLogger.error( this.deleteRelatedComponentMessagesInternal, "", e );
        } );
    }

    public async deleteRelatedEphemeralInteractionsInternal(
        interaction: TInteraction,
        customId: string,
        count: number
    ) {
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
    protected async onBeforeBuild?(
        args: UIArgs,
        _from: UIAdapterBuildSource,
        _context?: string | TInteraction | TChannel | Message<true>
    ): Promise<void>;

    protected async onAfterBuild?(
        args: UIArgs,
        _from: UIAdapterBuildSource,
        _context?: string | TInteraction | TChannel | Message<true>
    ): Promise<void>;

    protected shouldDisableMiddleware?(): boolean;

    protected shouldRequireArgs?( interaction?: TInteraction, args?: UIArgs ): boolean;

    protected shouldDeletePreviousReply?(): boolean;

    protected async regenerate?( interaction: MessageComponentInteraction<"cached"> ): Promise<void>;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected getStartArgs( channel?: TChannel, argsFromManager?: UIArgs ): Promise<UIArgs> | {} {
        throw new ForceMethodImplementation( this, "getStartArgs" );
    }

    // TODO: In reply context there are always interaction, ( ensure ).
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected getReplyArgs( interaction: TInteraction, argsFromManager?: UIArgs ): Promise<UIArgs> | {} {
        throw new ForceMethodImplementation( this, "getReplyArgs" );
    }

    protected getEditMessageArgs?( _message?: Message<true>, _argsFromManager?: UIArgs ): Promise<UIArgs> | {} {
        throw new ForceMethodImplementation( this, "getEditMessageArgs" );
    }

    protected buildModal( modal: UIModalBase ): ModalComponentData {
        const schema = modal.getSchema();

        return {
            ...schema.attributes,
            customId: this.generateCustomIdForEntity( schema ),
            components: this.buildComponentsBySchema( schema.entities )
        };
    }

    protected shouldRenderAsContainer(): boolean {
        return ( this.constructor as typeof UIAdapterBase ).getComponent().shouldRenderAsContainer();
    }

    protected getMessage(
        _from?: UIAdapterBuildSource,
        _context?: TChannel | TInteraction,
        _argsFromManager?: UIArgs
    ): UIMessageOptions {
        const result: UIMessageOptions = {
            embeds: [],
            components: [],
            content: ""
        };

        let schema = this.getComponent().getSchema();

        switch ( schema.type ) {
            case "component":
                if ( this.shouldRenderAsContainer() ) {
                    return UIContainerRenderer.$.render(
                        ( schema.entities.embeds ?? [] ).map(
                            ( embed: UIEntitySchemaBase ) => embed.attributes as UIContainerEmbedAttributes
                        ),
                        this.buildLabelledRowsBySchema( schema.entities.elements ?? [] )
                    );
                }

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

    protected bindButton<TBindInteraction = ButtonInteraction<"cached">>(
        buttonName: string,
        callback: ( interaction: TBindInteraction ) => Promise<void>
    ) {
        const buttonMap = this.getEntityMap( buttonName );

        this.storeEntityCallback( buttonMap, callback );
    }

    protected bindModal<TBindInteraction = ModalSubmitInteraction<"cached">>(
        modalName: string,
        callback: ( interaction: TBindInteraction ) => Promise<void>
    ) {
        const modalMap = this.getEntityMap( modalName );

        this.storeEntityCallback( modalMap, callback );
    }

    protected bindModalWithButton<TBindInteraction = ModalSubmitInteraction<"cached">>(
        buttonName: string,
        modalName: string,
        callback: ( interaction: TBindInteraction ) => Promise<void>
    ) {
        this.bindModal<TBindInteraction>( modalName, callback );

        this.bindButton( buttonName, async( interaction ) => {
            await this.showModal( modalName, interaction );
        } );
    }

    protected bindSelectMenu<TBindInteraction = StringSelectMenuInteraction<"cached">>(
        selectMenuName: string,
        callback: ( interaction: TBindInteraction ) => Promise<void>
    ) {
        const selectMenuMap = this.getEntityMap( selectMenuName );

        this.storeEntityCallback( selectMenuMap, callback );
    }

    protected bindUserSelectMenu<TBindInteraction = UserSelectMenuInteraction<"cached">>(
        selectMenuName: string,
        callback: ( interaction: TBindInteraction ) => Promise<void>
    ) {
        const selectMenuMap = this.getEntityMap( selectMenuName );

        this.storeEntityCallback( selectMenuMap, callback );
    }

    public async awakeInternal( message: Message<true>, argsFromManager?: UIArgs ) {
        const args = {
            ...( await this.getArgsInternal( message.channel as TChannel, argsFromManager ) ),
            ...( await this.getArgsInternal( message, argsFromManager ) )
        };

        this.argsManager.setInitialArgs( this, message.id, args );

        return this.argsManager.getArgsById( this, message.id );
    }

    private async isArgsExpiredInternal( interaction: TInteraction ) {
        if ( !this.shouldRequireArgs || !this.shouldRequireArgs( interaction ) ) {
            return false;
        }

        const args = this.argsManager.getArgs( this, interaction );

        if ( args ) {
            return false;
        }

        if ( !interaction.isCommand() ) {
            // Use main deferUpdate method.
            await interaction.deferUpdate().catch( ( e ) => {
                this.$$.staticLogger.error(
                    this.isArgsExpiredInternal,
                    `Interaction id: '${ interaction.id }' failed to deferUpdate.`,
                    e
                );
            } );
        }

        let errorLog = `Interaction id: '${ interaction.id }'`;

        if ( interaction.isMessageComponent() ) {
            errorLog += `, message id: '${ interaction.message.id }' customId: '${ interaction.customId }'`;
        }

        errorLog += " has expired.";

        this.$$.staticLogger.warn( this.isArgsExpiredInternal, errorLog );

        const notice = "The interaction has expired. Please create new one.";

        const rows: ActionRowBuilder<MessageActionRowComponentBuilder>[] = [];

        // TODO: Make dedicated method for this.
        // TODO: Add to FAQ.
        const { RegenerateButton } = this.uiService.$$.getSystemElements();

        if ( RegenerateButton && this.regenerate ) {
            const button = new RegenerateButton();

            const buttonData = await button.build();

            buttonData.attributes.customId = this.customIdStrategy.generateId(
                this.getName() + UI_CUSTOM_ID_SEPARATOR + REGENERATE_BUTTON_ID
            );

            const buttonBuilder = new ButtonBuilder( buttonData.attributes );

            rows.push( new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents( buttonBuilder ) );
        }

        // The screen being replaced is whatever this adapter draws, and a container takes no
        // `content` and no `embeds` - discord refuses the edit outright over one, which is the
        // notice failing to arrive at all and the way back out of an expired screen disappearing
        // with it.
        const options: UIMessageOptions = this.shouldRenderAsContainer()
            ? UIContainerRenderer.$.render( [ { description: notice } ], rows.map( ( row ) => ( { row } ) ) )
            : { components: rows, embeds: [], content: notice };

        await interaction.editReply( options );

        return true;
    }

    /**
     * Function preserveSystemArgs() :: Carries across a rebuild the args no adapter hands back.
     *
     * `getArgsInternal()` returns whatever the adapter's own `getReplyArgs()` builds, and those
     * build a fresh object naming their own fields - `clear-chat` returns `{}` - so anything the
     * framework put on the args going in is gone by the time they come back. The customization
     * target worked out by `triggerTransition()` and the step asked for by name are both that, and
     * both were meant, so they are laid back over the top.
     *
     * The state travels with the component rather than on its own: an override is written about one
     * screen of one component, and either half says nothing without the other.
     */
    private preserveSystemArgs( resolvedArgs: UIArgs, sourceArgs?: UIArgs ): UIArgs {
        if ( ! sourceArgs ) {
            return resolvedArgs;
        }

        if ( sourceArgs._customizationComponent ) {
            resolvedArgs._customizationComponent = sourceArgs._customizationComponent;
            resolvedArgs._customizationState = sourceArgs._customizationState;
        }

        if ( sourceArgs._step ) {
            resolvedArgs._step = sourceArgs._step;
        }

        return resolvedArgs;
    }

    private async getArgsInternal(
        context: TChannel | TInteraction | Message<true>,
        argsFromManager?: UIArgs
    ): Promise<UIArgs> {
        // TODO: Refactor this method.
        let args: UIArgs = {},
            contextId: "start" | "reply" | "edit-message" | "unknown" = "unknown";

        if ( context instanceof Message ) {
            contextId = "edit-message";
        } else if ( context instanceof GuildChannel ) {
            contextId = "start";
        } else if ( context.isMessageComponent?.() || context.isCommand?.() || context.isModalSubmit?.() ) {
            contextId = "reply";
        }

        switch ( contextId ) {
            case "start":
                args = await InteractionTrace.$.span(
                    "gui-args",
                    `${ this.getName() }.getStartArgs`,
                    async() => this.getStartArgs( context as TChannel, argsFromManager )
                );
                break;

            case "reply":
                args = fillGapsFrom( await InteractionTrace.$.span(
                    "gui-args",
                    `${ this.getName() }.getReplyArgs`,
                    async() => this.getReplyArgs( context as TInteraction, argsFromManager )
                ), argsFromManager );
                break;

            case "edit-message":
                const conditionalArgs = await InteractionTrace.$.span(
                    "gui-args",
                    `${ this.getName() }.getEditMessageArgs`,
                    async() => this.getEditMessageArgs?.( context as Message<true>, argsFromManager )
                );

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
            argsFromManager
        } );

        return args;
    }
}
