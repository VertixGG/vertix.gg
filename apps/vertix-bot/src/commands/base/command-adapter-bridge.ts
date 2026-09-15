import { ChannelType } from "discord.js";

import { ChannelModel, MASTER_INTERNAL_TYPES } from "@vertix.gg/data/src/models/channel/channel-model";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { COMMAND_TIERS } from "@vertix.gg/bot/src/commands/base/command-tiers";
import { passesCommandTier } from "@vertix.gg/bot/src/commands/base/command-tier-gate";

import { COMMAND_HANDLERS } from "@vertix.gg/bot/src/commands/handlers";

import { applyResolvedChannelToInteraction } from "@vertix.gg/bot/src/utils/interaction-channel";

import {
    declareInteractionChannelContext
} from "@vertix.gg/bot/src/ui/general/misc/interaction-channel-context";

import GlobalLogger from "@vertix.gg/bot/src/global-logger";

import type { ICommandDefinition } from "@vertix.gg/bot/src/commands/definitions/command-definitions";
import type { TCommandTier } from "@vertix.gg/bot/src/commands/base/command-tiers";
import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";
import type { UIAdapterVersioningService } from "@vertix.gg/gui/src/ui-adapter-versioning-service";
import type { UIService } from "@vertix.gg/gui/src/ui-service";
import type { CommandInteraction, VoiceChannel } from "discord.js";

const UI_VERSION_V2 = 2;

/**
 * Function openAdapterFromCommand() :: Opens an adapter's interface for a slash command.
 *
 * The interfaces this opens were built to be reached from a button sitting inside a voice channel,
 * and they read their channel straight off the interaction because from there the two are the same.
 * A command is typed wherever the member is standing, so the channel has to be worked out and put
 * where the adapters look before any of them runs - which is the whole of what this does that the
 * button path does not.
 *
 * Everything else here is deliberately the button path's own: the same resolution, the same gate,
 * the same adapters. A command is a second door onto one room, not a second room.
 *
 * Order matters. The channel is resolved first because the gate needs it to tell "you own nothing"
 * from "that one is not yours"; the gate runs before the interaction is rewritten so its refusal
 * lands in the channel the member typed in; and only a caller who cleared it sees the interface.
 */
export async function openAdapterFromCommand( options: {
    interaction: CommandInteraction<"cached">;
    definition: ICommandDefinition;
} ): Promise<void> {
    const { interaction, definition } = options;

    const channel = await resolveCommandChannel( interaction, definition.tier );

    // Said rather than left to be guessed at. An interface asks whether the member is in the
    // channel they mean, and for a command that is not something to read off where they typed - it
    // is whether the channel above was found. A command that names one is standing in it as far as
    // anything downstream is concerned; one that does not is a member choosing.
    declareInteractionChannelContext( interaction, channel ? "command-in-channel" : "command-anywhere" );

    if ( ! await passesCommandTier( definition.tier, interaction, channel ) ) {
        return;
    }

    const isV2 = await isV2Channel( channel );
    const adapterName = isV2 ? ( definition.adapterNameV2 ?? null ) : definition.adapterName;

    if ( ! adapterName ) {
        await ServiceLocator.$.get<UIService>( "VertixGUI/UIService" )
            .get( "VertixBot/UI-General/FeatureMissingInV2Adapter" )
            ?.ephemeral( interaction );

        return;
    }

    // A handler is given the channel as resolved rather than written onto the interaction: it is
    // not opening an interface, so nothing downstream of it expects to read a channel off there.
    const handler = COMMAND_HANDLERS[ definition.flowTransition ];

    if ( handler ) {
        const uiAdapter = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" )
            .get<"execution">( adapterName );

        if ( ! uiAdapter ) {
            return reportMissingAdapter( interaction, adapterName );
        }

        await handler( interaction, channel, uiAdapter, isV2 );

        return;
    }

    if ( channel ) {
        applyResolvedChannelToInteraction( interaction, channel );
    }

    await openAdapter( interaction, adapterName, {
        channelId: channel?.id,
        modalName: isV2 ? definition.modalNameV2 : definition.modalName,
        executionStep: definition.executionStep
    } );
}

/**
 * Function openAdapter() :: Opens the adapter, at a given screen where one was asked for.
 *
 * An adapter holding several screens opens at its first unless told otherwise, and some commands
 * mean a screen further in - `/manage badwords` is the badwords screen of the setup interface, not
 * the interface. `ephemeralWithStep()` is how that is asked for, and it is on the execution-steps
 * adapter rather than the plain one, which is why the two are fetched differently.
 */
