import { ServiceLocatorMock } from "@vertix.gg/test-utils/src/__mock__/service-locator-mock";

import { UIMockGeneratorUtil } from "@vertix.gg/test-utils/src/ui-mock-generator-util/ui-mock-generator-util";

import { UIInstancesTypes } from "@vertix.gg/gui/src/bases/ui-definitions";

import type UIAdapterService from "@vertix.gg/gui/src/ui-adapter-service";
import type { UIVersioningAdapterService } from "@vertix.gg/gui/src/ui-versioning-adapter-service";

import type { Base } from "discord.js";

// Mock original ServiceLocator.
ServiceLocatorMock.mockOrigin();

let versioningService: UIVersioningAdapterService;
let adapterService: UIAdapterService;

describe( "VertixGUI/UIVersioningAdapterService", () => {

    beforeEach( async () => {
        ServiceLocatorMock.reset();

        ServiceLocatorMock.$.register( ( await import( "@vertix.gg/test-utils/src/__mock__/ui-service-mock" ) ).UIServiceMock );
        ServiceLocatorMock.$.register( ( await import( "@vertix.gg/test-utils/src/__mock__/ui-adapter-service-mock" ) ).UIAdapterServiceMock );
        ServiceLocatorMock.$.register( ( await import( "@vertix.gg/gui/src/ui-versioning-adapter-service" ) ).UIVersioningAdapterService );

        // Await for all services to be registered.
        await ServiceLocatorMock.$.waitForAll();

        versioningService = ServiceLocatorMock.$.get( "VertixGUI/UIVersioningAdapterService" );
        adapterService = ServiceLocatorMock.$.get( "VertixGUI/UIAdapterService" );
    } );

    it( "should register versions correctly within the given range", () => {
        // Act
        versioningService.registerVersions( [ 1, 3 ] );

        // Assert
        expect( versioningService.getAllVersions().size ).toBe( 3 );
        expect( versioningService.getAllVersions().get( 1 ) ).toBe( "UI-V1" );
        expect( versioningService.getAllVersions().get( 2 ) ).toBe( "UI-V2" );
        expect( versioningService.getAllVersions().get( 3 ) ).toBe( "UI-V3" );
    } );

    it( "should throw an error if versions are already registered", () => {
        versioningService.registerVersions( [ 1, 3 ] );

        expect( () => versioningService.registerVersions( [ 4, 6 ] ) ).toThrow( "Versions already registered" );
    } );

    it( "should return the correct adapter name with version", async () => {
        // Arrange
        const adapters = [
            UIMockGeneratorUtil.createAdapter()
                .withName( "Vertix/UI-V3/RenameAdapter" )
                .withComponent(
                    UIMockGeneratorUtil.createComponent()
                        .withName( "Vertix/UI-V3/RenameComponent" )
                        .withElements( [
                            UIMockGeneratorUtil.createElement().withName( "Vertix/RenameElement" ).build()
                        ] )
                        .build()
                )
                .withInstanceType( UIInstancesTypes.Static )
                .build()
        ];

        // Register fake adapter name
        await adapterService.registerAdapters( adapters );

        versioningService.registerVersions( [ 1, 3 ] );

        // Act
        const adapter =
            versioningService.get( "Vertix/RenameAdapter", {} as Base, {} );

        // Assert
        expect( adapter!.getName() ).toBe( "Vertix/UI-V3/RenameAdapter" );
    } );

    it( "should return the correct adapter name with version for deep adapter names", async () => {
        // Arrange
        const adapters = [
            UIMockGeneratorUtil.createAdapter()
                .withName( "Vertix/UI-V3/CoolEntities/RenameAdapter" )
                .withComponent(
                    UIMockGeneratorUtil.createComponent()
                        .withName( "Vertix/UI-V3/CoolEntities/RenameComponent" )
                        .withElements( [
                            UIMockGeneratorUtil.createElement().withName( "Vertix/CoolEntities/RenameElement" ).build()
                        ] )
                        .build()
                )
                .withInstanceType( UIInstancesTypes.Static )
                .build()
        ];

        // Register fake adapter name
        await adapterService.registerAdapters( adapters );

        versioningService.registerVersions( [ 1, 3 ] );

        // Act
        const adapter =
            versioningService.get( "Vertix/CoolEntities/RenameAdapter", {} as Base, {} );

        // Assert
        expect( adapter!.getName() ).toBe( "Vertix/UI-V3/CoolEntities/RenameAdapter" );
    } );

    it( "should throw an error if no version is determined", () => {
        expect( () =>
            versioningService.determineVersion( {} as Base )
        ).toThrow( "Unable to determine version" );
    } );

    it( "should determine the correct version using the fallback strategy", () => {
        // Arrange
        versioningService.registerVersions( [ 1, 3 ] );

        // Act
        const version = versioningService.determineVersion( {} as Base );

        // Assert
        expect( version ).toBe( 3 );
    } );
} );
