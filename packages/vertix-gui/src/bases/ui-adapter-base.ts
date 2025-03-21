import process from "process";

import { DEFAULT_GUILD_SETTINGS_KEY_LANGUAGE } from "@vertix.gg/base/src/definitions/guild-data-keys";
import { ForceMethodImplementation } from "@vertix.gg/base/src/errors";

import { GuildDataManager } from "@vertix.gg/base/src/managers/guild-data-manager";

import { createDebugger } from "@vertix.gg/base/src/modules/debugger";
import { Logger } from "@vertix.gg/base/src/modules/logger";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import {
    ActionRowBuilder,
    ButtonBuilder,
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

import type {
    ChannelType,
    InteractionEditReplyOptions,
    MessageComponentInteraction,
    ModalSubmitInteraction,
    PermissionsBitField,
} from "discord.js";
import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";

const REGENERATE_BUTTON_ID = "regenerate-button";

const ADAPTER_CLEANUP_EPHEMERAL_TIMEOUT = Number( process.env.ADAPTER_CLEANUP_EPHEMERAL_TIMEOUT ) || 600000; // 10 minutes.

const ADAPTER_CLEANUP_STATIC_ARGS_TIMEOUT = Number( process.env.ADAPTER_CLEANUP_STATIC_ARGS_TIMEOUT ) || 600000; // 10 minutes.

/**
 * TChannel - The channel type that will be used if the adapter starts interaction.
 * TInteraction - The channel type that will be used if the adapter replies to interaction.
 */
export abstract class UIAdapterBase<
    TChannel extends UIAdapterStartContext,
    TInteraction extends UIAdapterReplyContext
> extends UIAdapterEntityBase {
    private static staticLogger: Logger = new Logger( this.getName() );
    private static staticDebugger = createDebugger( this.getName(), "UI" );

    private static validatedOnce = false;

    private static ephemeralInteractions: {
        [userIdPlusMessageId: string]: {
            interaction: MessageComponentInteraction | ModalSubmitInteraction;
            rawCustomId: string;
        };
    } = {};

    private static staticArgs = new UIArgsManager( picocolors.green( "StaticArgs" ) );
    private static staticSystemArgs = new UIArgsManager( picocolors.red( "SystemArgs" ) );

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
        if ( !UIAdapterBase.staticArgs ) {
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
                UIAdapterBase.staticDebugger.log(
                    UIAdapterBase.cleanupTimer,
                    `Deleting old ephemeral interaction: '${ interaction.id }' from memory`
                );

                delete UIAdapterBase.ephemeralInteractions[ id ];
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

        const ownerId = "string" === typeof context ? context : context.guildId;

        if ( ownerId === "direct-message" ) {
            args._language = UI_LANGUAGES_INITIAL_CODE;
        } else if ( ownerId && !args._language ) {
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

        const schema = await this.getComponent().build( args );

        if ( "unknown" !== from ) {
            await this.onAfterBuild?.( args, from, context );
        }

        return schema;
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
        }

        await this.runEntityCallback( entityName, interaction as TInteraction );
    }

    public async runInitial( interaction: MessageComponentInteraction, args?: UIArgs ) {
        this.argsManager.setInitialArgs( this, this.argsManager.getArgsId( interaction as TInteraction ), args || {}, {
            overwrite: true
        } );

        return this.run( interaction as MessageComponentInteraction );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public async showModal( modalName: string, interaction: MessageComponentInteraction<"cached"> ) {
        // TODO: Implement the logic
    }

    public async waitUntilInitialized() {
        return this.getComponent().waitUntilInitialized();
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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected getReplyArgs( interaction?: TInteraction, argsFromManager?: UIArgs ): Promise<UIArgs> | {} {
        throw new ForceMethodImplementation( this, "getReplyArgs" );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected getEditMessageArgs?( _message?: Message<true>, argsFromManager?: UIArgs ): Promise<UIArgs> | {} {
        throw new ForceMethodImplementation( this, "getEditMessageArgs" );
    }

    protected getArgsManager() {
        return this.argsManager;
    }

    protected getSystemArgs() {
        return UIAdapterBase.staticSystemArgs;
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

        const options: InteractionEditReplyOptions = {
            components: [],
            embeds: [],
            content: "The interaction has expired. Please create new one."
        };

        const { RegenerateButton } = this.uiService.$$.getSystemElements();

        if ( RegenerateButton && this.regenerate ) {
            const button = new RegenerateButton();

            const buttonData = await button.build();

            buttonData.attributes.customId = this.customIdStrategy.generateId(
                this.getName() + UI_CUSTOM_ID_SEPARATOR + REGENERATE_BUTTON_ID
            );

            const buttonBuilder = new ButtonBuilder( buttonData.attributes );

            const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents( buttonBuilder );

            options.components = [ actionRow ];
        }

        await interaction.editReply( options );

        return true;
    }

    private async getArgsInternal(
        context: TChannel | TInteraction | Message<true>,
        argsFromManager?: UIArgs
    ): Promise<UIArgs> {
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
            argsFromManager
        } );

        return args;
    }
}
