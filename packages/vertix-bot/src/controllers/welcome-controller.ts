// Remove unused import ServiceLocator
// import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";
import { UIControllerBase } from "@vertix.gg/gui/src/bases/ui-controller-base";
import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { WelcomeFlow } from "@vertix.gg/bot/src/ui/general/welcome/welcome-flow";

import type { TControllerRegisterOptions } from "@vertix.gg/gui/src/bases/ui-controller-base";

// Remove unused Logger import
// import { Logger } from "@vertix.gg/base/src/modules/logger";

// Re-add interaction types needed for handlers
import type {
    Interaction,
    ButtonInteraction,
    StringSelectMenuInteraction,
    CacheType
} from "discord.js";

// Remove unused UIDataService type import
// import type { UIDataService } from "@vertix.gg/gui/src/ui-data-service";

// TODO: Define specific Interaction types used by this controller if needed
type WelcomeInteraction = Interaction<CacheType>; // Use Interaction<CacheType> for guild context

// Type for interaction handlers map
type InteractionHandler = ( interaction: any ) => Promise<void>; // Ensure type is imported if not already

export class WelcomeController extends UIControllerBase<WelcomeFlow> {

    // Map to store handlers keyed by customId
    private interactionHandlers = new Map<string, InteractionHandler>();

    public static getName(): string {
        return "VertixBot/Controllers/WelcomeController";
    }

    public constructor( options: TControllerRegisterOptions ) {
        super( options );
        // logger is available via this.logger inherited from base class
        this.logger.log( this.constructor, "Initialized" );
        // Note: initializeBindings is called by the base class constructor
    }

    /**
     * Creates a new, transient WelcomeFlow instance for handling an interaction.
     * Assumes WelcomeFlow is essentially stateless in its definition and state is managed per-interaction by the controller.
     */
    protected getFlowInstance( context?: WelcomeInteraction ): WelcomeFlow {
        this.logger.debug( this.getFlowInstance, "Creating new WelcomeFlow instance for interaction", context?.id );
        // Pass the controller options which might contain necessary context/config for the flow
        return new WelcomeFlow( this.options );
    }

    /**
     * Handles incoming interactions routed to this controller.
     */
    public async handleInteraction( interaction: WelcomeInteraction ): Promise<void> {
        this.logger.debug( this.handleInteraction, `Handling interaction: ${ interaction.id }` );

        let handler: InteractionHandler | undefined;
        let customId: string | undefined;

        if ( interaction.isButton() || interaction.isStringSelectMenu() ) {
            customId = interaction.customId;
            handler = this.interactionHandlers.get( customId );
        } else {
            this.logger.warn( this.handleInteraction, `Unhandled interaction type: ${ interaction.type } for interaction ${ interaction.id }` );
            // Optionally reply to user about unhandled type
            return;
        }

        if ( handler ) {
            this.logger.debug( this.handleInteraction, `Found handler for customId: ${ customId }` );
            try {
                // Bind the handler to the controller instance before calling
                await handler.bind( this )( interaction );
            } catch ( error ) {
                this.logger.error( this.handleInteraction, `Error executing handler for ${ customId }:`, error );
                // Optionally reply to the interaction with a generic error message
                // if (interaction.replied || interaction.deferred) { await interaction.followUp({ content: 'An error occurred.', ephemeral: true }); }
                // else { await interaction.reply({ content: 'An error occurred.', ephemeral: true }); }
            }
        } else {
            this.logger.warn( this.handleInteraction, `No handler found for customId: ${ customId }` );
            // Optionally reply to user about unknown component
        }
    }

    /**
     * Binds specific component IDs to handler methods.
     */
    protected initializeBindings(): void {
        this.logger.debug( this.initializeBindings, "Initializing bindings..." );

        // Clear existing handlers (if any, e.g., during hot reload scenarios)
        this.interactionHandlers.clear();

        // --- Define Element Names ---
        const setupButtonName = "VertixBot/UI-General/WelcomeSetupButton";
        const supportButtonName = "VertixBot/UI-General/WelcomeSupportButton";
        const inviteButtonName = "VertixBot/UI-General/WelcomeInviteButton";
        const languageSelectName = "VertixBot/UI-General/LanguageSelectMenu";

        // --- Generate Custom IDs using UIHashService ---
        // We need a context for generateId, using the controller's name for now.
        // This assumes the ID generation context matches how Adapters did it.
        const contextName = ( this.constructor as typeof WelcomeController ).getName(); // Use static getName via constructor
        const setupButtonId = this.uiHashService.generateId( `${ contextName }:${ setupButtonName }` );
        const supportButtonId = this.uiHashService.generateId( `${ contextName }:${ supportButtonName }` );
        const inviteButtonId = this.uiHashService.generateId( `${ contextName }:${ inviteButtonName }` );
        const languageSelectId = this.uiHashService.generateId( `${ contextName }:${ languageSelectName }` );

        // --- Bind Generated IDs to Handlers ---
        this.interactionHandlers.set( setupButtonId, this.handleSetupClick );
        this.interactionHandlers.set( supportButtonId, this.handleSupportClick );
        this.interactionHandlers.set( inviteButtonId, this.handleInviteClick );
        this.interactionHandlers.set( languageSelectId, this.handleLanguageSelect );

        this.logger.debug( this.initializeBindings, `Bindings initialized with ${ this.interactionHandlers.size } handlers.` );
        this.logger.debug( this.initializeBindings, `Language Select ID: ${ languageSelectId }` ); // Log the generated ID for verification
    }

