import {
    DISCORD_APP_ID,
    buildBotInviteUrl,
    isInstallSource
} from "@vertix.gg/definitions/src/discord-invite-definitions";

const CALLBACK_URL = "https://api.voicechannels.online/api/install/callback";

describe( "VertixDefinitions/DiscordInvite", () => {
    describe( "buildBotInviteUrl()", () => {
        it( "should build the plain invite every listing has always sent", () => {
            // Act & Assert.
            expect( buildBotInviteUrl() ).toBe(
                `https://discord.com/oauth2/authorize?client_id=${ DISCORD_APP_ID }` +
                "&permissions=286354576&scope=bot%20applications.commands"
            );
        } );

        it( "should name the server when it is given one", () => {
            // Act.
            const url = new URL( buildBotInviteUrl( "recommended", { guildId: "830000000000000001" } ) );

            // Assert.
            expect( url.searchParams.get( "guild_id" ) ).toBe( "830000000000000001" );
            expect( url.searchParams.get( "disable_guild_select" ) ).toBe( "true" );
        } );

        it( "should ask discord to send the installer back, with the source, when counting is on", () => {
            // Act.
            const url = new URL( buildBotInviteUrl( "minimal", {
                attribution: { callbackUrl: CALLBACK_URL, source: "site-pricing" }
            } ) );

            // Assert.
            expect( url.searchParams.get( "response_type" ) ).toBe( "code" );
            expect( url.searchParams.get( "redirect_uri" ) ).toBe( CALLBACK_URL );
            expect( url.searchParams.get( "state" ) ).toBe( "site-pricing" );
            expect( url.searchParams.get( "permissions" ) ).toBe( "286354448" );
        } );

        it( "should stay the plain invite while the callback is not set", () => {
            // Act - what the site and the dashboard build with an empty INSTALL_CALLBACK_URL.
            const url = buildBotInviteUrl( "recommended", { attribution: { callbackUrl: "", source: "site-home" } } );

            // Assert.
            expect( url ).toBe( buildBotInviteUrl( "recommended" ) );
        } );
    } );

    describe( "isInstallSource()", () => {
        it( "should know its own sources and nothing else", () => {
            // Act & Assert.
            expect( isInstallSource( "site-home" ) ).toBe( true );
            expect( isInstallSource( "dashboard-bot-missing" ) ).toBe( true );
            expect( isInstallSource( "bot-room-panel" ) ).toBe( true );
            expect( isInstallSource( "bot-generator-panel" ) ).toBe( true );
            expect( isInstallSource( "bot-welcome" ) ).toBe( true );
            expect( isInstallSource( "listing-topgg" ) ).toBe( true );
            expect( isInstallSource( "post-reddit" ) ).toBe( true );
            expect( isInstallSource( "site-home " ) ).toBe( false );
            expect( isInstallSource( "" ) ).toBe( false );
            expect( isInstallSource( null ) ).toBe( false );
        } );
    } );
} );