async function openAdapter(
    interaction: CommandInteraction<"cached">,
    adapterName: string,
    options: { modalName?: string; executionStep?: string; channelId?: string }
): Promise<void> {
    const { modalName, executionStep, channelId } = options;
    const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );

    // Rename, limit and status are typed rather than picked, and their adapters draw nothing until
    // the modal comes back. The button beside them opens the modal too - this is the same call.
    if ( modalName ) {
        const uiAdapter = uiService.get( adapterName );

        if ( ! uiAdapter ) {
            return reportMissingAdapter( interaction, adapterName );
        }

        if ( await uiAdapter.showModal( modalName, interaction ) ) {
            return;
        }

        // Nothing is on screen and the interaction is still unanswered, so this is the last chance
        // to say anything before discord says it instead.
        await uiService.get( "VertixBot/UI-General/CommandFailedAdapter" )
            ?.ephemeral( interaction );

        return;
    }

    if ( executionStep ) {
        const uiAdapter = uiService.get<"execution">( adapterName );

        if ( ! uiAdapter ) {
            return reportMissingAdapter( interaction, adapterName );
        }

        await uiAdapter.ephemeralWithStep( interaction, executionStep, { channelId } );

        return;
    }

    const uiAdapter = uiService.get( adapterName );

    if ( ! uiAdapter ) {
        return reportMissingAdapter( interaction, adapterName );
    }

    // Which channel this was opened about, written onto the args rather than left to the
    // interaction alone. Every press after the first arrives on the ephemeral rather than in the
    // channel, so the interaction stops carrying it - and the resolution then falls back to
    // wherever the member is sitting, which is not necessarily where they started.
    await uiAdapter.ephemeral( interaction, { channelId } );
}

function reportMissingAdapter( interaction: CommandInteraction<"cached">, adapterName: string ): void {
    GlobalLogger.$.error(
        reportMissingAdapter,
        `Guild id: '${ interaction.guildId }' - Adapter '${ adapterName }' is not registered`
    );
}

/**
 * Function isV2Channel() :: Whether this channel came from a generator running the older interface.
 *
 * The versioning service is asked rather than the database directly, so a command resolves the
 * version by the same strategy everything else does; what it is not asked for is the adapter,
 * because it forms a versioned name by swapping the `UI-Vn` segment and the two interfaces do not
 * name a feature alike.
 */
async function isV2Channel( channel: VoiceChannel | null ): Promise<boolean> {
    if ( ! channel ) {
        return false;
    }

    // A generator has no version of its own to read, and the versioning service answers an
    // unanswerable question with the oldest version it knows - which turned "this is not a channel
    // a generator made" into "your generator is too old for that". Two different things, and the
    // second one untrue.
    //
    // Only generators are refused, not everything that fails to say it is a dynamic channel: the
    // column defaults to `DEFAULT_CHANNEL`, and a row old enough to say that is still a real
    // channel whose version must be read rather than assumed.
    const channelDB = await ChannelModel.$.getByChannelId( channel.id );

    if ( ! channelDB || MASTER_INTERNAL_TYPES.includes( channelDB.internalType ) ) {
        return false;
    }

    const versioningService = ServiceLocator.$.get<UIAdapterVersioningService>(
        "VertixGUI/UIVersioningAdapterService",
        { silent: true }
    );

    if ( ! versioningService ) {
        return false;
    }

    return UI_VERSION_V2 === await versioningService.determineVersion( channel );
}

/**
 * Function resolveCommandChannel() :: Which dynamic channel the caller means.
 *
 * An admin command is about the server rather than any one channel, so it asks for none - and
 * asking anyway would make the answer depend on where the admin happened to be sitting.
 *
 * An owner's command means the channel they own, wherever they typed it. The rest - knocking,
 * inviting, claiming - are about somebody else's channel or about no channel in particular, and
 * resolve the way a press does.
 */
async function resolveCommandChannel(
    interaction: CommandInteraction<"cached">,
    tier: TCommandTier
): Promise<VoiceChannel | null> {
    if ( COMMAND_TIERS.ADMIN === tier ) {
        return null;
    }

    if ( COMMAND_TIERS.OWNER_OF_DYNAMIC === tier ) {
        return await resolveOwnedDynamicChannel( interaction );
    }

    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>(
        "VertixBot/Services/DynamicChannel",
        { silent: true }
    );

    if ( ! dynamicChannelService ) {
        return null;
    }

    return await dynamicChannelService.resolveTargetChannel( interaction );
}

/**
 * Function resolveOwnedDynamicChannel() :: The caller's own channel, wherever they asked from.
 *
 * `/voice rename` means the asker's channel. It does not mean whichever voice channel they are
 * sitting in, and it does not mean whatever the generator beside them made - both of which the
 * press-shaped resolution answered with, because a press happens somewhere and a command is typed
 * anywhere. Standing in a generator's own chat was enough to be handed the generator.
 *
 * So the question asked here is the one the command actually poses: which channel does this member
 * own. Being sat in one of them decides it when they own several; failing that the newest, so the
 * answer is at least the same every time rather than however the database happened to order them.
 */
async function resolveOwnedDynamicChannel(
    interaction: CommandInteraction<"cached">
): Promise<VoiceChannel | null> {
    const ownedDB = ( await ChannelModel.$.getDynamics( interaction.guildId ) )
        .filter( ( channelDB ) => channelDB.userOwnerId === interaction.user.id );

    if ( ! ownedDB.length ) {
        return null;
    }

    const standingInId = interaction.member.voice.channelId;

    const ordered = ownedDB
        .slice()
        .sort( ( a, b ) => b.createdAtDiscord - a.createdAtDiscord );

    const preferred = ordered.find( ( channelDB ) => channelDB.channelId === standingInId ) ?? ordered[ 0 ];

    const channel = interaction.guild.channels.cache.get( preferred.channelId )
        ?? await interaction.guild.channels.fetch( preferred.channelId ).catch( () => null );

    return ChannelType.GuildVoice === channel?.type ? channel : null;
}
