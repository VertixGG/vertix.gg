import { UIControllerBase } from "@vertix.gg/gui/src/bases/ui-controller-base";

import { UI_CUSTOM_ID_SEPARATOR } from "@vertix.gg/gui/src/bases/ui-definitions";
import { VERSION_UI_V3 } from "@vertix.gg/base/src/definitions/version";

import { PrismaBot , PrismaBotClient } from "@vertix.gg/prisma/bot-client";

import { SetupNewWizardFlow } from "@vertix.gg/bot/src/ui/v3/setup-new/setup-new-wizard-flow";

import type { SetupWizardFlowData } from "@vertix.gg/bot/src/ui/v3/setup-new/setup-new-wizard-flow";

import type { TControllerRegisterOptions } from "@vertix.gg/gui/src/bases/ui-controller-base";

import type { UIComponentConstructor } from "@vertix.gg/gui/src/bases/ui-definitions";

import type {
    Interaction,
    ButtonInteraction,
    ModalSubmitInteraction,
    StringSelectMenuInteraction,
    RoleSelectMenuInteraction,
    CacheType,
    InteractionReplyOptions,
    InteractionEditReplyOptions
} from "discord.js";

// Type alias for interactions handled by this controller
type SetupWizardInteraction = Interaction<CacheType>;
// Type alias for the handoff data from the initiating flow/controller
type HandoffData = Partial<SetupWizardFlowData>;

// Type for interaction handlers map
type InteractionHandler = ( interaction: any ) => Promise<void>;

// Define standard transition names as constants for clarity
const WIZARD_TRANSITIONS = {
    Next: "VertixGUI/UIWizardFlowBase/Transitions/Next",
    Back: "VertixGUI/UIWizardFlowBase/Transitions/Back",
    Finish: "VertixGUI/UIWizardFlowBase/Transitions/Finish",
    Error: "VertixGUI/UIWizardFlowBase/Transitions/Error"
};

export class SetupNewWizardController extends UIControllerBase<SetupNewWizardFlow> {

    // Map to store handlers keyed by customId
    private interactionHandlers = new Map<string, InteractionHandler>();

    public static getName(): string {
        return "VertixBot/Controllers/SetupNewWizardController";
    }

    public constructor( options: TControllerRegisterOptions ) {
        super( options );
        this.logger.log( this.constructor, "Initialized" );
        // Base constructor calls initializeBindings()
    }

    // --- Public Entry Point ---
    /**
     * Public method to start the wizard, called by the initiating controller.
     */
    public async start( interaction: ButtonInteraction<CacheType>, handoffData: HandoffData ): Promise<void> {
        this.logger.info( this.start, `Starting setup wizard initiated by interaction: ${ interaction.id }` );
        const flow = this.getFlowInstance( interaction, handoffData );
        const startTransition = "VertixBot/UI-V3/SetupNewWizardFlow/Transitions/StartSetup";

        try {
            const success = await this.tryTransitionFlow( flow, startTransition, interaction, handoffData );
            if ( success ) {
                await this.updateUI( interaction, flow );
            } else {
                 this.logger.error( this.start, "Failed initial transition." );
                 if ( !interaction.replied && !interaction.deferred ) await interaction.reply( { content: "Failed to start setup.", ephemeral: true } );
            }
        } catch( error ) {
             this.logger.error( this.start, "Error during start:", error );
             if ( !interaction.replied && !interaction.deferred ) await interaction.reply( { content: "Error starting setup.", ephemeral: true } );
        }
    }

    // --- Core Methods (Implementations) ---

    /**
     * Retrieves or creates an instance of SetupNewWizardFlow for the wizard session.
     */
    protected getFlowInstance( context?: SetupWizardInteraction, initialData?: HandoffData ): SetupNewWizardFlow {
        this.logger.debug( this.getFlowInstance, "Creating new SetupNewWizardFlow instance.", context?.id );
        const flow = new SetupNewWizardFlow( this.options );
        if ( initialData ) {
            flow.updateData( initialData );
        }
        return flow;
    }