    /**
     * Overrides base method to fetch initial data specific to WelcomeFlow context.
     */
    public override async getInitialContextData( context?: { guildId?: string } ): Promise<Record<string, any>> {
        const initialData: Record<string, any> = {};

        if ( !context?.guildId ) {
            this.logger.debug( this.getInitialContextData, "No guildId provided, returning empty initial data." );
            return initialData;
        }

        this.logger.debug( this.getInitialContextData, `Fetching initial context data for guild: ${ context.guildId }` );

        // Define component names (matching WelcomeFlow.getRequiredDataComponents)
        const badwordsComponentName = "Vertix/Data/Guild/BadwordsData";
        const maxChannelsComponentName = "Vertix/Data/MaxMasterChannelsData";
        const masterChannelsComponentName = "Vertix/Data/Guild/MasterChannelsData";

        try {
            // Fetch Badwords
            const badwordsComponent = this.uiDataService.getDataComponent( badwordsComponentName );
            if ( badwordsComponent ) {
                const badwordsData = await badwordsComponent.read( { guildId: context.guildId } );
                initialData.badwords = badwordsData?.words ?? []; // Use default if null/undefined
            } else {
                this.logger.warn( this.getInitialContextData, `Data component ${ badwordsComponentName } not found.` );
                initialData.badwords = []; // Default
            }

            // Fetch Max Channels (adjust key and property access as needed)
            const maxChannelsComponent = this.uiDataService.getDataComponent( maxChannelsComponentName );
            if ( maxChannelsComponent ) {
                // Assuming read returns the data object directly or null
                const maxChannelsData = await maxChannelsComponent.read( { guildId: context.guildId } );
                initialData.maxMasterChannels = maxChannelsData; // Store the whole data or specific properties
                // Example: initialData.maxMasterChannels = maxChannelsData?.limit ?? DEFAULT_MAX_CHANNELS;
            } else {
                 this.logger.warn( this.getInitialContextData, `Data component ${ maxChannelsComponentName } not found.` );
                 initialData.maxMasterChannels = null; // Or some default value
            }

            // Fetch Master Channels (adjust key and property access as needed)
            // Note: Reading master channels might need a different identifier or return a list
            const masterChannelsComponent = this.uiDataService.getDataComponent( masterChannelsComponentName );
            if ( masterChannelsComponent ) {
                 // Example: Assuming read by guildId returns a list or aggregated data
                 // Adjust identifier and data processing based on GuildMasterChannelsData.read implementation
                 const masterChannelsData = await masterChannelsComponent.read( { guildId: context.guildId } );
                 initialData.masterChannels = masterChannelsData;
            } else {
                 this.logger.warn( this.getInitialContextData, `Data component ${ masterChannelsComponentName } not found.` );
                 initialData.masterChannels = null; // Or empty list []
            }

        } catch ( error ) {
            this.logger.error( this.getInitialContextData, `Error fetching initial context data for guild ${ context.guildId }:`, error );
            // Return potentially partial data or just empty? For editor defaults, returning partial/defaults is likely okay.
        }

        this.logger.debug( this.getInitialContextData, "Returning initial context data:", Object.keys( initialData ) );
        return initialData;
    }

    // --- Interaction Handler Placeholders ---

