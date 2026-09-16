import { expect } from "@playwright/test";

import { E2E_TIMEOUTS } from "@vertix.gg/bot-e2e/src/config/e2e-constants";
import { DISCORD_DOM, DISCORD_TEXT } from "@vertix.gg/bot-e2e/src/discord/discord-dom";
import { normalizeDiscordText } from "@vertix.gg/bot-e2e/src/discord/discord-text";

import type { Locator, Page } from "@playwright/test";

/**
 * A modal the bot opened.
 *
 * Its fields carry no name, id or label element - discord draws the label as text above the input -
 * so a field is addressed by its position in the modal, which is the order the bot declares it in.
 * `fieldByLabel()` exists for the modals where that order is not obvious, and walks up from the label
 * text to the input beside it.
 */
export class DiscordModal {
    public constructor( private readonly page: Page ) {}

    /**
     * The modal, and not whatever else discord is drawing as a dialog.
     *
     * `role="dialog"` is not the modal's alone - discord marks tooltips with it too, and a press
     * leaves the cursor on the button it pressed, so the tooltip for that button is open and first
     * in the dom exactly when a modal is being waited for. The failure is not a missing modal but a
     * title assertion against a tooltip's text, which reads like the bot opened the wrong screen.
     *
     * Narrowed by what a modal has and a tooltip does not: a field. Every modal the bot opens
     * declares one - a modal with no input is a screen, and those are not opened this way - so this
     * discriminates on the bot's own shape rather than on an attribute of discord's that is free to
     * change.
     */
    public get dialog(): Locator {
        return this.page
            .locator( DISCORD_DOM.MODAL )
            .filter( { has: this.page.locator( DISCORD_DOM.MODAL_FIELD ) } )
            .first();
    }

    public async waitForTitle( title: string ): Promise<Locator> {
        const dialog = this.dialog;

        await expect( dialog ).toBeVisible( { timeout: E2E_TIMEOUTS.MODAL_OPEN_MS } );

        const heading = normalizeDiscordText( await dialog.innerText() );

        expect( heading ).toContain( normalizeDiscordText( title ) );

        return dialog;
    }

    public field( index: number ): Locator {
        return this.dialog.locator( DISCORD_DOM.MODAL_FIELD ).nth( index );
    }

    public fieldByLabel( label: string ): Locator {
        return this.dialog
            .locator( `xpath=.//*[normalize-space(text())=${ JSON.stringify( label ) }]/ancestor::*[.//input or .//textarea][1]` )
            .locator( DISCORD_DOM.MODAL_FIELD )
            .first();
    }

    public async fillField( index: number, value: string ): Promise<void> {
        const field = this.field( index );

        await field.click();

        await field.fill( value );
    }

    public async readField( index: number ): Promise<string> {
        return this.field( index ).inputValue();
    }

    public async submit(): Promise<void> {
        await this.dialog.getByRole( "button", { name: DISCORD_TEXT.MODAL_SUBMIT, exact: true } ).click();

        await expect( this.dialog ).toBeHidden( { timeout: E2E_TIMEOUTS.MODAL_OPEN_MS } );
    }

    public async cancel(): Promise<void> {
        await this.dialog.getByRole( "button", { name: DISCORD_TEXT.MODAL_CANCEL, exact: true } ).click();

        await expect( this.dialog ).toBeHidden( { timeout: E2E_TIMEOUTS.MODAL_OPEN_MS } );
    }

    public async isOpen(): Promise<boolean> {
        return this.dialog.isVisible().catch( () => false );
    }
}