    /**
     * Handles incoming interactions routed to this controller during the wizard.
     */
    public async handleInteraction( interaction: SetupWizardInteraction ): Promise<void> {
        this.logger.debug( this.handleInteraction, `Handling wizard interaction: ${ interaction.id }` );
        let handler: InteractionHandler | undefined;
        let customId: string | undefined;

        // Extract customId if available
        if ( "customId" in interaction && typeof interaction.customId === "string" ) {
             customId = interaction.customId;
             handler = this.interactionHandlers.get( customId );
        } else {
            this.logger.warn( this.handleInteraction, `Interaction type ${ interaction.type } has no customId or it's not a string.` );
            return;
        }

        if ( handler ) {
             this.logger.debug( this.handleInteraction, `Found handler for customId: ${ customId }` );
            try {
                await handler.bind( this )( interaction ); // Bind handler to 'this' context
            } catch ( error ) {
                this.logger.error( this.handleInteraction, `Error executing handler for ${ customId }:`, error );
                // Generic error reply
                 if ( interaction.isRepliable() ) {
                     const errorReply = { content: "An error occurred.", ephemeral: true };
                     if ( !interaction.replied && !interaction.deferred ) await interaction.reply( errorReply ).catch( e=>this.logger.error( this.handleInteraction, "Failed error reply", e ) );
                     else await interaction.followUp( errorReply ).catch( e=>this.logger.error( this.handleInteraction, "Failed error followup", e ) );
                 }
            }
        } else {
            this.logger.warn( this.handleInteraction, `No handler found for customId: ${ customId }` );
             if ( interaction.isRepliable() && !interaction.replied && !interaction.deferred ) {
                 await interaction.reply( { content: "This component is not interactive right now.", ephemeral: true } ).catch( e=>this.logger.error( this.handleInteraction, "Failed unknown component reply", e ) );
            }
        }
    }

    /**
     * Binds specific component IDs from wizard steps and standard wizard buttons.
     */
    protected initializeBindings(): void {
         this.logger.debug( this.initializeBindings, "Initializing bindings for SetupNewWizardController..." );
         this.interactionHandlers.clear();
         const contextName = ( this.constructor as typeof SetupNewWizardController ).getName();

        // --- Bind Standard Wizard Buttons ---
        const nextButtonId = this.uiHashService.generateId( `${ contextName }:${ WIZARD_TRANSITIONS.Next }` );
        const backButtonId = this.uiHashService.generateId( `${ contextName }:${ WIZARD_TRANSITIONS.Back }` );
        const finishButtonId = this.uiHashService.generateId( `${ contextName }:${ WIZARD_TRANSITIONS.Finish }` );
        this.interactionHandlers.set( nextButtonId, this.handleNext );
        this.interactionHandlers.set( backButtonId, this.handleBack );
        this.interactionHandlers.set( finishButtonId, this.handleFinish );

        // --- Bind Step 1 Components ---
        const editNameButtonId = this.uiHashService.generateId( `${ contextName }:${ "VertixBot/UI-General/ChannelNameTemplateEditButton" }` );
        const nameModalId = this.uiHashService.generateId( `${ contextName }:${ "VertixBot/UI-General/ChannelNameTemplateModal" }` );
        this.interactionHandlers.set( editNameButtonId, this.handleEditNameClick );
        this.interactionHandlers.set( nameModalId, this.handleNameSubmit );

        // --- Bind Step 2 Components ---
        const buttonsSelectId = this.uiHashService.generateId( `${ contextName }:${ "VertixBot/UI-V3/ChannelButtonsTemplateSelectMenu" }` );
        const configExtrasSelectId = this.uiHashService.generateId( `${ contextName }:${ "VertixBot/UI-General/ConfigExtrasSelectMenu" }` );
        this.interactionHandlers.set( buttonsSelectId, this.handleButtonsSelect );
        this.interactionHandlers.set( configExtrasSelectId, this.handleConfigExtrasSelect );

        // --- Bind Step 3 Components ---
        const rolesSelectId = this.uiHashService.generateId( `${ contextName }:${ "VertixBot/UI-General/VerifiedRolesMenu" }` );
        const everyoneSelectId = this.uiHashService.generateId( `${ contextName }:${ "VertixBot/UI-General/VerifiedRolesEveryoneSelectMenu" }` );
        this.interactionHandlers.set( rolesSelectId, this.handleRolesSelect );
        this.interactionHandlers.set( everyoneSelectId, this.handleVerifiedEveryoneSelect );

        this.logger.debug( this.initializeBindings, `Bindings initialized with ${ this.interactionHandlers.size } handlers.` );
    }

