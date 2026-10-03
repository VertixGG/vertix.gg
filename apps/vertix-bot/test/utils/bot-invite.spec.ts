import process from "process";

import { jest } from "@jest/globals";

import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

import { DISCORD_EMBED_DESCRIPTION_LIMIT } from "@vertix.gg/definitions/src/discord-limits-definitions";

import {
    BOT_INVITE_LINK_LABEL,
    BOT_INVITE_LINE_PLACEMENTS,
    BOT_VOTE_LINK_LABEL,
    BOT_VOTE_URL,
    BotInvite
} from "@vertix.gg/bot/src/utils/bot-invite";

import type { UIMessageOptions } from "@vertix.gg/gui/src/bases/ui-definitions";

const GUILD_ID = "820000000000000001",
    CALLBACK_URL = "https://api.voicechannels.online/api/install/callback";

/** Stands in for `EntitlementService`, answering whether the server pays for a plan with branding. */
function givenPro( isPro: boolean ) {
    const canBrand = jest.fn( async( _guildId: string ) => isPro );

    jest.spyOn( ServiceLocator, "$", "get" ).mockReturnValue( {
        get: () => ( { canBrand } )
    } as never );

    return canBrand;
}

/** The masked links in a line, label and address, read back the way discord reads them. */
function linksOf( line: string ) {
    return [ ... line.matchAll( /\[([^\]]+)\]\(([^)]+)\)/g ) ].map( ( [ , label, url ] ) => ( { label, url } ) );
}

