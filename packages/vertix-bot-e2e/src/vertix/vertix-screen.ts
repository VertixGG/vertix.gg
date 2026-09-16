import { expect } from "@playwright/test";

import { E2E_INTERVALS, E2E_TIMEOUTS } from "@vertix.gg/bot-e2e/src/config/e2e-constants";
import { matchesCopy, normalizeDiscordText } from "@vertix.gg/bot-e2e/src/discord/discord-text";

import type { DiscordApp } from "@vertix.gg/bot-e2e/src/discord/discord-app";
import type { TMessageMark } from "@vertix.gg/bot-e2e/src/discord/discord-messages";
import type { Locator } from "@playwright/test";

/**
 * Moving between the screens of one interface.
 *
 * An adapter usually answers by editing the message it is already on, and sometimes by sending a new
 * one - `ephemeralWithStep()` does the second. A test should not have to know which, so every step
 * here accepts either: the message it was handed is re-read first, and only if the title never
 * arrives there is the rest of the channel searched.
 */
export class VertixScreen {
    public constructor( private readonly app: DiscordApp ) {}

    /**
     * Polled by hand rather than through `toPass`, which reports that a predicate timed out and throws
     * away the message underneath it - and the message is the whole value here: what the screen was
     * actually titled says immediately whether the bot opened the wrong thing, refused, or fell over.
     */
    public async expectTitle( message: Locator, expectedTitle: string ): Promise<void> {
        const deadline = Date.now() + E2E_TIMEOUTS.BOT_REPLY_MS;

        let seen = "";

        while ( Date.now() < deadline ) {
            seen = await this.app.messages.titleText( message );

            if ( matchesCopy( seen, expectedTitle ) ) {
                return;
            }

            await this.app.page.waitForTimeout( E2E_INTERVALS.POLL_MS );
        }

        expect(
            normalizeDiscordText( seen ),
            `expected a screen titled "${ normalizeDiscordText( expectedTitle ) }"`
        ).toBe( normalizeDiscordText( expectedTitle ) );
    }

    public async hasTitle( message: Locator, expectedTitle: string ): Promise<boolean> {
        const actual = await this.app.messages.titleText( message );

        return matchesCopy( actual, expectedTitle );
    }

    public async advance( message: Locator, buttonLabel: string, expectedTitle: string ): Promise<Locator> {
        const mark = await this.app.messages.mark();

        await this.app.messages.labelledButton( message, buttonLabel ).click();

        return this.settle( message, mark, expectedTitle );
    }

    public async choose(
        message: Locator,
        placeholder: string,
        optionLabel: string,
        expectedTitle: string
    ): Promise<Locator> {
        const mark = await this.app.messages.mark();

        await this.app.messages.chooseOption( message, placeholder, optionLabel );

        return this.settle( message, mark, expectedTitle );
    }

    /**
     * Where a screen ended up after something that was not a button press - a modal coming back, most
     * of it. Same two possibilities: the message was edited, or a new one arrived.
     */
    public async chooseFirst(
        message: Locator,
        placeholder: string,
        expectedTitle: string
    ): Promise<Locator> {
        const mark = await this.app.messages.mark();

        await this.app.messages.chooseFirstOption( message, placeholder );

        return this.settle( message, mark, expectedTitle );
    }

    public async settle( message: Locator, mark: TMessageMark, expectedTitle: string ): Promise<Locator> {
        const deadline = Date.now() + E2E_TIMEOUTS.BOT_REPLY_MS;

        while ( Date.now() < deadline ) {
            if ( await this.hasTitle( message, expectedTitle ) ) {
                return message;
            }

            const { arrived, changed } = await this.app.messages.newerThan( mark );

            for ( const id of [ ...arrived, ...changed ] ) {
                const fresh = this.app.messages.byId( id );

                if ( await this.hasTitle( fresh, expectedTitle ) ) {
                    return fresh;
                }
            }

            await this.app.page.waitForTimeout( E2E_INTERVALS.POLL_MS );
        }

        throw new Error( `No screen titled "${ expectedTitle }" appeared within ${ E2E_TIMEOUTS.BOT_REPLY_MS }ms.` );
    }
}