    /**
     * Updates the interaction reply with the UI for the current wizard step.
     */
    protected async updateUI( interaction: SetupWizardInteraction, flow: SetupNewWizardFlow ): Promise<void> {
        const flowData = flow.getData();
        const currentStepIndex = flowData.currentStep ?? 0;
        const stepComponents = flow.getStepComponents();
        const CurrentStepComponent = stepComponents[ currentStepIndex ] as UIComponentConstructor | undefined;

        if ( !CurrentStepComponent ) {
            this.logger.error( this.updateUI, `Invalid step index ${ currentStepIndex } for flow ${ flow.getName() }` );
            return;
        }

        const componentName = ( CurrentStepComponent as any ).getName ? ( CurrentStepComponent as any ).getName() : "Unknown Component";
        this.logger.debug( this.updateUI, `Updating UI for step ${ currentStepIndex }, component: ${ componentName }` );

        try {
            // TODO: Use UIService to build message options from the component and flowData
            // Example conceptual call:
            // const messageOptions = await this.uiService.buildMessageOptionsForComponent(
            //     CurrentStepComponent,
            //     flowData,
            //     interaction // Pass interaction context if needed by builders
            // );

            // --- Placeholder Implementation ---
             this.logger.warn( this.updateUI, `UI Rendering via UIService not implemented. Using placeholder for ${ componentName }` );
            const messageOptions: InteractionReplyOptions & InteractionEditReplyOptions = {
                content: `Showing Step ${ currentStepIndex + 1 }: ${ componentName } (Placeholder UI - Rendering TODO)`,
                components: [],
                embeds: [],
                ephemeral: true
            };
            // --- End Placeholder ---

            if ( !messageOptions ) {
                 throw new Error( `Failed to build message options for ${ componentName }` );
            }

            // Update Interaction Reply
             if ( interaction.isRepliable() ) {
                 if ( interaction.replied || interaction.deferred ) {
                     await interaction.editReply( messageOptions ).catch( e => this.logger.error( this.updateUI, "Error editing reply", e ) );
                 } else {
                     await interaction.reply( messageOptions ).catch( e => this.logger.error( this.updateUI, "Error sending initial reply", e ) );
                 }
            } else {
                 this.logger.warn( this.updateUI, "Interaction is not repliable.", interaction.type );
            }

        } catch ( error ) {
            this.logger.error( this.updateUI, "Failed to build or update interaction UI:", error );
             if ( interaction.isRepliable() ) {
                 const errorReply = { content: "An error occurred while updating the view.", ephemeral: true, components: [], embeds: [] };
                 if ( interaction.replied || interaction.deferred ) {
                     interaction.followUp( errorReply ).catch( e => this.logger.error( this.updateUI, "Failed to send error followup", e ) );
                 } else {
                     interaction.reply( errorReply ).catch( e => this.logger.error( this.updateUI, "Failed to send error reply", e ) );
                 }
             }
        }
    }

    // --- Handler Method Implementations --- (Replacing Placeholders)

