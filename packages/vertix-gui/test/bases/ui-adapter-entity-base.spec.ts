import { ComponentType } from "discord.js";

import { UIAdapterEntityBase } from "@vertix.gg/gui/src/bases/ui-adapter-entity-base";

import type { UIEntitySchemaBase, UILabelledComponentRow } from "@vertix.gg/gui/src/bases/ui-definitions";

function selectMenu( customId: string, header?: string ): UIEntitySchemaBase {
    return {
        name: `VertixBot/UI-General/${ customId }`,
        type: "element",
        isAvailable: true,
        attributes: {
            type: ComponentType.StringSelect,
            custom_id: customId,
            options: [ { label: "An option", value: "an-option" } ]
        },
        ... header ? { header } : {}
    };
}

/**
 * What the method under test needs of an adapter: itself, and somewhere to get a custom id from.
 */
interface LabelledRowsHost {
    buildLabelledRowsBySchema( schema: ( UIEntitySchemaBase | undefined )[][] ): UILabelledComponentRow[];
    generateCustomIdForEntity( entity: UIEntitySchemaBase ): string;
}

/**
 * Reaches the method without standing an adapter up - the rest of one is a service graph this has
 * no use for. The prototype is taken whole rather than method by method, because the method under
 * test calls its neighbour.
 */
function labelledRowsOf( schema: ( UIEntitySchemaBase | undefined )[][] ): UILabelledComponentRow[] {
    const host = Object.create( UIAdapterEntityBase.prototype ) as LabelledRowsHost;

    host.generateCustomIdForEntity = ( entity ) => String( entity.attributes.custom_id );

    return host.buildLabelledRowsBySchema( schema );
}

/**
 * A heading belongs to the menu it names, so it has to survive the build that turns entities into
 * the rows discord takes - by then the entities are gone, and with them the pairing.
 */
describe( "VertixGUI/UIAdapterEntityBase/buildLabelledRowsBySchema", () => {
    it( "should keep each row's heading beside it", () => {
        const rows = labelledRowsOf( [
            [ selectMenu( "edit", "Master Channels" ) ],
            [ selectMenu( "create", "New Master Channel" ) ]
        ] );

        expect( rows.map( ( { header } ) => header ) ).toEqual( [ "Master Channels", "New Master Channel" ] );
    } );

    it( "should leave a row that declares no heading without one", () => {
        const rows = labelledRowsOf( [ [ selectMenu( "edit" ) ] ] );

        expect( rows ).toHaveLength( 1 );
        expect( rows[ 0 ].header ).toBeUndefined();
    } );

    /**
     * The case that broke `/setup`'s edit screen on its way back from editing buttons. An excluded
     * element leaves its place in the row behind rather than closing it, so a row reaches here with
     * a gap in it - which reading the entity without asking whether there is one turns into a throw
     * that takes the whole screen down.
     */
    it( "should read past a gap left by an excluded element", () => {
        const rows = labelledRowsOf( [ [ undefined, selectMenu( "edit", "Master Channels" ) ] ] );

        expect( rows ).toHaveLength( 1 );
        expect( rows[ 0 ].header ).toBe( "Master Channels" );
    } );

    it( "should answer with no rows when a row holds nothing that can be drawn", () => {
        expect( labelledRowsOf( [ [ undefined ] ] ) ).toEqual( [] );
    } );
} );