    protected async handleSetupClick( interaction: ButtonInteraction<CacheType> ): Promise<void> {
        this.logger.log( this.handleSetupClick, `Setup button clicked by ${ interaction.user.id }` );
        const flow = this.getFlowInstance( interaction );
        const transitionName = "VertixBot/UI-General/WelcomeFlow/Transitions/ClickSetup";
        const originatingState = flow.getCurrentState(); // State before transition attempt

        // Attempt the transition within WelcomeFlow first
        const success = await this.tryTransitionFlow( flow, transitionName, interaction );

        if ( success && flow.getCurrentState() === "VertixBot/UI-General/WelcomeFlow/States/SetupClicked" ) {
            this.logger.info( this.handleSetupClick, "WelcomeFlow transitioned to SetupClicked. Initiating handoff to Setup Wizard." );

            // --- Handoff Logic ---
            try {
                // 1. Get the target controller (replace with actual name when created)
                const setupWizardControllerName = "VertixBot/Controllers/SetupNewWizardController"; // Placeholder name
                // Pass options object for silent flag
                const setupController = ServiceLocator.$.get<any>( setupWizardControllerName, { silent: true } ); // Use 'any' for now

                if ( setupController && typeof setupController.start === "function" ) {
                    // 2. Prepare handoff data required by SetupNewWizardFlow entry point
                    const handoffData = {
                        originFlow: WelcomeFlow.getName(),
                        originState: originatingState,
                        originTransition: transitionName,
                        sourceButton: interaction.customId, // The ID of the button that was clicked
                        // Pass any other relevant context if needed
                    };

                    this.logger.debug( this.handleSetupClick, "Calling start method on Setup Wizard Controller with handoff data:", handoffData );

                    // 3. Call the target controller's start method (replace 'start')
                    // This method should handle creating the wizard flow and replying to the interaction.
                    await setupController.start( interaction, handoffData );

                    // If start handles the reply, we don't need the placeholder below.
                    // For now, we keep the placeholder reply.
                     if ( !interaction.replied && !interaction.deferred ) {
                        this.logger.warn( this.handleSetupClick, "Setup controller did not handle interaction reply, sending placeholder." );
                        await interaction.reply( { content: "Starting setup wizard... (Controller Handoff Placeholder - Controller didn't reply)", ephemeral: true } );
                    }

                } else {
                    this.logger.error( this.handleSetupClick, `Setup Wizard Controller (${ setupWizardControllerName }) not found or lacks a 'start' method.` );
                    // Fallback reply if controller/method is missing
                    if ( !interaction.replied && !interaction.deferred ) {
                        await interaction.reply( { content: "Could not start setup wizard (Error).", ephemeral: true } );
                    }
                }
            } catch ( error ) {
                this.logger.error( this.handleSetupClick, "Error during handoff to Setup Wizard Controller:", error );
                 if ( !interaction.replied && !interaction.deferred ) {
                    await interaction.reply( { content: "An error occurred while starting setup.", ephemeral: true } );
                }
            }
        } else if ( !success ) {
            this.logger.error( this.handleSetupClick, "Failed to transition WelcomeFlow state for ClickSetup." );
            // Reply if transition failed
            if ( !interaction.replied && !interaction.deferred ) {
                await interaction.reply( { content: "Could not process setup request.", ephemeral: true } );
            }
        }
    }

    protected async handleSupportClick( interaction: ButtonInteraction<CacheType> ): Promise<void> {
        this.logger.log( this.handleSupportClick, `Support button clicked by ${ interaction.user.id }` );
        const flow = this.getFlowInstance( interaction );
        await this.tryTransitionFlow( flow, "VertixBot/UI-General/WelcomeFlow/Transitions/ClickSupport", interaction );
        // TODO: Implement actual support logic (e.g., send link, modal)
         if( !interaction.replied && !interaction.deferred ) {
            await interaction.reply( { content: "Support link/info here (Placeholder)", ephemeral: true } );
         }
    }

    protected async handleInviteClick( interaction: ButtonInteraction<CacheType> ): Promise<void> {
        this.logger.log( this.handleInviteClick, `Invite button clicked by ${ interaction.user.id }` );
        const flow = this.getFlowInstance( interaction );
        await this.tryTransitionFlow( flow, "VertixBot/UI-General/WelcomeFlow/Transitions/ClickInvite", interaction );
        // TODO: Implement actual invite logic (e.g., send link)
         if( !interaction.replied && !interaction.deferred ) {
            await interaction.reply( { content: "Invite link here (Placeholder)", ephemeral: true } );
        }
    }

    protected async handleLanguageSelect( interaction: StringSelectMenuInteraction<CacheType> ): Promise<void> {
        this.logger.log( this.handleLanguageSelect, `Language selected by ${ interaction.user.id }: ${ interaction.values[ 0 ] }` );
        const flow = this.getFlowInstance( interaction );
        const selectedLanguage = interaction.values[ 0 ];

        // Update the flow instance's data before transitioning
        flow.updateData( { selectedLanguage } );

        // Transition the flow (data is now internal to the flow instance)
        const success = await this.tryTransitionFlow(
            flow,
            "VertixBot/UI-General/WelcomeFlow/Transitions/SelectLanguage",
            interaction
            // No data needed here anymore as it's set via updateData
        );

        if ( success ) {
             // TODO: Update the UI to reflect language change if necessary
             // This might involve re-rendering the components with updated language context
             this.logger.info( this.handleLanguageSelect, `Language selection processed, new state: ${ flow.getCurrentState() }` );
             if( !interaction.replied && !interaction.deferred ) {
                 // Example UI update - replace components/embeds as needed
                 await interaction.update( { content: `Language set to: ${ selectedLanguage } (Placeholder UI Update)`, components: [] } );
             }
        } else {
            // Handle transition failure (e.g., log, notify user)
             this.logger.error( this.handleLanguageSelect, "Failed to transition flow after language selection." );
             // Potentially reply with an error message
        }
    }

    /**
     * TODO: Implement method to update the Discord message based on flow state
     * protected async updateUI(interaction: Interaction, flow: WelcomeFlow): Promise<void> {
     *    // Get necessary data from flow.getData()
     *    // Build message options (embeds, components) using WelcomeComponent
     *    // Use interaction.editReply() or similar
     * }
     */
}
