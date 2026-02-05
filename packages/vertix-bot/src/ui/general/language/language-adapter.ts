import { GuildDataManager } from "@vertix.gg/base/src/managers/guild-data-manager";
import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { AdminExecutionAdapterBuilder } from "@vertix.gg/gui/src/builders/admin-execution-adapter-builder";

import { LanguageComponent } from "@vertix.gg/bot/src/ui/general/language/language-component";

import type {
    ButtonInteraction,
    StringSelectMenuInteraction,
    BaseGuildTextChannel
} from "discord.js";
import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type UIService from "@vertix.gg/gui/src/ui-service";
import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";

type LanguageInteractions =
    | ButtonInteraction<"cached">
    | StringSelectMenuInteraction<"cached">;

const LanguageAdapter = new AdminExecutionAdapterBuilder<BaseGuildTextChannel, LanguageInteractions, UIArgs>(
    "VertixBot/UI-General/LanguageAdapter"
)
    .setComponent( LanguageComponent )
    .getReplyArgs( async() => ( {} ) )
    .defineTransactions( tx => {
        tx.setInitialState( "Initial" )
            .addState( "Initial", { executionStep: "default" } )
            .addState( "LanguageSelected", { executionStep: "default" } )
            .addState( "Completed", { executionStep: "default" } )
            .addTransition( "SelectLanguage", { from: [ "Initial", "LanguageSelected" ], to: "LanguageSelected" } )
            .addTransition( "Done", { from: [ "Initial", "LanguageSelected" ], to: "Completed" } )
            .addEntryPoint( {
                flowName: "VertixBot/UI-General/SetupFlow",
                transition: "VertixBot/UI-General/SetupFlow/Transitions/ChooseLanguage",
                targetState: "VertixBot/UI-General/LanguageFlow/States/Initial",
                description: "Entry point triggered by SetupFlow via Choose Language button"
            } )
            .bindSelectMenu<StringSelectMenuInteraction<"cached">>(
                "VertixBot/UI-General/LanguageSelectMenu",
                "SelectLanguage",
                async( context, interaction ) => {
                    const language = interaction.values[ 0 ];

                    await GuildDataManager.$.setLanguage( interaction.guild, language );

                    // Refresh panel channel messages in the background so they display the new language.
                    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );
                    dynamicChannelService?.refreshControlPanelsForGuild( interaction.guild ).catch( () => {} );

                    await context.triggerTransition( "SelectLanguage", interaction, {
                        _language: language
                    } );
                }
            )
            .bindButton(
                "VertixBot/UI-General/DoneButton",
                "Done",
                async( _context, interaction ) => {
                    const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
                    await uiService.get( "VertixBot/UI-General/SetupAdapter" )?.editReply( interaction );
                }
            );
    } )
    .build();

export { LanguageAdapter };
