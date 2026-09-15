
import { DynamicExecutionAdapterBuilder } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-execution-adapter-builder";

import { DynamicChannelInviteComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/invite/dynamic-channel-invite-component";
import { DynamicChannelInviteButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/invite/dynamic-channel-invite-button";
import { getOwnedChannels } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-channel-lists";

import { resolveMasterChannelId } from "@vertix.gg/bot/src/utils/master-channel";
import {
    defineInviteStates,
    getInviteReplyArgs
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/invite/dynamic-channel-invite-states";

import type {
    UIDefaultButtonChannelVoiceInteraction,
    UIDefaultStringSelectMenuChannelTextInteraction,
    UIDefaultUserSelectMenuChannelVoiceInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

import type { IOwnedChannelOption } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/invite/dynamic-channel-invite-channel-menu";

type DefaultInteraction =
    | UIDefaultUserSelectMenuChannelVoiceInteraction
    | UIDefaultStringSelectMenuChannelTextInteraction
    | UIDefaultButtonChannelVoiceInteraction;

const DynamicChannelInviteAdapter = new DynamicExecutionAdapterBuilder<DefaultInteraction>(
    "VertixBot/UI-V3/DynamicChannelInviteAdapter"
)
    .setComponent( DynamicChannelInviteComponent )
    .setExcludedElements( [ DynamicChannelInviteButton ] )
    .defineTransactions( ( tx ) => {
        defineInviteStates( tx )
            .setInitialState( "Default" )
            .addState( "Default", { executionStep: "default" } )
            .addTransition( "Open", { from: "Default", to: "SelectUser" } )
            .addTransition( "OpenChannels", { from: "Default", to: "SelectChannel" } )
            .addTransition( "NoChannel", {
                from: "Default",
                to: "NoChannel",
                mutations: [ { type: "set", path: [ "masterChannelId" ] } ]
            } )
            .bindButton<UIDefaultButtonChannelVoiceInteraction>(
                "VertixBot/UI-V3/DynamicChannelInviteButton",
                "Open",
                async( context, interaction ) => {
                    const owned = await getOwnedChannels( interaction, interaction.member );

                    if ( ! owned.length ) {
                        // The generator is the answer to having no channel, so name it rather than
                        // describing it - this is what every other screen says in the same spot.
                        const masterChannelId = await resolveMasterChannelId( interaction );

                        context.setArgs( interaction, { masterChannelId } );

                        await context.triggerTransition( "NoChannel", interaction, { masterChannelId } );
                        return;
                    }

                    const standingIn = owned.find( ( channel ) => channel.id === interaction.channelId );

                    const resolved = standingIn ?? ( 1 === owned.length ? owned[ 0 ] : null );

                    if ( resolved ) {
                        context.setArgs( interaction, { channelId: resolved.id } );

                        await context.triggerTransition( "Open", interaction );
                        return;
                    }

                    const ownedChannels: IOwnedChannelOption[] = owned.map( ( channel ) => ( {
                        id: channel.id,
                        name: channel.name
                    } ) );

                    context.setArgs( interaction, { ownedChannels } );

                    await context.triggerTransition( "OpenChannels", interaction, { ownedChannels } );
                }
            );
    } )
    .getStartArgs( async() => ( {} ) )
    .getReplyArgs( getInviteReplyArgs )
    .build();

export { DynamicChannelInviteAdapter };