    protected async handleNext( interaction: ButtonInteraction<CacheType> ): Promise<void> {
        this.logger.debug( this.handleNext, "Handling 'Next' action." );
        const flow = this.getFlowInstance( interaction );
        try {
            const success = await this.tryTransitionFlow( flow, WIZARD_TRANSITIONS.Next, interaction );
            if ( success ) {
                await this.updateUI( interaction, flow );
            } else {
                 this.logger.warn( this.handleNext, "Transition 'Next' failed or returned false." );
                  // Optionally reply if transition failed but didn't throw
                 if ( interaction.isRepliable() && !interaction.replied && !interaction.deferred ) {
                     await interaction.reply( { content: "Cannot proceed to the next step.", ephemeral: true } ).catch( e => this.logger.error( this.handleNext, "Failed reply on unsuccessful transition", e ) );
                 }
            }
        } catch( error ) {
            this.logger.error( this.handleNext, "Error during 'Next' transition or UI update:", error );
             if ( interaction.isRepliable() && !interaction.replied && !interaction.deferred ) {
                 await interaction.reply( { content: "An error occurred while proceeding.", ephemeral: true } ).catch( e => this.logger.error( this.handleNext, "Failed error reply", e ) );
             }
        }
    }

    protected async handleBack( interaction: ButtonInteraction<CacheType> ): Promise<void> {
         this.logger.debug( this.handleBack, "Handling 'Back' action." );
         const flow = this.getFlowInstance( interaction );
         try {
             const success = await this.tryTransitionFlow( flow, WIZARD_TRANSITIONS.Back, interaction );
             if ( success ) {
                 await this.updateUI( interaction, flow );
             } else {
                  this.logger.warn( this.handleBack, "Transition 'Back' failed or returned false." );
                   // Optionally reply if transition failed but didn't throw
                  if ( interaction.isRepliable() && !interaction.replied && !interaction.deferred ) {
                      await interaction.reply( { content: "Cannot go back to the previous step.", ephemeral: true } ).catch( e => this.logger.error( this.handleBack, "Failed reply on unsuccessful transition", e ) );
                  }
             }
         } catch( error ) {
             this.logger.error( this.handleBack, "Error during 'Back' transition or UI update:", error );
              if ( interaction.isRepliable() && !interaction.replied && !interaction.deferred ) {
                  await interaction.reply( { content: "An error occurred while going back.", ephemeral: true } ).catch( e => this.logger.error( this.handleBack, "Failed error reply", e ) );
              }
         }
    }

