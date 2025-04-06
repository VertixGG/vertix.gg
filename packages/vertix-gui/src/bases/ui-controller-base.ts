import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";
import { Logger } from "@vertix.gg/base/src/modules/logger";

import { UIBase } from "@vertix.gg/gui/src/bases/ui-base";

import type { Interaction } from "discord.js"; // Base Interaction type
import type { UIFlowBase } from "@vertix.gg/gui/src/bases/ui-flow-base";
import type { UIService } from "@vertix.gg/gui/src/ui-service";
import type { UIDataService } from "@vertix.gg/gui/src/ui-data-service";
import type { UIHashService } from "@vertix.gg/gui/src/ui-hash-service";

// TODO: Define a specific options type if needed, similar to TAdapterRegisterOptions
export type TControllerRegisterOptions = Record<string, any>;

/**
 * Base class for UI Controllers.
 * Controllers handle incoming interactions, interact with a specific UIFlow instance,
 * manage data fetching/persistence via UIDataService, and orchestrate UI updates.
 */
export abstract class UIControllerBase<TFlow extends UIFlowBase<any, any, any>> extends UIBase {

    protected readonly logger: Logger;
    protected readonly uiService: UIService;
    protected readonly uiDataService: UIDataService;
    protected readonly uiHashService: UIHashService;
    // TODO: Consider adding LanguageManager if needed

    public static getName(): string {
        // This should be overridden by subclasses
        return "VertixGUI/UIControllerBase";
    }

    public constructor( protected options: TControllerRegisterOptions ) {
        super();
        this.logger = new Logger( this );

        // Retrieve common services
        this.uiService = ServiceLocator.$.get<UIService>( "VertixGUI/UIService" );
        this.uiDataService = ServiceLocator.$.get<UIDataService>( "VertixGUI/UIDataService" );
        this.uiHashService = ServiceLocator.$.get<UIHashService>( "VertixGUI/UIHashService" );

        // Initialize interaction bindings
        this.initializeBindings();
    }

    /**
     * Abstract method to get the specific UIFlow instance this controller manages.
     * Implementation might involve creating/retrieving the flow instance.
     */
    protected abstract getFlowInstance( context?: Interaction | any ): Promise<TFlow | null> | TFlow | null;

    /**
     * Entry point for handling incoming interactions relevant to this controller.
     * Subclasses should implement the logic to delegate to specific handlers.
     */
    public abstract handleInteraction( interaction: Interaction ): Promise<void>;

    /**
     * Method where subclasses should bind specific component IDs (buttons, selects, modals)
     * to their corresponding handler methods.
     * Example: this.bindButton('my-button-id', this.handleMyButtonClick);
     */
    protected abstract initializeBindings(): void;

    /**
     * NEW: Fetches initial/default data relevant to the flow based on context (e.g., guildId).
     * Used during serialization for the editor to show context-aware defaults.
     * Subclasses should override this to fetch data using UIDataService.
     * @param context Optional context (e.g., { guildId: string })
     * @returns A promise resolving to a record containing initial data.
     */
    public async getInitialContextData( context?: { guildId?: string } ): Promise<Record<string, any>> {
        this.logger.debug( this.getInitialContextData, "Base implementation called, returning empty data. Context:", context );
        return {}; // Default implementation returns no data
    }

    // --- Placeholder for common binding helper methods (similar to UIAdapterBase) ---

    protected bindButton?( customId: string, handler: ( interaction: any ) => Promise<void> ): void {
        this.logger.warn( this.constructor, `Method 'bindButton' not fully implemented in base class for ${ customId }`, handler );
        // Implementation would likely involve registering the handler with UIService or an internal map
    }

    protected bindSelectMenu?( customId: string, handler: ( interaction: any ) => Promise<void> ): void {
         this.logger.warn( this.constructor, `Method 'bindSelectMenu' not fully implemented in base class for ${ customId }`, handler );
        // Implementation...
    }

    protected bindModal?( customId: string, handler: ( interaction: any ) => Promise<void> ): void {
         this.logger.warn( this.constructor, `Method 'bindModal' not fully implemented in base class for ${ customId }`, handler );
        // Implementation...
    }

    // --- Helper methods for flow interaction ---

    protected async tryTransitionFlow( flow: TFlow, transition: string, interaction: Interaction, data?: Record<string, any> ): Promise<boolean> {
        // Check if transition is valid for current state
        const availableTransitions = flow.getAvailableTransitions();
        if ( !availableTransitions.includes( transition ) ) {
            this.logger.warn( this.tryTransitionFlow, `Invalid transition '${ transition }' attempted from state '${ flow.getCurrentState() }'`, { available: availableTransitions } );
            // Optionally reply to interaction with an error
            return false;
        }

        // Check required data - Passing transition argument based on concrete implementations (e.g., WelcomeFlow)
        // @ts-ignore // Suppress potential mismatch with base UIFlowBase definition
        const requiredDataKeys = flow.getRequiredData( transition );
        const missingData = requiredDataKeys.filter( key => !( key in ( data ?? {} ) ) );
        if ( missingData.length > 0 ) {
             this.logger.error( this.tryTransitionFlow, `Missing required data for transition '${ transition }': ${ missingData.join( ", " ) }` );
             // Optionally reply to interaction with an error
             // NOTE: Even if data is missing, we proceed to transition based on base signature, but log error.
             // Consider returning false here if data is strictly required *before* transition.
        }

        // TODO: If data is needed *by* the transition logic itself, it should be set on the flow's data object *before* calling transition.
        // Example: if (data) { flow.updateData(data); }

        try {
            // Call transition with only the name to match base signature
            await flow.transition( transition ); // Pass only transition name
            this.logger.log( this.tryTransitionFlow, `Flow transitioned to state: ${ flow.getCurrentState() } via transition: ${ transition }` );
            // TODO: Trigger UI update based on new state
            // await this.updateUI(interaction, flow);
            return true;
        } catch ( error ) {
            this.logger.error( this.tryTransitionFlow, `Error during flow transition '${ transition }':`, error );
            // Optionally reply to interaction with an error
            return false;
        }
    }

     // TODO: Add methods for updating UI (e.g., editReply, sendEphemeral based on flow state)
     // protected abstract updateUI(interaction: Interaction, flow: TFlow): Promise<void>;

}
