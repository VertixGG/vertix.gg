import { expect, test } from "@vertix.gg/bot-e2e/src/fixtures/e2e-fixtures";

import { BotCatalog } from "@vertix.gg/bot-e2e/src/catalog/bot-catalog";
import { normalizeDiscordText } from "@vertix.gg/bot-e2e/src/discord/discord-text";

const VOICE_COMMANDS = BotCatalog.$.commandsOfGroup( "voice" );

/**
 * `/voice` again, on a channel made by a generator running the older interface.
 *
 * A guild can run v2 and v3 generators side by side, and the generator a channel came from decides
 * which adapter every command opens - `interactions-spec.md` is explicit that the versioning service
 * cannot work this out for itself, because the two interfaces do not name a feature alike. v2's rename
 * is `DynamicChannelMetaRenameAdapter` against v3's `DynamicChannelRenameAdapter`, and a name that does
 * not match resolves to nothing rather than failing - which is the whole reason these rows are written
 * out per command instead of derived.
 *
 * What each row is expected to do comes from the definition, so the three cases stay honest:
 *
 * - a row naming `modalNameV2` must open that modal, not v3's;
 * - a row naming only `adapterNameV2` must open a screen rather than refuse;
 * - a row naming neither is a feature v2 never had, and must say so.
 */
test.describe( "voice commands on a v2 channel", () => {
    for ( const command of VOICE_COMMANDS.filter( ( candidate ) => candidate.modalNameV2 ) ) {
        test( `${ command.fullName } opens the v2 modal`, async( { app, ownedV2Channel } ) => {
            expect( ownedV2Channel.version ).toBe( "v2" );

            await app.openCommandChannel();

            await app.commands.send( { group: command.group, name: command.name } );

            await app.modal.waitForTitle( BotCatalog.$.modalTitle( command.modalNameV2 as string ) );

            await app.modal.cancel();
        } );
    }

    for ( const command of VOICE_COMMANDS.filter( ( candidate ) => candidate.adapterNameV2 && ! candidate.modalNameV2 ) ) {
        test( `${ command.fullName } reaches its v2 feature`, async( { app, ownedV2Channel } ) => {
            expect( ownedV2Channel.version ).toBe( "v2" );

            await app.openCommandChannel();

            const reply = await app.commands.run( { group: command.group, name: command.name } );

            const shown = await app.messages.titleText( reply );

            for ( const refusal of [
                "VertixBot/UI-General/CommandFailedEmbed",
                "VertixBot/UI-General/FeatureMissingInV2Embed",
                "VertixBot/UI-General/NoActiveDynamicChannelEmbed",
                "VertixBot/UI-General/NotYourChannelEmbed"
            ] ) {
                expect(
                    shown,
                    `${ command.fullName } answered "${ shown }" on a v2 channel`
                ).not.toBe( normalizeDiscordText( BotCatalog.$.embedTitle( refusal ) ) );
            }

            await app.messages.dismiss( reply );
        } );
    }

    for ( const command of VOICE_COMMANDS.filter( ( candidate ) => ! candidate.adapterNameV2 && ! candidate.modalNameV2 ) ) {
        test( `${ command.fullName } says the older interface has no such feature`, async( { app, ownedV2Channel } ) => {
            expect( ownedV2Channel.version ).toBe( "v2" );

            await app.openCommandChannel();

            const reply = await app.commands.run( { group: command.group, name: command.name } );

            await app.messages.expectEmbedTitle(
                reply,
                BotCatalog.$.embedTitle( "VertixBot/UI-General/FeatureMissingInV2Embed" )
            );

            await app.messages.dismiss( reply );
        } );
    }

    test( "every /voice row is covered by one of the three cases above", async() => {
        const withModal = VOICE_COMMANDS.filter( ( command ) => command.modalNameV2 ).length;

        const withAdapter = VOICE_COMMANDS.filter( ( command ) => command.adapterNameV2 && ! command.modalNameV2 ).length;

        const withNeither = VOICE_COMMANDS.filter( ( command ) => ! command.adapterNameV2 && ! command.modalNameV2 ).length;

        expect( withModal + withAdapter + withNeither ).toBe( VOICE_COMMANDS.length );

        expect( withModal, "no row names a v2 modal - the modal cases would silently vanish" ).toBeGreaterThan( 0 );

        expect( withNeither, "every row has a v2 adapter - the missing-feature notice is untested" ).toBeGreaterThan( 0 );
    } );
} );