describe( "VertixBot/Utils/BotInvite", () => {
    const callbackUrl = process.env.INSTALL_CALLBACK_URL;

    beforeEach( () => {
        process.env.INSTALL_CALLBACK_URL = CALLBACK_URL;
    } );

    afterEach( () => {
        process.env.INSTALL_CALLBACK_URL = callbackUrl;

        jest.restoreAllMocks();
    } );

    describe( "getUrl()", () => {
        it( "should count the install against the place it was pressed", () => {
            // Act.
            const url = new URL( BotInvite.$.getUrl( "bot-welcome" ) );

            // Assert.
            expect( url.searchParams.get( "state" ) ).toBe( "bot-welcome" );
            expect( url.searchParams.get( "redirect_uri" ) ).toBe( CALLBACK_URL );
            expect( url.searchParams.get( "permissions" ) ).toBe( "286354576" );
        } );

        it( "should stay the plain invite while the callback is not set", () => {
            // Arrange.
            process.env.INSTALL_CALLBACK_URL = "";

            // Act.
            const url = new URL( BotInvite.$.getUrl( "bot-welcome" ) );

            // Assert.
            expect( url.searchParams.has( "state" ) ).toBe( false );
            expect( url.searchParams.has( "redirect_uri" ) ).toBe( false );
        } );
    } );

    describe( "resolveLine()", () => {
        it( "should end a free server's message in a small line with the invite, then the vote", async() => {
            // Arrange.
            givenPro( false );

            // Act.
            const line = await BotInvite.$.resolveLine( GUILD_ID, "bot-room-panel" ) ?? "";

            // Assert.
            const [ invite, vote ] = linksOf( line );

            expect( line.startsWith( "-# ➕ [" ) ).toBe( true );
            expect( invite.label ).toBe( BOT_INVITE_LINK_LABEL );
            expect( new URL( invite.url ).searchParams.get( "state" ) ).toBe( "bot-room-panel" );
            expect( vote ).toEqual( { label: BOT_VOTE_LINK_LABEL, url: BOT_VOTE_URL } );
        } );

        it( "should leave it off a server that pays for a plan with branding", async() => {
            // Arrange.
            const canBrand = givenPro( true );

            // Act.
            const line = await BotInvite.$.resolveLine( GUILD_ID, "bot-generator-panel" );

            // Assert.
            expect( line ).toBeNull();
            expect( canBrand ).toHaveBeenCalledWith( GUILD_ID );
        } );

        it( "should leave it off a message drawn for no server, without asking about one", async() => {
            // Arrange.
            const canBrand = givenPro( false );

            // Act.
            const line = await BotInvite.$.resolveLine( undefined, "bot-room-panel" );

            // Assert.
            expect( line ).toBeNull();
            expect( canBrand ).not.toHaveBeenCalled();
        } );
    } );

    describe( "addLine()", () => {
        const LINE = "-# ➕ [Add VoiceChannels to your server](https://discord.com/oauth2/authorize)";

        it( "should put the line under the description, on a copy of the embed", () => {
            // Arrange - the embed as the interface editor left it, its description replaced outright.
            const embed = { title: "Room", description: "Written in the editor" },
                message: UIMessageOptions = { content: "<@1>", embeds: [ embed ], components: [] };

            // Act.
            const result = BotInvite.$.addLine( message, LINE );

            // Assert.
            expect( result.embeds ).toEqual( [ { title: "Room", description: `Written in the editor\n\n${ LINE }` } ] );
            expect( result.content ).toBe( "<@1>" );
            expect( embed.description ).toBe( "Written in the editor" );
        } );

        it( "should not leave the description's trailing blank lines between it and the line", () => {
            // Act - the room's own description closes on a newline.
            const result = BotInvite.$.addLine( { embeds: [ { description: "🎚 ・ Bitrate: **64 kbps**\n" } ] }, LINE );

            // Assert.
            expect( result.embeds ).toEqual( [ { description: `🎚 ・ Bitrate: **64 kbps**\n\n${ LINE }` } ] );
        } );

        it( "should put the line above a closing heading, where the placement asks for it", () => {
            // Arrange - the generator panel's own description, closing on the heading over its image.
            const message: UIMessageOptions = {
                embeds: [ { description: "Embrace the responsibility.\n\n**Available Features:**\n\n" } ]
            };

            // Act.
            const result = BotInvite.$.addLine( message, LINE, BOT_INVITE_LINE_PLACEMENTS.ABOVE_LAST_PARAGRAPH );

            // Assert.
            expect( result.embeds ).toEqual( [ {
                description: `Embrace the responsibility.\n\n${ LINE }\n\n**Available Features:**\n\n`
            } ] );
        } );

        it( "should put the line under a description of one paragraph, which has nothing to go above", () => {
            // Act - what the interface editor might have replaced the panel's description with.
            const result = BotInvite.$.addLine(
                { embeds: [ { description: "Written in the editor" } ] },
                LINE,
                BOT_INVITE_LINE_PLACEMENTS.ABOVE_LAST_PARAGRAPH
            );

            // Assert.
            expect( result.embeds ).toEqual( [ { description: `Written in the editor\n\n${ LINE }` } ] );
        } );

        it( "should touch only the first embed", () => {
            // Arrange.
            const second = { description: "Second" },
                message: UIMessageOptions = { embeds: [ { description: "First" }, second ] };

            // Act.
            const result = BotInvite.$.addLine( message, LINE );

            // Assert.
            expect( result.embeds?.[ 1 ] ).toBe( second );
        } );

        it( "should give an embed with no description the line alone", () => {
            // Act.
            const result = BotInvite.$.addLine( { embeds: [ { title: "Room" } ] }, LINE );

            // Assert.
            expect( result.embeds ).toEqual( [ { title: "Room", description: LINE } ] );
        } );

        it( "should leave the message as it was when the line would take it past discord's limit", () => {
            // Arrange - an owner's own description, near the most discord accepts.
            const message: UIMessageOptions = {
                embeds: [ { description: "x".repeat( DISCORD_EMBED_DESCRIPTION_LIMIT - LINE.length ) } ]
            };

            // Act.
            const result = BotInvite.$.addLine( message, LINE );

            // Assert.
            expect( result ).toBe( message );
        } );

        it( "should leave a message with no embed, or no line, as it was", () => {
            // Arrange.
            const bare: UIMessageOptions = { content: "hello" },
                message: UIMessageOptions = { embeds: [ { description: "Room" } ] };

            // Act & Assert.
            expect( BotInvite.$.addLine( bare, LINE ) ).toBe( bare );
            expect( BotInvite.$.addLine( message, null ) ).toBe( message );
        } );
    } );
} );
