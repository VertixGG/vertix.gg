import { VERSION_UI_V2, VERSION_UI_V3 } from "@vertix.gg/definitions/src/version";

import { buildAdoptionStats } from "@vertix.gg/data/src/reports/adoption-report";

import type { IAdoptionGeneratorRow } from "@vertix.gg/data/src/reports/adoption-report";

function adoption( options: {
    installedGuildIds: string[];
    generators?: IAdoptionGeneratorRow[];
    eventsGuildIds?: string[];
    brandingGuildIds?: string[];
    customizedGuildIds?: string[];
} ) {
    return buildAdoptionStats( {
        generators: [],
        eventsGuildIds: [],
        brandingGuildIds: [],
        customizedGuildIds: [],
        ... options
    } );
}

describe( "VertixData/Reports/Adoption", () => {
    it( "should count the servers running each kind of generator, and the generators of each kind", () => {
        // Arrange - "a" runs two v3 generators and a pool, "b" a v2 generator, "c" nothing.
        const generators: IAdoptionGeneratorRow[] = [
            { guildId: "a", internalType: "MASTER_CREATE_CHANNEL", version: VERSION_UI_V3 },
            { guildId: "a", internalType: "MASTER_CREATE_CHANNEL", version: VERSION_UI_V3 },
            { guildId: "a", internalType: "MASTER_SCALING_CHANNEL", version: VERSION_UI_V3 },
            { guildId: "b", internalType: "MASTER_CREATE_CHANNEL", version: VERSION_UI_V2 }
        ];

        // Act.
        const result = adoption( { installedGuildIds: [ "a", "b", "c" ], generators } );

        // Assert.
        expect( result ).toMatchObject( { installed: 3, setUp: 2, dynamicV3: 1, dynamicV2: 1, pools: 1 } );
        expect( result.generators ).toEqual( { dynamicV3: 2, dynamicV2: 1, pools: 1 } );
    } );

    it( "should count a generator that is not on the v3 interface as v2, as the bot reads it", () => {
        // Arrange - a generator from before the interface was recorded on it.
        const generators: IAdoptionGeneratorRow[] = [
            { guildId: "a", internalType: "MASTER_CREATE_CHANNEL", version: "0.0.0.0" }
        ];

        // Act & Assert.
        expect( adoption( { installedGuildIds: [ "a" ], generators } ) ).toMatchObject( { dynamicV2: 1, dynamicV3: 0 } );
    } );

    it( "should count only the servers the bot is in, each once", () => {
        // Arrange - "gone" removed the bot and left all of these behind.
        const result = adoption( {
            installedGuildIds: [ "a", "b" ],
            generators: [ { guildId: "gone", internalType: "MASTER_CREATE_CHANNEL", version: VERSION_UI_V3 } ],
            eventsGuildIds: [ "a", "gone" ],
            brandingGuildIds: [ "b", "gone" ],
            customizedGuildIds: [ "a", "a", "b", "gone" ]
        } );

        // Act & Assert.
        expect( result ).toEqual( {
            installed: 2,
            setUp: 0,
            dynamicV3: 0,
            dynamicV2: 0,
            pools: 0,
            events: 1,
            branding: 1,
            interfaceEdits: 2,
            generators: { dynamicV3: 0, dynamicV2: 0, pools: 0 }
        } );
    } );
} );
