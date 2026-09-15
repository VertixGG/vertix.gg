import { ChannelTemplateModel } from "@vertix.gg/data/src/models/data/channel-template-model";

import {
    MAX_TEMPLATES,
    TEMPLATE_MENU_STATES,
    onApplyTemplateConfirmed,
    onDeleteTemplateConfirmed,
    onSelectTemplateToApply,
    onSelectTemplateToDelete
} from "@vertix.gg/bot/src/ui/v3/dynamic-channel/templates/dynamic-channel-templates-handlers";

import type {
    UIDefaultButtonChannelVoiceInteraction,
    UIDefaultModalChannelVoiceInteraction,
    UIDefaultStringSelectMenuChannelVoiceTextChannelInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

import type { ChannelTemplate } from "@vertix.gg/data/src/interfaces/channel-template";
import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { IExecutionAdapterContext } from "@vertix.gg/gui/src/builders/builders-definitions";
import type { TransactionBuilder } from "@vertix.gg/gui/src/builders/transaction-builder";

type TemplatesInteraction =
    | UIDefaultButtonChannelVoiceInteraction
    | UIDefaultStringSelectMenuChannelVoiceTextChannelInteraction
    | UIDefaultModalChannelVoiceInteraction;

type TemplatesTransactions = TransactionBuilder<IExecutionAdapterContext<TemplatesInteraction, UIArgs>>;

/**
 * Function defineTemplatesStates() :: Every screen a member's kept settings can be worked from, and
 * what leads between them.
 *
 * Declared once and handed the builder, because the interface the templates button opens and the
 * one `/voice templates` opens are the same interface reached two ways. Only two things differ, and
 * both are about the way in: the button's own opening, and the save modal, whose field is read back
 * by an id built from the name of whichever adapter put it on screen.
 */
export function defineTemplatesStates( tx: TemplatesTransactions ) {
    tx
        .setInitialState( "Default" )
        // The same screen as `Default`, and separate from it only in how it reaches the member.
        //
        // A screen has to be sent before it can be edited. The press that opens this interface
        // happens on the control panel's message, which this adapter did not draw - so `editReply`
        // looks for args under an id it never wrote under, finds nothing, and returns having done
        // nothing at all. No error reaches the member: the panel simply does not answer.
        //
        // Knock, invite and transfer all open on an `ephemeral` screen and edit from there. Reached
        // from the button's adapter, which transitions onto this rather than onto `Default`.
        //
        // `Default` stays as it was because it is also where `BackToDefault` lands, and going back
        // must edit the screen the member is looking at rather than send them a second one. The
        // command opens on `Default` because `ephemeral()` sends its own screen regardless.
        .addState( "Opened", {
            executionStep: "default",
            navigationType: "ephemeral",
            elementsGroup: "VertixBot/UI-V3/DynamicChannelTemplatesElementsGroup",
            embedsGroup: "VertixBot/UI-V3/DynamicChannelTemplatesEmbedGroup"
        } )
        .addState( "Default", {
            executionStep: "default",
            navigationType: "editReply",
            elementsGroup: "VertixBot/UI-V3/DynamicChannelTemplatesElementsGroup",
            embedsGroup: "VertixBot/UI-V3/DynamicChannelTemplatesEmbedGroup"
        } )
        .addState( "ApplyMenu", {
            executionStep: "apply-menu",
            navigationType: "editReply",
            elementsGroup: "VertixBot/UI-V3/DynamicChannelTemplatesApplyElementsGroup",
            embedsGroup: "VertixBot/UI-V3/DynamicChannelTemplatesEmbedGroup"
        } )
        .addState( "ApplyConfirm", {
            executionStep: "apply-confirm",
            navigationType: "editReply",
            elementsGroup: "VertixBot/UI-V3/DynamicChannelTemplatesApplyConfirmElementsGroup",
            embedsGroup: "VertixBot/UI-V3/DynamicChannelTemplatesEmbedGroup"
        } )
        .addState( "ManageMenu", {
            executionStep: "manage-menu",
            navigationType: "editReply",
            elementsGroup: "VertixBot/UI-V3/DynamicChannelTemplatesManageElementsGroup",
            embedsGroup: "VertixBot/UI-V3/DynamicChannelTemplatesManageEmbedGroup"
        } )
        .addState( "DeleteConfirm", {
            executionStep: "delete-confirm",
            navigationType: "editReply",
            elementsGroup: "VertixBot/UI-V3/DynamicChannelTemplatesManageConfirmElementsGroup",
            embedsGroup: "VertixBot/UI-V3/DynamicChannelTemplatesManageEmbedGroup"
        } )
        .addState( "TemplateSaved", {
            executionStep: "template-saved",
            navigationType: "editReply",
            previewDefaultVars: { templateName: "My Template" },
            elementsGroup: "VertixBot/UI-V3/DynamicChannelTemplatesElementsGroup",
            embedsGroup: "VertixBot/UI-V3/DynamicChannelTemplatesSavedEmbedGroup"
        } )
        .addState( "TemplateApplied", {
            executionStep: "template-applied",
            navigationType: "editReply",
            previewDefaultVars: {
                templateName: "My Template",
                appliedSettings: "- **Name**: Gaming Room\n- **Limit**: 10\n- **Privacy**: public\n- **Region**: Automatic"
            },
            elementsGroup: "VertixBot/UI-V3/DynamicChannelTemplatesElementsGroup",
            embedsGroup: "VertixBot/UI-V3/DynamicChannelTemplatesAppliedEmbedGroup"
        } )
        .addState( "TemplateDeleted", {
            executionStep: "template-deleted",
            navigationType: "editReply",
            // The embed prints `templateName`; its own logic is what maps the deleted one onto
            // that, and a preview cannot be handed a function, so it is told the answer.
            previewDefaultVars: { templateName: "My Template" },
            elementsGroup: "VertixBot/UI-V3/DynamicChannelTemplatesElementsGroup",
            embedsGroup: "VertixBot/UI-V3/DynamicChannelTemplatesDeletedEmbedGroup"
        } )
        // The three result states put the same three buttons back on screen as `Default` does, so
        // what they reach is what `Default` reaches. Listing them is description, not behaviour - a
        // transition resolves by name, whatever state it is triggered from - but anything reading
        // the exported flow otherwise sees a result you cannot leave.
        .addTransition( "OpenApplyMenu", { from: [ ...TEMPLATE_MENU_STATES ], to: "ApplyMenu" } )
        .addTransition( "OpenManageMenu", { from: [ ...TEMPLATE_MENU_STATES ], to: "ManageMenu" } )
        .addTransition( "SelectTemplateToApply", { from: "ApplyMenu", to: "ApplyConfirm" } )
        .addTransition( "ConfirmApply", { from: "ApplyConfirm", to: "TemplateApplied" } )
        .addTransition( "SelectTemplateToDelete", { from: "ManageMenu", to: "DeleteConfirm" } )
        .addTransition( "ConfirmDelete", { from: "DeleteConfirm", to: "TemplateDeleted" } )
        .addTransition( "SaveTemplate", {
            from: [ ...TEMPLATE_MENU_STATES ],
            to: "TemplateSaved",
            // The name typed into the modal is what the saved message reads back - the handler puts
            // it in the args, and this is that said where the flow can be read.
            mutations: [ { type: "set", path: [ "templateName" ] } ]
        } )
        .addTransition( "BackToDefault", {
            from: [ "ApplyMenu", "ManageMenu", "TemplateSaved", "TemplateApplied", "TemplateDeleted" ],
            to: "Default"
        } )
        .bindButton<UIDefaultButtonChannelVoiceInteraction>(
            "VertixBot/UI-V3/DynamicChannelTemplatesApplyButton",
            "OpenApplyMenu",
            async( context, interaction ) => {
                await context.triggerTransition( "OpenApplyMenu", interaction );
            }
        )
        .bindButton<UIDefaultButtonChannelVoiceInteraction>(
            "VertixBot/UI-V3/DynamicChannelTemplatesManageButton",
            "OpenManageMenu",
            async( context, interaction ) => {
                await context.triggerTransition( "OpenManageMenu", interaction );
            }
        )
        .bindButton<UIDefaultButtonChannelVoiceInteraction>(
            "VertixBot/UI-V3/DynamicChannelTemplatesBackButton",
            "BackToDefault",
            async( context, interaction ) => {
                await context.triggerTransition( "BackToDefault", interaction );
            }
        )
        .bindSelectMenu<UIDefaultStringSelectMenuChannelVoiceTextChannelInteraction>(
            "VertixBot/UI-V3/DynamicChannelTemplatesApplySelectMenu",
            "SelectTemplateToApply",
            onSelectTemplateToApply
        )
        .bindButton<UIDefaultButtonChannelVoiceInteraction>(
            "VertixBot/UI-V3/DynamicChannelTemplatesApplyConfirmButton",
            "ConfirmApply",
            onApplyTemplateConfirmed
        )
        .bindSelectMenu<UIDefaultStringSelectMenuChannelVoiceTextChannelInteraction>(
            "VertixBot/UI-V3/DynamicChannelTemplatesDeleteSelectMenu",
            "SelectTemplateToDelete",
            onSelectTemplateToDelete
        )
        .bindButton<UIDefaultButtonChannelVoiceInteraction>(
            "VertixBot/UI-V3/DynamicChannelTemplatesDeleteConfirmButton",
            "ConfirmDelete",
            onDeleteTemplateConfirmed
        );

    return tx;
}

/**
 * Function getTemplatesReplyArgs() :: The member's kept settings, however the screen was reached.
 *
 * A screen can be reached carrying them - the way in fetches them - or reached without, in which
 * case they are fetched here. Both doors answer the same way, so both use this.
 */
export async function getTemplatesReplyArgs(
    context: IExecutionAdapterContext<TemplatesInteraction, UIArgs>,
    interaction: TemplatesInteraction,
    argsFromManager?: UIArgs
) {
    const mergedArgs = Object.assign( {}, context.getArgs( interaction ) ?? {}, argsFromManager ?? {} );

    const templates = Array.isArray( mergedArgs.templates )
        ? ( mergedArgs.templates as ChannelTemplate[] )
        : await ChannelTemplateModel.$.getTemplates( interaction.user.id, interaction.guildId );

    const maxTemplates = typeof mergedArgs.maxTemplates === "number"
        ? mergedArgs.maxTemplates
        : MAX_TEMPLATES;

    return Object.assign( {}, mergedArgs, { templates, maxTemplates } );
}
