import { ChannelModel } from "@vertix.gg/base/src/models/channel/channel-model";
import { UserMasterChannelDataModel } from "@vertix.gg/base/src/models/data/user-master-channel-data-model";
import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { UI_CUSTOM_ID_SEPARATOR } from "@vertix.gg/gui/src/bases/ui-definitions";

import { DynamicWizardAdapterBuilder } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-wizard-adapter-builder";

import { DynamicChannelPrimaryMessageEditDescriptionComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/edit/description/dynamic-channel-primary-message-edit-description-component";

import { DynamicChannelPrimaryMessageEditButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/edit/dynamic-channel-primary-message-edit-button";

import { DynamicChannelPrimaryMessageEditComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/edit/dynamic-channel-primary-message-edit-component";

import { DynamicChannelPrimaryMessageEditTitleComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/edit/title/dynamic-channel-primary-message-edit-title-component";

import type { VoiceChannel, ModalMessageModalSubmitInteraction } from "discord.js";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { UIWizardComponentBase } from "@vertix.gg/gui/src/bases/ui-wizard-component-base";

import type {
    UIDefaultButtonChannelVoiceInteraction,
    UIDefaultModalChannelVoiceInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";
import type { IWizardAdapterContext } from "@vertix.gg/gui/src/builders/builders-definitions";
import type { DynamicChannelService } from "@vertix.gg/bot/src/services/dynamic-channel-service";

type DefaultInteraction = UIDefaultButtonChannelVoiceInteraction | ModalSubmitInteractionDefault;

interface ModalSubmitInteractionDefault extends ModalMessageModalSubmitInteraction<"cached"> {
    channel: VoiceChannel;
}

async function onNoButtonClicked(
    context: IWizardAdapterContext<DefaultInteraction, UIArgs>,
    interaction: UIDefaultButtonChannelVoiceInteraction
) {
    await context.deleteRelatedEphemeralInteractionsInternal( interaction, "VertixBot/UI-V3/DynamicChannelAdapter", 1 );
}

async function onYesButtonClicked(
    context: IWizardAdapterContext<DefaultInteraction, UIArgs>,
    interaction: UIDefaultButtonChannelVoiceInteraction
) {
    await context.editReplyWithStep( interaction, "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditTitleComponent" );
}

async function onEditTitleModalSubmit(
    context: IWizardAdapterContext<DefaultInteraction, UIArgs>,
    interaction: UIDefaultModalChannelVoiceInteraction
) {
    const inputId =
        "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditAdapter" +
        UI_CUSTOM_ID_SEPARATOR +
        "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditModalTitle";

    const title = interaction.fields.getTextInputValue( context.customIdStrategy.generateId( inputId ) );

    const args = context.getArgs( interaction ) ?? {};

    context.setArgs( interaction, {
        ...args,
        title
    } );

    const masterChannelDB = await ChannelModel.$.getMasterByDynamicChannelId( interaction.channelId );

    if ( !masterChannelDB ) {
        await interaction.deferUpdate();
        return;
    }

    await UserMasterChannelDataModel.$.setPrimaryMessage( interaction.user.id, masterChannelDB.id, { title } );

    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );

    dynamicChannelService.editPrimaryMessageDebounce( interaction.channel );

    await context.editReplyWithStep( interaction, "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditTitleComponent" );
}

async function onEditDescriptionModalSubmit(
    context: IWizardAdapterContext<DefaultInteraction, UIArgs>,
    interaction: UIDefaultModalChannelVoiceInteraction
) {
    const inputId =
        "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditAdapter" +
        UI_CUSTOM_ID_SEPARATOR +
        "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditModalDescription";

    const description = interaction.fields.getTextInputValue( context.customIdStrategy.generateId( inputId ) );

    const args = context.getArgs( interaction ) ?? {};

    context.setArgs( interaction, {
        ...args,
        description
    } );

    const masterChannelDB = await ChannelModel.$.getMasterByDynamicChannelId( interaction.channelId );

    if ( !masterChannelDB ) {
        await interaction.deferUpdate();
        return;
    }

    await UserMasterChannelDataModel.$.setPrimaryMessage( interaction.user.id, masterChannelDB.id, { description } );

    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );

    dynamicChannelService.editPrimaryMessageDebounce( interaction.channel );

    await context.editReplyWithStep( interaction, "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditDescriptionComponent" );
}

const DynamicChannelPrimaryMessageEditAdapter = new DynamicWizardAdapterBuilder<VoiceChannel, DefaultInteraction, UIArgs>(
    "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditAdapter"
)
    .setComponents( {
        name: "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditComponent",
        components: [
            DynamicChannelPrimaryMessageEditTitleComponent,
            DynamicChannelPrimaryMessageEditDescriptionComponent
        ],
        baseComponent: DynamicChannelPrimaryMessageEditComponent
    } )
    .defineTransactions( ( tx ) => {
        tx
            .setInitialState( "Confirm" )
            // States
            .addState( "Confirm", {
                executionStep: "default",
                navigationType: "ephemeral"
            } )
            .addState( "EditTitle", {
                executionStep: "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditTitleComponent",
                previewDefaultVars: { title: "My Channel Title" }
            } )
            .addState( "EditDescription", {
                executionStep: "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditDescriptionComponent",
                previewDefaultVars: { description: "My channel description" }
            } )
            // Transitions from Confirm
            .addTransition( "Cancel", { from: "Confirm", to: "Confirm" } )
            .addTransition( "Proceed", { from: "Confirm", to: "EditTitle" } )
            // Transitions from EditTitle
            .addTransition( "TitleEdited", { from: "EditTitle", to: "EditTitle", mutations: [ { type: "set", path: [ "title" ] } ] } )
            .addTransition( "TitleToDescription", { from: "EditTitle", to: "EditDescription" } )
            .addTransition( "TitleBack", { from: "EditTitle", to: "Confirm" } )
            // Transitions from EditDescription
            .addTransition( "DescriptionEdited", { from: "EditDescription", to: "EditDescription", mutations: [ { type: "set", path: [ "description" ] } ] } )
            .addTransition( "DescriptionBack", { from: "EditDescription", to: "EditTitle" } )
            .addTransition( "Finish", { from: "EditDescription", to: "Confirm" } )
            // Element bindings
            .bindElement( "VertixBot/UI-General/NoButton", "Cancel" )
            .bindElement( "VertixBot/UI-General/YesButton", "Proceed" )
            .bindElement( "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditTitleEditButton", "TitleEdited" )
            .bindElement( "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditDescriptionEditButton", "DescriptionEdited" )
            // Modal-button bindings (for visualization)
            .bindModalWithButton(
                "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditTitleEditButton",
                "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditTitleModal",
                "TitleEdited"
            )
            .bindModalWithButton(
                "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditDescriptionEditButton",
                "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditDescriptionModal",
                "DescriptionEdited"
            );
    } )
    .setExecutionSteps( {
        default: {
            elementsGroup: DynamicChannelPrimaryMessageEditComponent.getDefaultElementsGroup(),
            embedsGroup: DynamicChannelPrimaryMessageEditComponent.getDefaultEmbedsGroup()
        }
    } )
    .setInitiatorElement( DynamicChannelPrimaryMessageEditButton )
    .getStartArgs( async() => ( {} ) )
    .getReplyArgs( async( context, interaction, argsFromManager = {} ) => {
        const masterChannelDB = await ChannelModel.$.getMasterByDynamicChannelId( interaction.channelId );

        if ( !masterChannelDB ) {
            return {};
        }

        const userMasterData = await UserMasterChannelDataModel.$.getData( interaction.user.id, masterChannelDB.id );

        const componentClass = context.getComponent().constructor as typeof UIWizardComponentBase;
        const stepIndex = context.getCurrentStepIndex();

        return {
            ...( userMasterData?.dynamicChannelPrimaryMessage || {} ),
            ...argsFromManager,
            _step: componentClass.getComponents()[ stepIndex ]?.getName()
        };
    } )
    .onAfterFinish( async function( this: { deleteRelatedEphemeralInteractionsInternal: Function }, interaction ) {
        await this.deleteRelatedEphemeralInteractionsInternal(
            interaction as UIDefaultButtonChannelVoiceInteraction,
            "VertixBot/UI-V3/DynamicChannelAdapter:VertixBot/UI-V3/DynamicChannelPrimaryMessageEditButton",
            1
        );
    } )
    .onEntityMap( async( { bindButton, bindModalWithButton } ) => {
        bindButton<UIDefaultButtonChannelVoiceInteraction>(
            "VertixBot/UI-General/NoButton",
            onNoButtonClicked
        );

        bindButton<UIDefaultButtonChannelVoiceInteraction>(
            "VertixBot/UI-General/YesButton",
            onYesButtonClicked
        );

        bindModalWithButton(
            "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditTitleEditButton",
            "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditTitleModal",
            onEditTitleModalSubmit
        );

        bindModalWithButton(
            "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditDescriptionEditButton",
            "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditDescriptionModal",
            onEditDescriptionModalSubmit
        );
    } )
    .build();

export { DynamicChannelPrimaryMessageEditAdapter };
