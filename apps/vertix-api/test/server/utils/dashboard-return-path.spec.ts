import { parseDashboardReturnPath } from "@vertix.gg/api/src/server/utils/dashboard-return-path";

/**
 * What a sign-in link may ask to come back to. It is a redirect somebody else can type, so what is
 * pinned is mostly what it refuses.
 */
describe( "VertixAPI/Utils/parseDashboardReturnPath", () => {
    it( "should keep a page on the dashboard, with its query", () => {
        // Act & Assert.
        expect( parseDashboardReturnPath( "/billing?plan=pro" ) ).toBe( "/billing?plan=pro" );
        expect( parseDashboardReturnPath( "/generators/123/edit" ) ).toBe( "/generators/123/edit" );
    } );

    it( "should refuse anything that is not a path", () => {
        // Act & Assert.
        expect( parseDashboardReturnPath( undefined ) ).toBeNull();
        expect( parseDashboardReturnPath( "" ) ).toBeNull();
        expect( parseDashboardReturnPath( "billing" ) ).toBeNull();
        expect( parseDashboardReturnPath( "https://evil.example/billing" ) ).toBeNull();
        expect( parseDashboardReturnPath( "javascript:alert(1)" ) ).toBeNull();
    } );

    it( "should refuse what a browser would read as another host", () => {
        // Act & Assert.
        expect( parseDashboardReturnPath( "//evil.example" ) ).toBeNull();
        expect( parseDashboardReturnPath( "/\\evil.example" ) ).toBeNull();
    } );

    it( "should refuse a path carrying control characters", () => {
        // Act & Assert - a newline in a redirect is a header somebody else wrote.
        expect( parseDashboardReturnPath( "/billing\r\nSet-Cookie: a=b" ) ).toBeNull();
        expect( parseDashboardReturnPath( "/billing\u0000" ) ).toBeNull();
    } );

    it( "should refuse a path longer than any page there is", () => {
        // Act & Assert.
        expect( parseDashboardReturnPath( "/" + "a".repeat( 2048 ) ) ).toBeNull();
    } );
} );
