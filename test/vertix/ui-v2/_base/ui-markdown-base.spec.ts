import { UIMarkdownBase } from "@vertix/ui-v2/_base/ui-markdown-base";

class UIMarkdownMock extends UIMarkdownBase {
    protected generateLink( content: string ): Promise<string> {
        return Promise.resolve( "" );
    }

    protected getCode(): string {
        return "";
    }
}

describe( "Vertix/UI-V2/UIMarkdownTemplateBase", () => {
    describe( "ensure()", () => {
        it( "should throw error when content is not available", () => {
            // Arrange.
            const Class = class extends UIMarkdownMock {
                protected static getContentPath(): string {
                    return "/some/path";
                }

                protected getLinkLabel(): string {
                    return "";
                }
            };

            // Act.
            const act = () => Class.ensure();

            // Assert.
            expect( act ).toThrowError( "ENOENT: no such file or directory, open '/some/path'" );
        } );

        it( "should have valid content when content is available", () => {
            // Arrange.
            const Class = class extends UIMarkdownMock {
                protected static getContentPath(): string {
                    return __dirname + "/ui-markdown-base.spec.ts"; // This file.
                }

                protected genreateLink(): string {
                    return "";
                }
            };

            // Act.
            Class.ensure();

            // Assert.
            expect( Class["content"] ).toContain( "// Path: test/vertix/ui-v2/_base/ui-markdown-base.spec.ts" );
        } );
    } );
} );
