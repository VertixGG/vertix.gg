import {
    ActionRowBuilder,
    ComponentBuilder,
    Interaction,
    ModalBuilder,
    ModalSubmitInteraction,
} from "discord.js";

/**
 * @extends {UIBase}
 */
export default abstract class ModalUIBase {
    protected modalBuilder: ModalBuilder | null = null;

    public static getName() {
        return "Dynamico/UI/Elements/ModalUIBase";
    }

    initialize() {
        this.buildModal();
    }

    protected abstract getModalTitle(): string;

    protected abstract onModalSubmit( interaction: ModalSubmitInteraction ): Promise<void>;

    protected abstract build( interaction?: Interaction ): void;

    protected abstract getModalBuilder( callback: ( interaction: ModalSubmitInteraction ) => Promise<void> ): ModalBuilder;

    protected abstract getBuiltRows(): ActionRowBuilder<any>[];

    protected abstract getBuilders( interaction?: Interaction ): ComponentBuilder[] | ComponentBuilder[][] | ModalBuilder[];

    protected buildModal( interaction?: Interaction ) {
        this.modalBuilder = this.getModalBuilder( this.onModalSubmit.bind( this ) );

        this.modalBuilder.setTitle( this.getModalTitle() );

        this.build( interaction );

        this.modalBuilder.addComponents( this.getBuiltRows() );
    }

    protected getModal(): ModalBuilder {
        if ( ! this.modalBuilder ) {
            throw new Error( "ModalBuilder is invalid" );
        }

        return this.modalBuilder;
    }
}
