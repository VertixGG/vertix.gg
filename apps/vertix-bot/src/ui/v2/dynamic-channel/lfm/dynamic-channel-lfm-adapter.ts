import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { DynamicChannelLfmComponent } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/lfm/dynamic-channel-lfm-component";
import { DynamicChannelLfmButton } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/lfm/dynamic-channel-lfm-button";

import { DynamicExecutionAdapterBuilder } from "@vertix.gg/bot/src/ui/v2/dynamic-channel/base/dynamic-execution-adapter-builder";

import {
    DYNAMIC_CHANNEL_LFM_TIMING,
    DynamicChannelLfmPostResultCode
} from "@vertix.gg/bot/src/definitions/dynamic-channel-lfm";

import type {
    UIDefaultButtonChannelVoiceInteraction,
    UIDefaultModalChannelVoiceInteraction,
    UIDefaultStringSelectMenuChannelVoiceInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { IExecutionAdapterContext } from "@vertix.gg/gui/src/builders/builders-definitions";

import type { DynamicChannelLfmService } from "@vertix.gg/bot/src/services/dynamic-channel-lfm-service";

type DefaultInteraction =
    | UIDefaultButtonChannelVoiceInteraction
    | UIDefaultStringSelectMenuChannelVoiceInteraction
    | UIDefaultModalChannelVoiceInteraction;

const MILLISECONDS_PER_MINUTE = 60 * 1000;

const PENDING_NOTE_TIMEOUT_MS = 5 * 60 * 1000;

/**
 * The note, held between writing it and choosing where it goes.
 *
 * A select menu interaction carries nothing of the modal that preceded it, so the note has to wait
 * somewhere. In memory and keyed per owner per channel, the same way the transfer screen carries
 * its selected user - a note that outlives the menu it was written for is worth less than the
 * timeout that drops it.
 */
const pendingNotes = new Map<string, { note: string; timeout: NodeJS.Timeout }>();

function getLfmService() {
    return ServiceLocator.$.get<DynamicChannelLfmService>( "VertixBot/Services/DynamicChannelLfm" );
}

function pendingKey( channelId: string, userId: string ) {
    return `${ channelId }:${ userId }`;
}

function setPendingNote( channelId: string, userId: string, note: string ) {
    const key = pendingKey( channelId, userId );

    const existing = pendingNotes.get( key );

    if ( existing ) {
        clearTimeout( existing.timeout );
    }

    pendingNotes.set( key, {
        note,
        timeout: setTimeout( () => pendingNotes.delete( key ), PENDING_NOTE_TIMEOUT_MS )
    } );
}

function takePendingNote( channelId: string, userId: string ) {
    const key = pendingKey( channelId, userId );

    const pending = pendingNotes.get( key );

    if ( ! pending ) {
        return "";
    }

    clearTimeout( pending.timeout );

    pendingNotes.delete( key );

    return pending.note;
}

/**
 * Function onNoteSubmitted() :: The note is in, so now the room is checked and the post goes out.
 *
 * Every check lives here rather than behind the button, because the button's one job is to open
 * the modal inside three seconds. This interaction is fresh and has its own budget.
 */
async function onNoteSubmitted(
    context: IExecutionAdapterContext<UIDefaultModalChannelVoiceInteraction, UIArgs>,
    interaction: UIDefaultModalChannelVoiceInteraction
) {
    const noteInputId = context.customIdStrategy.generateId(
        "VertixBot/UI-V2/DynamicChannelLfmAdapter:VertixBot/UI-V2/DynamicChannelLfmNoteInput"
    );

    const note = interaction.fields.getTextInputValue( noteInputId );

    const lfmService = getLfmService();

    const eligibility = await lfmService.getEligibility( interaction.channel );

    if ( DynamicChannelLfmPostResultCode.Cooldown === eligibility ) {
        const remaining = await lfmService.getCooldownRemaining( interaction.channel )
            || DYNAMIC_CHANNEL_LFM_TIMING.POST_COOLDOWN_MS;

        await context.ephemeralWithStep( interaction, "VertixBot/UI-V2/DynamicChannelLfmCooldown", {
            retryMinutes: String( Math.ceil( remaining / MILLISECONDS_PER_MINUTE ) )
        } );

        return;
    }

    if ( DynamicChannelLfmPostResultCode.Success !== eligibility ) {
        await context.ephemeralWithStep( interaction, "VertixBot/UI-V2/DynamicChannelLfmUnavailable", {
            reasonCode: eligibility
        } );

        return;
    }

    const destinations = await lfmService.getDestinations( interaction.channel, interaction.member );

    // Not `NotConfigured`: eligibility answers that first and returns above, so a generator that
    // got this far has destinations. An empty list here is them being filtered out - the member
    // cannot see any of them, which `getDestinations()` does on purpose, or the channel they name
    // is gone. Either way somebody did set this up, and saying otherwise sends an admin looking
    // for a switch that is already on.
    if ( ! destinations.length ) {
        await context.ephemeralWithStep( interaction, "VertixBot/UI-V2/DynamicChannelLfmUnavailable", {
            reasonCode: DynamicChannelLfmPostResultCode.DestinationUnavailable
        } );

        return;
    }

    // One destination is not a choice, so it is not offered as one.
    if ( 1 === destinations.length ) {
        await postAndAnswer( context, interaction, destinations[ 0 ].id, note );

        return;
    }

    setPendingNote( interaction.channel.id, interaction.user.id, note );

    await context.ephemeralWithStep( interaction, "VertixBot/UI-V2/DynamicChannelLfmSelectChannel", {
        lfmDestinations: destinations
    } );
}

async function onLfmChannelSelected(
    context: IExecutionAdapterContext<UIDefaultStringSelectMenuChannelVoiceInteraction, UIArgs>,
    interaction: UIDefaultStringSelectMenuChannelVoiceInteraction
) {
    const lfmChannelId = interaction.values.at( 0 );

    if ( ! lfmChannelId ) {
        await context.updateInteractionDefer( interaction );

        return;
    }

    const note = takePendingNote( interaction.channel.id, interaction.user.id );

    await postAndAnswer( context, interaction, lfmChannelId, note );
}

async function postAndAnswer<TInteraction extends DefaultInteraction>(
    context: IExecutionAdapterContext<TInteraction, UIArgs>,
    interaction: TInteraction,
    lfmChannelId: string,
    note: string
) {
    const result = await getLfmService().post( interaction.channel, lfmChannelId, note, interaction.member );

    if ( DynamicChannelLfmPostResultCode.Cooldown === result.code ) {
        const remaining = result.retryAfterMs || DYNAMIC_CHANNEL_LFM_TIMING.POST_COOLDOWN_MS;

        await context.ephemeralWithStep( interaction, "VertixBot/UI-V2/DynamicChannelLfmCooldown", {
            retryMinutes: String( Math.ceil( remaining / MILLISECONDS_PER_MINUTE ) )
        } );

        return;
    }

    if ( DynamicChannelLfmPostResultCode.Success !== result.code ) {
        await context.ephemeralWithStep( interaction, "VertixBot/UI-V2/DynamicChannelLfmUnavailable", {
            reasonCode: result.code
        } );

        return;
    }

    await context.ephemeralWithStep( interaction, "VertixBot/UI-V2/DynamicChannelLfmPosted", {
        lfmChannelId
    } );
}

const DynamicChannelLfmAdapter = new DynamicExecutionAdapterBuilder<DefaultInteraction>(
    "VertixBot/UI-V2/DynamicChannelLfmAdapter"
)
    .setComponent( DynamicChannelLfmComponent )
    .setExcludedElements( [ DynamicChannelLfmButton ] )
    .defineTransactions( ( tx ) => {
        tx
            .setInitialState( "Default" )
            .addState( "Default", {
                executionStep: "default",
                elementsGroup: "VertixBot/UI-V2/DynamicChannelLfmChannelMenuGroup"
            } )
            .addState( "SelectChannel", {
                executionStep: "VertixBot/UI-V2/DynamicChannelLfmSelectChannel",
                navigationType: "ephemeral",
                embedsGroup: "VertixBot/UI-V2/DynamicChannelLfmSelectChannelEmbedGroup",
                elementsGroup: "VertixBot/UI-V2/DynamicChannelLfmChannelMenuGroup"
            } )
            .addState( "Posted", {
                executionStep: "VertixBot/UI-V2/DynamicChannelLfmPosted",
                navigationType: "ephemeral",
                previewDefaultVars: { lfmChannelId: "123456789" },
                embedsGroup: "VertixBot/UI-V2/DynamicChannelLfmPostedEmbedGroup"
            } )
            .addState( "Cooldown", {
                executionStep: "VertixBot/UI-V2/DynamicChannelLfmCooldown",
                navigationType: "ephemeral",
                previewDefaultVars: { retryMinutes: "10" },
                embedsGroup: "VertixBot/UI-V2/DynamicChannelLfmCooldownEmbedGroup"
            } )
            .addState( "Unavailable", {
                executionStep: "VertixBot/UI-V2/DynamicChannelLfmUnavailable",
                navigationType: "ephemeral",
                previewDefaultVars: { reasonCode: String( DynamicChannelLfmPostResultCode.NotConfigured ) },
                embedsGroup: "VertixBot/UI-V2/DynamicChannelLfmUnavailableEmbedGroup"
            } )
            .addTransition( "NoteSubmitted", {
                from: "Default",
                to: "Posted",
                mutations: [ { type: "set", path: [ "lfmChannelId" ] } ]
            } )
            .addTransition( "SelectDestination", { from: "Default", to: "SelectChannel" } )
            .addTransition( "ChannelSelected", { from: "SelectChannel", to: "Posted" } )
            .addTransition( "CoolingDown", { from: "Default", to: "Cooldown" } )
            .addTransition( "NotAvailable", { from: [ "Default", "SelectChannel" ], to: "Unavailable" } )
            .bindSelectMenu<UIDefaultStringSelectMenuChannelVoiceInteraction>(
                "VertixBot/UI-V2/DynamicChannelLfmChannelMenu",
                "ChannelSelected",
                onLfmChannelSelected
            )
            .bindModal<UIDefaultModalChannelVoiceInteraction>(
                "VertixBot/UI-V2/DynamicChannelLfmNoteModal",
                "NoteSubmitted",
                onNoteSubmitted
            );
    } )
    .getReplyArgs( async( context, interaction, argsFromManager ) => {
        switch ( context.getCurrentExecutionStep( interaction )?.name ) {
            case "VertixBot/UI-V2/DynamicChannelLfmSelectChannel":
                return { lfmDestinations: argsFromManager?.lfmDestinations };

            case "VertixBot/UI-V2/DynamicChannelLfmPosted":
                return { lfmChannelId: argsFromManager?.lfmChannelId };

            case "VertixBot/UI-V2/DynamicChannelLfmCooldown":
                return { retryMinutes: argsFromManager?.retryMinutes };

            case "VertixBot/UI-V2/DynamicChannelLfmUnavailable":
                return { reasonCode: argsFromManager?.reasonCode };
        }

        return {};
    } )
    .build();

export { DynamicChannelLfmAdapter };
