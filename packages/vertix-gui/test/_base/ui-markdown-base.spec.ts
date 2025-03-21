import path from "node:path";

import { fileURLToPath } from "node:url";

import { UIMarkdownBase } from "@vertix.gg/gui/src/bases/ui-markdown-base";

class UIMarkdownMock extends UIMarkdownBase {
    protected generateLink( content: string ): Promise<string> {
        return Promise.resolve( "" );
    }

    protected getCode(): string {
        return "";
    }
}

describe( "VertixGUI/UIMarkdownTemplateBase", () => {
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
                    return path.dirname( fileURLToPath( import.meta.url ) ) + "/ui-markdown-base.spec.ts"; // This file.
                }
            };

            // Act.
            Class.ensure();

            // Assert.
            expect( Class[ "content" ] ).toContain( "// Path: test/vertix/ui-v2/_base/ui-markdown-base.spec.ts" );
        } );
    } );
} );
