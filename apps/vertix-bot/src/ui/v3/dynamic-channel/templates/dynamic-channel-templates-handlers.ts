import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { ChannelTemplateModel } from "@vertix.gg/data/src/models/data/channel-template-model";
import { GuildDataManager } from "@vertix.gg/data/src/managers/guild-data-manager";

import type { ChannelTemplateConfig } from "@vertix.gg/data/src/interfaces/channel-template";
import type { ChannelPrivacyState } from "@vertix.gg/definitions/src/dynamic-channel-definitions";
import type {
    UIDefaultButtonChannelVoiceInteraction,
    UIDefaultModalChannelVoiceInteraction,
    UIDefaultStringSelectMenuChannelVoiceTextChannelInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { IExecutionAdapterContext } from "@vertix.gg/gui/src/builders/builders-definitions";
import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";
import type { VoiceChannel } from "discord.js";

/**
 * What templates do, shared by the interface the templates button opens and the one `/voice
 * templates` opens.
 *
 * Every one of these navigates by transition name, which both adapters declare alike - so applying
 * a template is one act however it was asked for, and a change to what applying means lands on both
 * doors at once. The one exception is the save modal, which has to be told which adapter is asking:
 * a modal's fields are read back by a custom id built from the adapter's own name.
 */

export const MAX_TEMPLATES = 5;

/**
 * The states that carry the three template buttons - the one you start on, and the three that
 * report what just happened and then offer the same three buttons again.
 */
export const TEMPLATE_MENU_STATES = [ "Default", "TemplateSaved", "TemplateApplied", "TemplateDeleted" ] as const;

export async function getCurrentChannelConfig( channel: VoiceChannel ) {
    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );

    const state = await dynamicChannelService.getChannelState( channel );
    const visibilityState = await dynamicChannelService.getChannelVisibilityState( channel );

    return {
        nameTemplate: channel.name,
        userLimit: channel.userLimit,
        state,
        visibilityState,
        region: channel.rtcRegion ?? "auto"
    };
}

/**
 * Function templateConfigToPrivacyState() :: Collapses a stored template state pair into the single
 * V3 privacy state.
 *
 * V3 exposes three states - public, private and hidden - and `editChannelPrivacyState()` derives
 * both flags from one of them, so a template has to be mapped onto that same vocabulary. Hidden
 * wins over private, matching how the privacy state maps back to the pair.
 */
export function templateConfigToPrivacyState( config: ChannelTemplateConfig ): ChannelPrivacyState | null {
    if ( "hidden" === config.visibilityState ) {
        return "hidden";
    }

    if ( "private" === config.state ) {
        return "private";
    }

    if ( "public" === config.state || "shown" === config.visibilityState ) {
        return "public";
    }

    return null;
}

/**
 * Function acknowledge() :: Takes the press off the clock before work that may outlast it.
 *
 * Returns whether there is still an interaction worth answering.
 */
async function acknowledge(
    interaction: UIDefaultButtonChannelVoiceInteraction | UIDefaultStringSelectMenuChannelVoiceTextChannelInteraction
): Promise<boolean> {
    if ( interaction.deferred || interaction.replied ) {
        return true;
    }

    try {
        await interaction.deferUpdate();
    } catch {
        return false;
    }

    return true;
}

export async function onSelectTemplateToApply(
    context: IExecutionAdapterContext<UIDefaultStringSelectMenuChannelVoiceTextChannelInteraction>,
    interaction: UIDefaultStringSelectMenuChannelVoiceTextChannelInteraction
) {
    if ( ! await acknowledge( interaction ) ) {
        return;
    }

    context.setArgs( interaction, Object.assign( {}, context.getArgs( interaction ) ?? {}, {
        selectedTemplateId: interaction.values[ 0 ]
    } ) );

    await context.triggerTransition( "SelectTemplateToApply", interaction );
}

export async function onSelectTemplateToDelete(
    context: IExecutionAdapterContext<UIDefaultStringSelectMenuChannelVoiceTextChannelInteraction>,
    interaction: UIDefaultStringSelectMenuChannelVoiceTextChannelInteraction
) {
    if ( ! await acknowledge( interaction ) ) {
        return;
    }

    context.setArgs( interaction, Object.assign( {}, context.getArgs( interaction ) ?? {}, {
        selectedTemplateId: interaction.values[ 0 ]
    } ) );

    await context.triggerTransition( "SelectTemplateToDelete", interaction );
}

