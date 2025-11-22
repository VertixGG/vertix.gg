import { ChannelModel } from "@vertix.gg/base/src/models/channel/channel-model";
import { UserMasterChannelDataModel } from "@vertix.gg/base/src/models/data/user-master-channel-data-model";
import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { UI_CUSTOM_ID_SEPARATOR } from "@vertix.gg/gui/src/bases/ui-definitions";

import { WizardAdapterBuilder } from "@vertix.gg/gui/src/builders/wizard-adapter-builder";

import { DynamicChannelPrimaryMessageEditDescriptionComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/edit/description/dynamic-channel-primary-message-edit-description-component";

import { DynamicChannelPrimaryMessageEditButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/edit/dynamic-channel-primary-message-edit-button";

import { DynamicChannelPrimaryMessageEditComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/edit/dynamic-channel-primary-message-edit-component";

import { DynamicChannelPrimaryMessageEditTitleComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/edit/title/dynamic-channel-primary-message-edit-title-component";

import type { UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";
import type { UIWizardComponentBase } from "@vertix.gg/gui/src/bases/ui-wizard-component-base";

import type { VoiceChannel, ModalMessageModalSubmitInteraction } from "discord.js";

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

    await context.editReplyWithStep( interaction, "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditTitleComponent", {
        title
    } );

    const masterChannelDB = await ChannelModel.$.getMasterByDynamicChannelId( interaction.channelId );

    if ( !masterChannelDB ) {
        return;
    }

    await UserMasterChannelDataModel.$.setPrimaryMessage( interaction.user.id, masterChannelDB.id, { title } );

    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );

    dynamicChannelService.editPrimaryMessageDebounce( interaction.channel );
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

    await context.editReplyWithStep( interaction, "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditDescriptionComponent", {
        description
    } );

    const masterChannelDB = await ChannelModel.$.getMasterByDynamicChannelId( interaction.channelId );

    if ( !masterChannelDB ) {
        return;
    }

    await UserMasterChannelDataModel.$.setPrimaryMessage( interaction.user.id, masterChannelDB.id, { description } );

    const dynamicChannelService = ServiceLocator.$.get<DynamicChannelService>( "VertixBot/Services/DynamicChannel" );

    dynamicChannelService.editPrimaryMessageDebounce( interaction.channel );
}

const DynamicChannelPrimaryMessageEditAdapter = new WizardAdapterBuilder<VoiceChannel, DefaultInteraction, UIArgs>(
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
    .generateCustomIdForEntity( ( context, entity ) => {
        const stepIndex = context.getCurrentStepIndex();

        switch ( entity.name ) {
            case "VertixBot/UI-General/WizardNextButton":
                entity.name = entity.name + UI_CUSTOM_ID_SEPARATOR + stepIndex;
                break;

            case "VertixBot/UI-General/WizardBackButton":
                entity.name = entity.name + UI_CUSTOM_ID_SEPARATOR + stepIndex;
                break;

            case "VertixBot/UI-General/WizardFinishButton":
                entity.name = entity.name + UI_CUSTOM_ID_SEPARATOR + stepIndex;
                break;
        }

        return context.generateCustomIdForEntity( entity );
    } )
    .onBeforeNext( async function( this: any, interaction ) {
        const customId = this.customIdStrategy.getId( interaction.customId ),
            customIdParts = customId.split( UI_CUSTOM_ID_SEPARATOR, 3 ),
            nextIndex = parseInt( customIdParts[ 2 ] );

        const component = this.constructor.getComponent();
        const stepName = component.getComponents()[ nextIndex ].getName();

        this.setStep( stepName, interaction );
    } )
    .onBeforeBack( async function( this: any, interaction ) {
        const customId = this.customIdStrategy.getId( interaction.customId ),
            customIdParts = customId.split( UI_CUSTOM_ID_SEPARATOR, 3 ),
            nextIndex = parseInt( customIdParts[ 2 ] );

        const component = this.constructor.getComponent();
        const stepName = component.getComponents()[ nextIndex ].getName();

        this.setStep( stepName, interaction );
    } )
    .onAfterFinish( async function( this: any, interaction ) {
        await this.deleteRelatedEphemeralInteractionsInternal(
            interaction,
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
