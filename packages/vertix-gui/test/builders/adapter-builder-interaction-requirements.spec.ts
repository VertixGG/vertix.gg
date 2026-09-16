import { TestWithServiceLocatorMock } from "@vertix.gg/test-utils/src/test-with-service-locator-mock";
import { UIMockGeneratorUtil } from "@vertix.gg/test-utils/src/ui-mock-generator-util/ui-mock-generator-util";

import { UIAdapterBase } from "@vertix.gg/gui/src/bases/ui-adapter-base";
import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import { AdapterBuilderBase } from "@vertix.gg/gui/src/builders/adapter-builder-base";

import type { UIAdapterReplyContext } from "@vertix.gg/gui/src/bases/ui-interaction-interfaces";

const PRESS = { id: "interaction-id" } as unknown as UIAdapterReplyContext;

/**
 * Builds an adapter the way a screen is declared, on a base that answers whatever the test needs
 * about its own requirements - which is how the builder's handler and an inherited check are shown
 * to combine rather than replace one another.
 */
async function buildAdapter( options: {
    handler?: ( interaction: UIAdapterReplyContext ) => Promise<boolean>;
    superPasses?: boolean;
} ) {
    await TestWithServiceLocatorMock.withUIServiceMock();

    const Component = UIMockGeneratorUtil.createComponent()
        .withName( "VertixGUI/Test/RequirementsComponent" )
        .withInstanceType( UIInstancesTypes.Dynamic )
        .build();

    class Base extends UIAdapterBase<never, never> {
        public static getName() {
            return "VertixGUI/Test/RequirementsAdapter";
        }

        public static getInstanceType() {
            return UIInstancesTypes.Dynamic;
        }

        public static getComponent() {
            return Component;
        }

        protected shouldDisableMiddleware() {
            return true;
        }

        public async isPassingInteractionRequirementsInternal() {
            return options.superPasses ?? true;
        }
    }

    const builder = new AdapterBuilderBase( "VertixGUI/Test/RequirementsAdapter", Base as never )
        .setComponent( Component as never );

    if ( options.handler ) {
        builder.setInteractionRequirements( options.handler as never );
    }

    const Generated = builder.build() as unknown as typeof UIAdapterBase<never, never>;

    return new Generated( { instanceType: UIInstancesTypes.Dynamic } as never );
}

describe( "VertixGUI/AdapterBuilderBase/setInteractionRequirements", () => {

    it( "should pass when no requirement was declared", async() => {
        const adapter = await buildAdapter( {} );

        await expect( adapter.isPassingInteractionRequirementsInternal( PRESS as never ) ).resolves.toBe( true );
    } );

    /**
     * The regression this exists for: the setup wizard checked only what the *admin* was allowed to
     * do and never what the bot itself was granted, so a server the bot could not create a channel
     * on let an admin fill in three steps before failing on the last one with a raw API error.
     */
    it( "should refuse when the declared requirement refuses", async() => {
        const seen: UIAdapterReplyContext[] = [];

        const adapter = await buildAdapter( {
            handler: async( interaction ) => {
                seen.push( interaction );
                return false;
            }
        } );

        await expect( adapter.isPassingInteractionRequirementsInternal( PRESS as never ) ).resolves.toBe( false );
        expect( seen ).toEqual( [ PRESS ] );
    } );

    it( "should pass when the declared requirement passes", async() => {
        const adapter = await buildAdapter( { handler: async() => true } );

        await expect( adapter.isPassingInteractionRequirementsInternal( PRESS as never ) ).resolves.toBe( true );
    } );

    // A declared requirement is an addition to what the base already demands, not a way around it.
    it( "should refuse when the base refuses, without consulting the requirement", async() => {
        let consulted = false;

        const adapter = await buildAdapter( {
            superPasses: false,
            handler: async() => {
                consulted = true;
                return true;
            }
        } );

        await expect( adapter.isPassingInteractionRequirementsInternal( PRESS as never ) ).resolves.toBe( false );
        expect( consulted ).toBe( false );
    } );
} );