    protected async handleFinish( interaction: ButtonInteraction<CacheType> ): Promise<void> {
        this.logger.debug( this.handleFinish, "Handling 'Finish' action." );
        const flow = this.getFlowInstance( interaction );
        const flowData = flow.getData();

        // --- Data Validation ---
        if ( !flowData.dynamicChannelNameTemplate || !flowData.dynamicChannelButtonsTemplate || !flowData.dynamicChannelVerifiedRoles ) {
             this.logger.error( this.handleFinish, "Finish attempted with incomplete data.", flowData );
              if ( !interaction.replied && !interaction.deferred ) {
                 await interaction.reply( { content: "Cannot finish setup, required information is missing.", ephemeral: true } ).catch( e => this.logger.error( this.handleFinish, "Failed validation reply", e ) );
             }
             return;
        }
        if ( !interaction.guildId ) { // Ensure guildId is available
             this.logger.error( this.handleFinish, "Guild ID missing from interaction." );
              if ( !interaction.replied && !interaction.deferred ) {
                 await interaction.reply( { content: "Cannot finish setup, guild context is missing.", ephemeral: true } ).catch( e => this.logger.error( this.handleFinish, "Failed guild check reply", e ) );
             }
             return;
        }

        // --- Data Persistence using Prisma Client ---
        let persistenceSuccess = false;
        try {
            // Get the Prisma client instance
            const client = PrismaBotClient.$.getClient();

            // Define the intermediate type for data before mapping to Prisma input
            type ChannelDataItemInput = {
                key: string;
                version: string;
                type: "string" | "array" | "boolean";
                value?: string | boolean;
                values?: string[];
            };

            // Map flow data to Prisma Create Input
            const createInput: PrismaBot.Prisma.ChannelCreateInput = {
                guildId: interaction.guildId,
                userOwnerId: interaction.user.id,
                channelId: "TEMP_ID_" + Date.now(), // Placeholder
                version: VERSION_UI_V3,
                // Access enum via PrismaBot.Prisma namespace
                internalType: PrismaBot.Prisma.E_INTERNAL_CHANNEL_TYPES.MASTER_CREATE_CHANNEL,
                createdAtDiscord: Math.floor( interaction.createdTimestamp / 1000 ),
                data: {
                    create: ( [
                        // --- Required Fields from Validation ---
                        { key: "dynamicChannelNameTemplate", version: VERSION_UI_V3, type: "string", value: flowData.dynamicChannelNameTemplate },
                        { key: "dynamicChannelButtonsTemplate", version: VERSION_UI_V3, type: "array", values: flowData.dynamicChannelButtonsTemplate },
                        { key: "dynamicChannelVerifiedRoles", version: VERSION_UI_V3, type: "array", values: flowData.dynamicChannelVerifiedRoles },
                        // --- Optional Fields (keep original boolean type here) ---
                        { key: "dynamicChannelMentionable", version: VERSION_UI_V3, type: "boolean", value: flowData.dynamicChannelMentionable ?? false },
                        { key: "dynamicChannelAutoSave", version: VERSION_UI_V3, type: "boolean", value: flowData.dynamicChannelAutoSave ?? false },
                        { key: "dynamicChannelIncludeEveryoneRole", version: VERSION_UI_V3, type: "boolean", value: flowData.dynamicChannelIncludeEveryoneRole ?? false }
                    ] as ChannelDataItemInput[] )
                     .filter( item => ( item.value !== undefined && item.value !== null ) || ( item.values && item.values.length > 0 ) )
                     .map( ( item: ChannelDataItemInput ): PrismaBot.Prisma.ChannelDataCreateWithoutChannelInput => {
                         const newItem: Partial<PrismaBot.Prisma.ChannelDataCreateWithoutChannelInput> & { key: string, version: string } = {
                            key: item.key,
                            version: item.version,
                         };

                         // Map the simple type string to the Prisma Enum via PrismaBot.Prisma namespace
                         switch( item.type ) {
                            case "string": newItem.type = PrismaBot.Prisma.E_DATA_TYPES.string; break;
                            case "boolean": newItem.type = PrismaBot.Prisma.E_DATA_TYPES.boolean; break;
                            case "array": newItem.type = PrismaBot.Prisma.E_DATA_TYPES.array; break;
                            default: throw new Error( `Unsupported data type string: ${ item.type }` );
                         }

                         // Assign value or values based on type, converting boolean value to string
                         if ( item.type === "boolean" && typeof item.value === "boolean" ) {
                             newItem.value = String( item.value );
                         } else if ( item.type === "string" && typeof item.value === "string" ) {
                            newItem.value = item.value;
                         } else if ( item.type === "array" && item.values ) {
                             newItem.values = item.values.map( v => String( v ) );
                         }

                         // Clean up fields
                         if ( newItem.type !== PrismaBot.Prisma.E_DATA_TYPES.array ) { // Use PrismaBot.Prisma namespace
                             delete newItem.values;
                         }
                         if ( newItem.type === PrismaBot.Prisma.E_DATA_TYPES.array ) { // Use PrismaBot.Prisma namespace
                            delete newItem.value;
                         }

                         return newItem as PrismaBot.Prisma.ChannelDataCreateWithoutChannelInput;
                     } )
                }
            };

            this.logger.debug( this.handleFinish, "Attempting to create master channel with data via Prisma client:", JSON.stringify( createInput, null, 2 ) );

            // Use the Prisma client directly to create the channel
            await client.channel.create( { data: createInput } );

            persistenceSuccess = true;
            this.logger.info( this.handleFinish, "Successfully saved master channel data via Prisma client." );

        } catch ( error ) {
            this.logger.error( this.handleFinish, "Failed to save master channel data:", error );
            persistenceSuccess = false;
            const errorData = { errorCode: "DB_SAVE_ERROR", errorMessage: ( error instanceof Error ? error.message : String( error ) ) }; // Type guard for error message
            const errorTransitionSuccess = await this.tryTransitionFlow( flow, WIZARD_TRANSITIONS.Error, interaction, errorData );
            if ( errorTransitionSuccess ) {
                 await this.updateUI( interaction, flow ); // Show error state UI
            } else if ( interaction.isRepliable() && !interaction.replied && !interaction.deferred ) { // Check repliability again
                 await interaction.reply( { content: "An error occurred while saving the configuration.", ephemeral: true } ).catch( e => this.logger.error( this.handleFinish, "Failed error reply", e ) );
            }
            return; // Prevent completion message if save failed
        }

        // --- Transition Flow on Success ---
        if ( persistenceSuccess ) {
            const finishTransitionSuccess = await this.tryTransitionFlow( flow, WIZARD_TRANSITIONS.Finish, interaction );
            if ( finishTransitionSuccess ) {
                 await this.updateUI( interaction, flow ); // Show completion message
            } else {
                this.logger.error( this.handleFinish, "Persistence succeeded but failed to transition to Finish state." );
                 if ( interaction.isRepliable() && !interaction.replied && !interaction.deferred ) { // Check repliability
                     await interaction.reply( { content: "Configuration saved, but failed to update final status.", ephemeral: true } ).catch( e => this.logger.error( this.handleFinish, "Failed final status reply", e ) );
                 }
            }
        }
    }

