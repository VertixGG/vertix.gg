import { ChannelType, PermissionsBitField } from "discord.js";

import { UIWizardAdapterBase } from "@vertix.gg/gui/src/bases/ui-wizard-adapter-base";
import { UIWizardComponentBase } from "@vertix.gg/gui/src/bases/ui-wizard-component-base";
import { UIEmbedsGroupBase } from "@vertix.gg/gui/src/bases/ui-embeds-group-base";

import { SetupScalingChannelCreateButton } from "@vertix.gg/bot/src/ui/general/setup/elements/setup-scaling-channel-create-button";

import { DEFAULT_SETUP_PERMISSIONS } from "@vertix.gg/bot/src/definitions/master-channel";

import { SetupScalingStep1Component } from "@vertix.gg/bot/src/ui/general/scaling/steps/step-1/setup-scaling-step-1-component";
import { SetupScalingStep2Component } from "@vertix.gg/bot/src/ui/general/scaling/steps/step-2/setup-scaling-step-2-component";
import { SetupScalingStep3Component } from "@vertix.gg/bot/src/ui/general/scaling/steps/step-3/setup-scaling-step-3-component";
import { SomethingWentWrongEmbed } from "@vertix.gg/bot/src/ui/general/misc/something-went-wrong-embed";

import type { BaseGuildTextChannel, MessageComponentInteraction } from "discord.js";

import type {
    UIDefaultButtonChannelTextInteraction,
    UIDefaultModalChannelTextInteraction,
    UIDefaultStringSelectMenuChannelTextInteraction
} from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

import type { TAdapterRegisterOptions } from "@vertix.gg/gui/src/definitions/ui-adapter-declaration";
import type { UIAdapterBuildSource, UIArgs } from "@vertix.gg/gui/src/bases/ui-definitions";

type Interactions =
    | UIDefaultButtonChannelTextInteraction
    | UIDefaultModalChannelTextInteraction
    | UIDefaultStringSelectMenuChannelTextInteraction;

export class SetupScalingWizardAdapter extends UIWizardAdapterBase<BaseGuildTextChannel, Interactions> {
    public static getName() {
        return "VertixBot/UI-General/SetupScalingWizardAdapter";
    }

    public static getComponent() {
        return class SetupScalingWizardComponent extends UIWizardComponentBase {
            public static getName() {
                return "VertixBot/UI-General/SetupScalingWizardComponent";
            }

            public static getComponents() {
                return [
                    SetupScalingStep1Component,
                    SetupScalingStep2Component,
                    SetupScalingStep3Component
                ];
            }

            public static getEmbedsGroups() {
                return [
                    ...super.getEmbedsGroups(),
                    UIEmbedsGroupBase.createSingleGroup( SomethingWentWrongEmbed )
                ];
            }
        };
    }

    protected static getExcludedElements() {
        return [ SetupScalingChannelCreateButton ];
    }

    protected static getExecutionSteps() {
        return {
            "VertixBot/UI-General/SetupScalingWizardError": {
                embedsGroup: "VertixBot/UI-General/SomethingWentWrongEmbedGroup"
            }
        };
    }

    public constructor( options: TAdapterRegisterOptions ) {
        super( options );
    }

    public getPermissions(): PermissionsBitField {
        return new PermissionsBitField( DEFAULT_SETUP_PERMISSIONS );
    }

    public getChannelTypes() {
        return [ ChannelType.GuildVoice, ChannelType.GuildText ];
    }

    protected onEntityMap() {
        // Create button binding for the main entry point
        this.bindButton<UIDefaultButtonChannelTextInteraction>(
            "VertixBot/UI-General/SetupScalingChannelCreateButton",
            this.onCreateScalingChannel
        );

        // Category selection and creation
        this.bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "VertixBot/UI-General/SetupScalingCategorySelectMenu",
            this.onCategorySelected
        );

        this.bindModal<UIDefaultModalChannelTextInteraction>(
            "VertixBot/UI-General/SetupScalingCategoryNameModal",
            this.onCategoryNameModalSubmitted
        );