export async function onApplyTemplateConfirmed(
    context: IExecutionAdapterContext<UIDefaultButtonChannelVoiceInteraction>,
    interaction: UIDefaultButtonChannelVoiceInteraction
) {
    if ( ! await acknowledge( interaction ) ) {
        return;
    }

    const args = context.getArgs( interaction ) ?? {};
    const selectedTemplateId = typeof args.selectedTemplateId === "string"
        ? args.selectedTemplateId
        : "";

    if ( !selectedTemplateId ) {
        await context.triggerTransition( "OpenApplyMenu", interaction );
        return;
    }

    const template = await ChannelTemplateModel.$.getTemplateById(
        interaction.user.id,
        interaction.guildId,
        selectedTemplateId
    );

    if ( !template ) {
        await context.triggerTransition( "OpenApplyMenu", interaction );
        return;
    }

    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>(
        "VertixBot/Services/DynamicChannel"
    );

    const config = template.config;

    try {
        if ( config.userLimit !== undefined ) {
            await interaction.channel.setUserLimit( config.userLimit );
        }

        // V3 has a single three state privacy model - public, private, hidden -
        // and `editChannelPrivacyState()` is what writes it. The per flag
        // `editChannelState()` / `editChannelVisibilityState()` are the V2 model,
        // which restores a flag to its default instead of granting it, so applying
        // a template through them produced different permissions than the privacy
        // button did for the very same state.
        const privacyState = templateConfigToPrivacyState( config );

        if ( privacyState ) {
            await dynamicChannelService.editChannelPrivacyState(
                interaction,
                interaction.channel,
                privacyState
            );
        }

        if ( typeof config.region === "string" ) {
            const region = config.region.trim();

            if ( region.length ) {
                await interaction.channel.setRTCRegion( region === "auto" ? null : region );
            }
        }

        if ( config.nameTemplate ) {
            // A template stores the channel name literally, so one captured before a
            // word was added to the list would replay past the current filter forever.
            const nameTemplate = await GuildDataManager.$.maskBadwords(
                interaction.guildId,
                config.nameTemplate
            );

            await interaction.channel.setName( nameTemplate ).catch( ( error ) => {
                context.logger.error( onApplyTemplateConfirmed, "", error );
            } );
        }
    } catch( error ) {
        context.logger.error( onApplyTemplateConfirmed, "", error );
    }

    context.setArgs(
        interaction,
        Object.assign( {}, args, {
            appliedTemplate: template,
            selectedTemplateId: ""
        } )
    );

    await context.triggerTransition( "ConfirmApply", interaction );
}

export async function onDeleteTemplateConfirmed(
    context: IExecutionAdapterContext<UIDefaultButtonChannelVoiceInteraction>,
    interaction: UIDefaultButtonChannelVoiceInteraction
) {
    if ( ! await acknowledge( interaction ) ) {
        return;
    }

    const args = context.getArgs( interaction ) ?? {};
    const selectedTemplateId = typeof args.selectedTemplateId === "string"
        ? args.selectedTemplateId
        : "";

    if ( !selectedTemplateId ) {
        await context.triggerTransition( "OpenManageMenu", interaction );
        return;
    }

    const template = await ChannelTemplateModel.$.getTemplateById(
        interaction.user.id,
        interaction.guildId,
        selectedTemplateId
    );

    const templateName = template?.name ?? "Unknown";

    await ChannelTemplateModel.$.deleteTemplate(
        interaction.user.id,
        interaction.guildId,
        selectedTemplateId
    );

    const templates = await ChannelTemplateModel.$.getTemplates(
        interaction.user.id,
        interaction.guildId
    );

    context.setArgs(
        interaction,
        Object.assign( {}, args, {
            deletedTemplateName: templateName,
            selectedTemplateId: "",
            templates
        } )
    );

    await context.triggerTransition( "ConfirmDelete", interaction );
}

/**
 * Function onSaveTemplateSubmitted() :: Keeps the channel's current settings under a typed name.
 *
 * `inputCustomId` is the one thing the two adapters cannot share: a modal's fields are read back by
 * an id built from the adapter that opened it, so each passes its own.
 */
export async function onSaveTemplateSubmitted(
    context: IExecutionAdapterContext<UIDefaultModalChannelVoiceInteraction>,
    interaction: UIDefaultModalChannelVoiceInteraction,
    inputCustomId: string
) {
    const templateName = interaction.fields.getTextInputValue( inputCustomId );

    const config = await getCurrentChannelConfig( interaction.channel );

    const result = await ChannelTemplateModel.$.saveTemplate(
        interaction.user.id,
        interaction.guildId,
        templateName,
        config
    );

    if ( !result.success ) {
        await context.editReply( interaction, {
            templateName,
            error: result.error
        } );
        return;
    }

    const templates = await ChannelTemplateModel.$.getTemplates(
        interaction.user.id,
        interaction.guildId
    );

    context.setArgs( interaction, {
        templates,
        maxTemplates: MAX_TEMPLATES,
        templateName
    } );

    await context.triggerTransition( "SaveTemplate", interaction );
}