    protected async handleEditNameClick( interaction: ButtonInteraction<CacheType> ): Promise<void> {
        this.logger.debug( this.handleEditNameClick, "Handling 'Edit Name' button click." );
        const flow = this.getFlowInstance( interaction );
        const _flowData = flow.getData(); // Prefix unused variable

        try {
            // TODO: Implement modal building and showing via UIService
            this.logger.info( this.handleEditNameClick, "Attempting to build and show ChannelNameTemplateModal via UIService (Not Implemented)" );

            // Conceptual call to UIService (replace with actual method name/signature)
            // const modalBuilder = await this.uiService.buildModalForInteraction(
            //     "VertixBot/UI-General/ChannelNameTemplateModal", // Or pass the class constructor
            //     _flowData,
            //     interaction
            // );

            // if ( modalBuilder ) {
            //     await interaction.showModal( modalBuilder );
            // } else {
            //     throw new Error( "UIService failed to build the modal." );
            // }

            // --- Placeholder Reply ---
             if ( !interaction.replied && !interaction.deferred ) {
                 await interaction.reply( { content: "Showing edit name modal... (Placeholder - Requires UIService implementation)", ephemeral: true } );
             }
             // --- End Placeholder ---

        } catch ( error ) {
            this.logger.error( this.handleEditNameClick, "Error preparing or showing modal:", error );
            if ( interaction.isRepliable() && !interaction.replied && !interaction.deferred ) {
                await interaction.reply( { content: "Could not open the edit dialog.", ephemeral: true } );
            }
        }
    }

