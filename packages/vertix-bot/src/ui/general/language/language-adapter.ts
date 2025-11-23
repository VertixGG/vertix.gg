import { GuildDataManager } from "@vertix.gg/base/src/managers/guild-data-manager";
import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { AdminAdapterBuilder } from "@vertix.gg/gui/src/builders/admin-adapter-builder";

import { LanguageComponent } from "@vertix.gg/bot/src/ui/general/language/language-component";

import type {
    ButtonInteraction,
    StringSelectMenuInteraction,
    BaseGuildTextChannel
} from "discord.js";
import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type UIService from "@vertix.gg/gui/src/ui-service";

type LanguageInteractions =
    | ButtonInteraction<"cached">
    | StringSelectMenuInteraction<"cached">;

const LanguageAdapter = new AdminAdapterBuilder<BaseGuildTextChannel, LanguageInteractions, UIArgs>(
    "VertixBot/UI-General/LanguageAdapter"
)
    .setComponent( LanguageComponent )
    .getReplyArgs( async() => ( {} ) )
    .onEntityMap( async( { bindSelectMenu, bindButton } ) => {
        bindSelectMenu(
            "VertixBot/UI-General/LanguageSelectMenu",
            async( context, interaction ) => {
                const language = interaction.values[ 0 ];

                await GuildDataManager.$.setLanguage( interaction.guild, language );

                await context.editReply( interaction, {
                    _language: language
                } );
            },
            {
                flowTriggers: [
                    {
                        flowName: "VertixBot/UI-General/LanguageFlow",
                        transition: "VertixBot/UI-General/LanguageFlow/Transitions/SelectLanguage",
                        mutations: [ { type: "set", path: [ "selectedLanguage" ] } ],
                        navigation: {
                            targetState: "VertixBot/UI-General/LanguageFlow/States/LanguageSelected"
                        }
                    }
                ]
            }
        );

        bindButton(
            "VertixBot/UI-General/DoneButton",
            async( context, interaction ) => {
                const uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
                await uiService.get( "VertixBot/UI-General/SetupAdapter" )?.editReply( interaction );
            },
            {
                flowTriggers: [
                    {
                        flowName: "VertixBot/UI-General/LanguageFlow",
                        transition: "VertixBot/UI-General/LanguageFlow/Transitions/Done",
                        navigation: {
                            targetState: "VertixBot/UI-General/LanguageFlow/States/Completed"
                        }
                    }
                ]
            }
        );
    } )
    .build();

export { LanguageAdapter };
