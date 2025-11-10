import { ChannelModel } from "@vertix.gg/base/src/models/channel/channel-model";
import { UserMasterChannelDataModel } from "@vertix.gg/base/src/models/data/user-master-channel-data-model";

import { UI_CUSTOM_ID_SEPARATOR } from "@vertix.gg/gui/src/bases/ui-definitions";

import { DynamicChannelAdapterWizardWithInitiatorElementBase } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/base/dynamic-channel-adapter-wizard-with-initiator-element-base";

import { DynamicChannelPrimaryMessageEditDescriptionComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/edit/description/dynamic-channel-primary-message-edit-description-component";

import { DynamicChannelPrimaryMessageEditButton } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/edit/dynamic-channel-primary-message-edit-button";

import { DynamicChannelPrimaryMessageEditComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/edit/dynamic-channel-primary-message-edit-component";

import { DynamicChannelPrimaryMessageEditTitleComponent } from "@vertix.gg/bot/src/ui/v3/dynamic-channel/primary-message/edit/title/dynamic-channel-primary-message-edit-title-component";

import type { UIArgs, UIEntitySchemaBase } from "@vertix.gg/gui/src/bases/ui-definitions";

import type { VoiceChannel, ModalMessageModalSubmitInteraction } from "discord.js";

import type {
    UIDefaultButtonChannelVoiceInteraction,
    UIDefaultModalChannelVoiceInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

type DefaultInteraction = UIDefaultButtonChannelVoiceInteraction | ModalSubmitInteractionDefault;

interface ModalSubmitInteractionDefault extends ModalMessageModalSubmitInteraction<"cached"> {
    channel: VoiceChannel;
}

// TODO: Should filter bad-words.

export class DynamicChannelPrimaryMessageEditAdapter extends DynamicChannelAdapterWizardWithInitiatorElementBase<DefaultInteraction> {
    public static getName() {
        return "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditAdapter";
    }

    public static getComponent() {
        return class DynamicChannelPrimaryMessageEditWizardComponent extends DynamicChannelPrimaryMessageEditComponent {
            public static getComponents() {
                return [
                    DynamicChannelPrimaryMessageEditTitleComponent,
                    DynamicChannelPrimaryMessageEditDescriptionComponent
                ];
            }
        };
    }

    protected static getInitiatorElement() {
        return DynamicChannelPrimaryMessageEditButton;
    }

    protected async getStartArgs() {
        return {};
    }

    protected async getReplyArgs( interaction: UIDefaultButtonChannelVoiceInteraction, argsFromManager: UIArgs = {} ) {
        const masterChannelDB = await ChannelModel.$.getMasterByDynamicChannelId( interaction.channelId );

        if ( !masterChannelDB ) {
            // SomethingWentWrong
            return;
        }

        const userMasterData = await UserMasterChannelDataModel.$.getData( interaction.user.id, masterChannelDB.id );

        return {
            ...( userMasterData?.dynamicChannelPrimaryMessage || {} ),
            ...argsFromManager,

            // TODO: Extract to UIWizardAdapterBase in order to implement dynamic components
            _step: this.$$.getComponent().getComponents()[ this.getCurrentStepIndex() ]?.getName()
        };
    }

    // TODO: Extract to UIWizardAdapterBase in order to implement dynamic components
    protected generateCustomIdForEntity( entity: UIEntitySchemaBase ) {
        switch ( entity.name ) {
            case "VertixBot/UI-General/WizardNextButton":
                entity.name = entity.name + UI_CUSTOM_ID_SEPARATOR + this.getCurrentStepIndex();
                break;

            case "VertixBot/UI-General/WizardBackButton":
                entity.name = entity.name + UI_CUSTOM_ID_SEPARATOR + this.getCurrentStepIndex();
                break;

            case "VertixBot/UI-General/WizardFinishButton":
                entity.name = entity.name + UI_CUSTOM_ID_SEPARATOR + this.getCurrentStepIndex();
                break;
        }

        return super.generateCustomIdForEntity( entity );
    }

    // TODO: Extract to UIWizardAdapterBase in order to implement dynamic components
    protected async onBeforeNext( interaction: DefaultInteraction ): Promise<void> {
        const customId = this.customIdStrategy.getId( interaction.customId ),
            customIdParts = customId.split( UI_CUSTOM_ID_SEPARATOR, 3 ),
            nextIndex = parseInt( customIdParts[ 2 ] );

        const stepName = this.$$.getComponent().getComponents()[ nextIndex ].getName();

        this.setStep( stepName, interaction );
    }

    protected async onBeforeBack( interaction: DefaultInteraction ): Promise<void> {
        const customId = this.customIdStrategy.getId( interaction.customId ),
            customIdParts = customId.split( UI_CUSTOM_ID_SEPARATOR, 3 ),
            nextIndex = parseInt( customIdParts[ 2 ] );

        const stepName = this.$$.getComponent().getComponents()[ nextIndex ].getName();

        this.setStep( stepName, interaction );
    }

    protected async onAfterFinish( interaction: DefaultInteraction ): Promise<void> {
        await this.deleteRelatedEphemeralInteractionsInternal(
            interaction,
            "VertixBot/UI-V3/DynamicChannelAdapter:VertixBot/UI-V3/DynamicChannelPrimaryMessageEditButton",
            1
        );
    }

    protected onEntityMap() {
        this.bindButton<UIDefaultButtonChannelVoiceInteraction>(
            "VertixBot/UI-General/NoButton",
            this.onNoButtonClicked
        );

        this.bindButton<UIDefaultButtonChannelVoiceInteraction>(
            "VertixBot/UI-General/YesButton",
            this.onYesButtonClicked
        );

        this.bindModalWithButton(
            "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditTitleEditButton",
            "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditTitleModal",
            this.onEditTitleModalSubmit
        );

        this.bindModalWithButton(
            "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditDescriptionEditButton",
            "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditDescriptionModal",
            this.onEditDescriptionModalSubmit
        );
    }

    private async onNoButtonClicked( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        await this.deleteRelatedEphemeralInteractionsInternal( interaction, "VertixBot/UI-V3/DynamicChannelAdapter", 1 );
    }

    private async onYesButtonClicked( interaction: UIDefaultButtonChannelVoiceInteraction ) {
        await this.editReplyWithStep( interaction, "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditTitleComponent" );
    }

    private async onEditTitleModalSubmit( interaction: UIDefaultModalChannelVoiceInteraction ) {
        const inputId =
            "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditAdapter" +
            UI_CUSTOM_ID_SEPARATOR +
            "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditModalTitle";

        const title = interaction.fields.getTextInputValue( this.customIdStrategy.generateId( inputId ) );

        await this.editReplyWithStep( interaction, "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditTitleComponent", {
            title
        } );

        const masterChannelDB = await ChannelModel.$.getMasterByDynamicChannelId( interaction.channelId );

        if ( !masterChannelDB ) {
            // SomethingWentWrong
            return;
        }

        await UserMasterChannelDataModel.$.setPrimaryMessage( interaction.user.id, masterChannelDB.id, { title } );

        this.dynamicChannelService.editPrimaryMessageDebounce( interaction.channel );
    }

    private async onEditDescriptionModalSubmit( interaction: UIDefaultModalChannelVoiceInteraction ) {
        const inputId =
            "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditAdapter" +
            UI_CUSTOM_ID_SEPARATOR +
            "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditModalDescription";

        const description = interaction.fields.getTextInputValue( this.customIdStrategy.generateId( inputId ) );

        await this.editReplyWithStep( interaction, "VertixBot/UI-V3/DynamicChannelPrimaryMessageEditDescriptionComponent", {
            description
        } );

        const masterChannelDB = await ChannelModel.$.getMasterByDynamicChannelId( interaction.channelId );

        if ( !masterChannelDB ) {
            // SomethingWentWrong
            return;
        }

        await UserMasterChannelDataModel.$.setPrimaryMessage( interaction.user.id, masterChannelDB.id, { description } );

        this.dynamicChannelService.editPrimaryMessageDebounce( interaction.channel );
    }
}