    protected async handleNameSubmit( interaction: ModalSubmitInteraction<CacheType> ): Promise<void> {
       this.logger.debug( this.handleNameSubmit, "Handling name template modal submission." );
       const flow = this.getFlowInstance( interaction );

       // Generate the custom ID for the input field within the modal
       const inputElementName = "VertixBot/UI-General/ChannelNameTemplateInput";
       const contextName = ( this.constructor as typeof SetupNewWizardController ).getName();
       // The field ID is typically namespaced by the modal's ID which itself is namespaced by the controller/adapter
       // We also need the modal's name for the full context
       const modalName = "VertixBot/UI-General/ChannelNameTemplateModal";
       const modalCustomId = this.uiHashService.generateId( `${ contextName }:${ modalName }` );
       // Assuming the input field ID follows the pattern: {modalCustomId}:{inputElementName}
       // NOTE: This assumption might be wrong; the exact pattern depends on UIHashService/framework implementation
       const fieldId = `${ modalCustomId }${ UI_CUSTOM_ID_SEPARATOR }${ inputElementName }`;

       let name: string | null = null;
       try {
           name = interaction.fields.getTextInputValue( fieldId );
       } catch ( error ) {
            this.logger.error( this.handleNameSubmit, `Failed to get text input value for field ID: ${ fieldId }`, error );
             if ( interaction.isRepliable() && !interaction.replied && !interaction.deferred ) {
                 await interaction.reply( { content: "Error reading submitted name.", ephemeral: true } );
            }
            return; // Stop processing if field value cannot be read
       }

       this.logger.info( this.handleNameSubmit, `Submitted name: ${ name }` );

       // Update flow data
       flow.updateData( { dynamicChannelNameTemplate: name ?? undefined } ); // Use undefined if null

       // Transition flow
       const transitionName = "VertixBot/UI-V3/SetupNewWizardFlow/Transitions/SubmitNameTemplate";
       const success = await this.tryTransitionFlow( flow, transitionName, interaction );

       if ( success ) {
            await this.updateUI( interaction, flow );
       } else {
           this.logger.error( this.handleNameSubmit, "Failed transition after name submit." );
            if ( !interaction.replied && !interaction.deferred ) {
                await interaction.reply( { content: "Error saving name template.", ephemeral: true } );
            }
       }
    }

    protected async handleButtonsSelect( interaction: StringSelectMenuInteraction<CacheType> ): Promise<void> {
        this.logger.debug( this.handleButtonsSelect, "Handling dynamic channel buttons select menu submission." );
        const flow = this.getFlowInstance( interaction );
        const selectedButtons = interaction.values; // interaction.values is an array of selected option values (button IDs)

        this.logger.info( this.handleButtonsSelect, `Selected buttons: ${ selectedButtons.join( ", " ) }` );

        try {
            // Update flow data with the selected button IDs
            flow.updateData( { dynamicChannelButtonsTemplate: selectedButtons } );

            // No specific transition needed here, just update the UI for the current step
            await this.updateUI( interaction, flow );

        } catch ( error ) {
             this.logger.error( this.handleButtonsSelect, "Error processing button selection or updating UI:", error );
             if ( interaction.isRepliable() && !interaction.replied && !interaction.deferred ) {
                 await interaction.reply( { content: "An error occurred while updating button selection.", ephemeral: true } ).catch( e => this.logger.error( this.handleButtonsSelect, "Failed error reply", e ) );
             }
        }
    }

    protected async handleConfigExtrasSelect( interaction: StringSelectMenuInteraction<CacheType> ): Promise<void> {
         this.logger.debug( this.handleConfigExtrasSelect, "Handling config extras select menu submission." );
         const flow = this.getFlowInstance( interaction );
         const selectedExtras = interaction.values; // Array of selected extra config keys

         this.logger.info( this.handleConfigExtrasSelect, `Selected extras: ${ selectedExtras.join( ", " ) }` );

         // Determine which boolean flags to update based on selection
         // Initialize all to false, then set based on selected values
         const updates: Partial<SetupWizardFlowData> = {
             dynamicChannelMentionable: false,
             dynamicChannelAutoSave: false,
             dynamicChannelIncludeEveryoneRole: false
         };

         if ( selectedExtras.includes( "dynamicChannelMentionable" ) ) {
             updates.dynamicChannelMentionable = true;
         }
         if ( selectedExtras.includes( "dynamicChannelAutoSave" ) ) {
             updates.dynamicChannelAutoSave = true;
         }
         if ( selectedExtras.includes( "dynamicChannelIncludeEveryoneRole" ) ) {
             updates.dynamicChannelIncludeEveryoneRole = true;
         }

         try {
            // Update flow data with the determined boolean values
            flow.updateData( updates );

            // No specific transition needed, just update the UI for the current step
            await this.updateUI( interaction, flow );

        } catch ( error ) {
            this.logger.error( this.handleConfigExtrasSelect, "Error processing config extras selection or updating UI:", error );
            if ( interaction.isRepliable() && !interaction.replied && !interaction.deferred ) {
                await interaction.reply( { content: "An error occurred while updating configuration extras.", ephemeral: true } ).catch( e => this.logger.error( this.handleConfigExtrasSelect, "Failed error reply", e ) );
            }
        }
    }