        // Use the standard bindModalWithButton approach that should be handled by the framework
        this.bindModalWithButton<UIDefaultModalChannelTextInteraction>(
            "VertixBot/UI-General/SetupScalingPrefixButton",
            "VertixBot/UI-General/SetupScalingPrefixModal",
            this.onPrefixModalSubmitted
        );

        this.bindSelectMenu<UIDefaultStringSelectMenuChannelTextInteraction>(
            "VertixBot/UI-General/SetupScalingMaxMembersSelect",
            this.onMaxMembersSelected
        );
    }

    protected async getStartArgs( _channel: BaseGuildTextChannel ) {
        return {};
    }

    protected async getReplyArgs( _interaction: UIDefaultButtonChannelTextInteraction, argsFromManager: UIArgs ) {
        // Ensure we're always using the most up-to-date args
        return argsFromManager || {};
    }

    protected async onBeforeBuild( args: UIArgs, _from: UIAdapterBuildSource, context: Interactions ): Promise<void> {
        // For Step 2, retrieve guild categories to populate the dropdown
        if ( context && this.getCurrentExecutionStep( context )?.name === "VertixBot/UI-General/SetupScalingStep2Component" ) {
            // Get all categories from the guild
            const categories = context.guild.channels.cache
                .filter( channel => channel.type === ChannelType.GuildCategory )
                .map( category => ( {
                    id: category.id,
                    name: category.name
                } ) );

            args.guildCategories = categories;

            // Disable Next button if no category is selected
            args._wizardShouldDisableNextButton = !args.selectedCategoryId;

            // If we have a selectedCategoryId but no selectedCategoryName, fetch it
            if ( args.selectedCategoryId && !args.selectedCategoryName && context.guild ) {
                const category = context.guild.channels.cache.get( args.selectedCategoryId );
                if ( category ) {
                    args.selectedCategoryName = category.name;
                }
            }
        }

        // For Step 3, configure the buttons and finish button state
        if ( context && this.getCurrentExecutionStep( context )?.name === "VertixBot/UI-General/SetupScalingStep3Component" ) {
            // Disable Finish button if required settings are not configured
            args._wizardShouldDisableFinishButton = !args.channelPrefix || !args.maxMembersPerChannel;
        }
    }

    protected shouldRequireArgs(): boolean {
        return true;
    }

    protected async regenerate(
        interaction: MessageComponentInteraction<"cached">,
        argsFromManager?: UIArgs
    ): Promise<void> {
        this.uiService.get( "VertixBot/UI-General/SetupAdapter" )?.editReply( interaction, argsFromManager );
    }

    protected async onBeforeNext( interaction: UIDefaultButtonChannelTextInteraction ): Promise<void> {
        const components = this.$$.getComponent().getComponents();
        const currentIndex = this.getCurrentStepIndex( interaction, components );

        // Validate current step before proceeding
        if ( currentIndex === 0 ) {
            // From intro to category selection, no special validation needed
        } else if ( currentIndex === 1 ) {
            // Check if a category was selected
            const args = this.getArgsManager().getArgs( this, interaction );
            if ( !args.selectedCategoryId ) {
                // Prevent proceeding if no category is selected
                throw new Error( "Please select a category or create a new one before continuing." );
            }
        } else if ( currentIndex === 2 ) {
            // Check if scaling settings were configured
            const args = this.getArgsManager().getArgs( this, interaction );
            if ( !args.channelPrefix || !args.maxMembersPerChannel ) {
                // Prevent proceeding if scaling settings are not configured
                throw new Error( "Please configure the scaling settings before continuing." );
            }
        }
    }

    protected async onBeforeBack( _interaction: UIDefaultButtonChannelTextInteraction ): Promise<void> {
        // No validation needed for going back
    }

    private async onCreateScalingChannel( interaction: UIDefaultButtonChannelTextInteraction ) {
        // Initialize the wizard flow by navigating to the first step
        await this.editReplyWithStep( interaction, "VertixBot/UI-General/SetupScalingStep1Component" );
    }

    private async onCategorySelected( interaction: UIDefaultStringSelectMenuChannelTextInteraction ) {
        const selectedValue = interaction.values[ 0 ];

        if ( selectedValue === "create-new-category" ) {
            // Show modal for creating a new category
            await this.showModal( "VertixBot/UI-General/SetupScalingCategoryNameModal", interaction );
        } else {
            // User selected an existing category
            const category = interaction.guild.channels.cache.get( selectedValue );
            const categoryName = category?.name || "Unknown Category";

            // Get existing args to preserve them
            const existingArgs = this.getArgsManager().getArgs( this, interaction ) || {};

            // Update with the selected category info
            this.getArgsManager().setArgs( this, interaction, {
                ...existingArgs,
                selectedCategoryId: selectedValue,
                selectedCategoryName: categoryName,
                _wizardShouldDisableNextButton: false
            } );

            // Refresh the UI to show the selected category
            await interaction.deferUpdate();
            await this.editReplyWithStep( interaction, "VertixBot/UI-General/SetupScalingStep2Component" );
        }
    }

    private async onCategoryNameModalSubmitted( interaction: UIDefaultModalChannelTextInteraction ) {
        const categoryNameInputId = this.customIdStrategy.generateId(
            "VertixBot/UI-General/SetupScalingWizardAdapter:VertixBot/UI-General/SetupScalingCategoryNameInput"
        );

        const categoryName = interaction.fields.getTextInputValue( categoryNameInputId );

        try {
            // Create the category in Discord
            const category = await interaction.guild.channels.create( {
                name: categoryName,
                type: ChannelType.GuildCategory
            } );

            // Store the category ID in args
            this.getArgsManager().setArgs( this, interaction, {
                selectedCategoryId: category.id,
                selectedCategoryName: categoryName,
                _wizardShouldDisableNextButton: false
            } );

            await this.editReplyWithStep( interaction, "VertixBot/UI-General/SetupScalingStep2Component" );
        } catch ( error ) {
            console.error( "Error creating category:", error );
            await this.ephemeralWithStep( interaction, "VertixBot/UI-General/SetupScalingWizardError" );
        }
    }

    private async onMaxMembersSelected( interaction: UIDefaultStringSelectMenuChannelTextInteraction ) {
        const selectedValue = interaction.values[ 0 ];

        // Get existing args to preserve them
        const existingArgs = this.getArgsManager().getArgs( this, interaction ) || {};

        // Update with the selected max members
        this.getArgsManager().setArgs( this, interaction, {
            ...existingArgs,
            maxMembersPerChannel: selectedValue
        } );

        // Refresh the UI
        await interaction.deferUpdate();
        await this.editReplyWithStep( interaction, "VertixBot/UI-General/SetupScalingStep3Component" );
    }

    private async onPrefixModalSubmitted( interaction: UIDefaultModalChannelTextInteraction ) {
        // Defer the interaction immediately unless it's already deferred
        if ( !interaction.deferred && !interaction.replied ) {
            try {
                await interaction.deferUpdate();
            } catch ( error ) {
                console.error( "Error deferring interaction:", error );
                return;
            }
        }

        const prefixInputId = this.customIdStrategy.generateId(
            "VertixBot/UI-General/SetupScalingWizardAdapter:VertixBot/UI-General/SetupScalingPrefixInput"
        );

        // Get the channel prefix from the modal submission
        const channelPrefix = interaction.fields.getTextInputValue( prefixInputId );

        // Get existing args to preserve all other values
        const existingArgs = this.getArgsManager().getArgs( this, interaction ) || {};

        // Update args with the new channelPrefix value
        const updatedArgs = {
            ...existingArgs,
            channelPrefix
        };

        // Store the updated args
        this.getArgsManager().setArgs( this, interaction, updatedArgs );

        try {
            // Refresh UI with updated args
            await this.editReplyWithStep( interaction, "VertixBot/UI-General/SetupScalingStep3Component" );
        } catch ( error ) {
            console.error( "Error updating UI after modal submission:", error );
        }
    }
}