    protected async handleRolesSelect( interaction: RoleSelectMenuInteraction<CacheType> ): Promise<void> {
        this.logger.debug( this.handleRolesSelect, "Handling verified roles select menu submission." );
        const flow = this.getFlowInstance( interaction );
        const selectedRoles = interaction.values; // interaction.values is an array of selected role IDs

        this.logger.info( this.handleRolesSelect, `Selected roles: ${ selectedRoles.join( ", " ) }` );

        try {
            // Update flow data with the selected role IDs
            flow.updateData( { dynamicChannelVerifiedRoles: selectedRoles } );

            // No specific transition needed here, just update the UI for the current step
            await this.updateUI( interaction, flow );

        } catch ( error ) {
             this.logger.error( this.handleRolesSelect, "Error processing role selection or updating UI:", error );
             if ( interaction.isRepliable() && !interaction.replied && !interaction.deferred ) {
                 await interaction.reply( { content: "An error occurred while updating role selection.", ephemeral: true } ).catch( e => this.logger.error( this.handleRolesSelect, "Failed error reply", e ) );
             }
        }
    }

    protected async handleVerifiedEveryoneSelect( interaction: StringSelectMenuInteraction<CacheType> ): Promise<void> {
         this.logger.debug( this.handleVerifiedEveryoneSelect, "Handling everyone role inclusion select menu submission." );
         const flow = this.getFlowInstance( interaction );
         const selectedValue = interaction.values[ 0 ]; // Expecting a single value like "everyone_yes" or "everyone_no"
         const guildId = interaction.guildId;

         if ( !guildId ) {
             this.logger.error( this.handleVerifiedEveryoneSelect, "Guild ID is missing from interaction. Cannot determine everyone role." );
             if ( interaction.isRepliable() && !interaction.replied && !interaction.deferred ) {
                 await interaction.reply( { content: "Could not determine the @everyone role for this server.", ephemeral: true } ).catch( e => this.logger.error( this.handleVerifiedEveryoneSelect, "Failed guild ID check reply", e ) );
             }
             return;
         }

         this.logger.info( this.handleVerifiedEveryoneSelect, `Selected everyone option: ${ selectedValue } for guild ${ guildId }` );

         try {
            // Get current roles, default to empty array if undefined
            const currentRoles = flow.getData().dynamicChannelVerifiedRoles ?? [];

            // Filter out the guildId (representing @everyone) to handle toggling
            let updatedRoles = currentRoles.filter( roleId => roleId !== guildId );

            // If user selected "yes" (assuming value is "everyone_yes"), add guildId back
            if ( selectedValue === "everyone_yes" ) {
                updatedRoles.push( guildId );
            }

            // Ensure uniqueness just in case (though filtering should handle it)
            updatedRoles = [ ...new Set( updatedRoles ) ];

            // Update flow data
            flow.updateData( { dynamicChannelVerifiedRoles: updatedRoles } );

            // No specific transition needed, just update the UI for the current step
            await this.updateUI( interaction, flow );

        } catch ( error ) {
            this.logger.error( this.handleVerifiedEveryoneSelect, "Error processing everyone role selection or updating UI:", error );
            if ( interaction.isRepliable() && !interaction.replied && !interaction.deferred ) {
                await interaction.reply( { content: "An error occurred while updating the @everyone role setting.", ephemeral: true } ).catch( e => this.logger.error( this.handleVerifiedEveryoneSelect, "Failed error reply", e ) );
            }
        }
    }
}
