import { ServiceLocatorMock } from "@vertix.gg/test-utils/src/__mock__/service-locator-mock";

import { ServiceBase } from "@vertix.gg/base/src/modules/service/service-base";

import { ServiceWithDependenciesBase } from "@vertix.gg/base/src/modules/service/service-with-dependencies-base";
import {
    CircularServiceA,
    CircularServiceB,
} from "@vertix.gg/base/test/modules/service/__mock__";

describe( "VertixBase/Modules/Service" , () => {
    describe( "VertixBase/Circular Dependency", () => {
        beforeEach( () => {
            ServiceLocatorMock.reset();
        } );

        it( "should not detect circular dependency", async () => {
            // Arrange.
            class AppService extends ServiceBase {
                public static getName() {
                    return "VertixBot/Services/App";
                }
            }

            class UIAdapterService extends ServiceWithDependenciesBase<{
                appService: AppService,
            }> {
                public static getName() {
                    return "VertixGUI/UIAdapterService";
                }

                public getDependencies() {
                    return {
                        appService: "VertixBot/Services/App",
                    };
                }
            }

            class ChannelService extends ServiceWithDependenciesBase<{
                appService: AppService,
            }> {
                public static getName() {
                    return "VertixBot/Services/Channel";
                }

                public getDependencies() {
                    return {
                        appService: "VertixBot/Services/App",
                    };
                }
            }

            class DynamicChannelService extends ServiceWithDependenciesBase<{
                appService: AppService,
                channelService: ChannelService,
            }> {
                public static getName() {
                    return "VertixBot/Services/DynamicChannel";
                }

                public getDependencies() {
                    return {
                        appService: "VertixBot/Services/App",
                        channelService: "VertixBot/Services/Channel",
                    };
                }
            }

            class MasterChannelService extends ServiceWithDependenciesBase<{
                appService: AppService,
                uiAdapterService: UIAdapterService,
                channelService: ChannelService,
                dynamicChannelService: DynamicChannelService,
            }> {
                public static getName() {
                    return "VertixBot/Services/MasterChannel";
                }

                public getDependencies() {
                    return {
                        appService: "VertixBot/Services/App",
                        uiAdapterService: "VertixGUI/UIAdapterService",
                        channelService: "VertixBot/Services/Channel",
                        dynamicChannelService: "VertixBot/Services/DynamicChannel",
                    };
                }
            }

            // Act & Assert.
            expect( async () => {
                ServiceLocatorMock.$.register( AppService );
                ServiceLocatorMock.$.register( UIAdapterService );
                ServiceLocatorMock.$.register( ChannelService );
                ServiceLocatorMock.$.register( DynamicChannelService );
                ServiceLocatorMock.$.register( MasterChannelService );
            } ).not.toThrow();
        } );

        it( "should fail on circular dependencies", async () => {
            // Arrange + Act & Assert.
            expect( async () => {
                ServiceLocatorMock.$.register( CircularServiceA );
                ServiceLocatorMock.$.register( CircularServiceB );

                await ServiceLocatorMock.$.waitFor( "Services/CircularA" );
                await ServiceLocatorMock.$.waitFor( "Services/CircularB" );
            } ).toThrow( "Circular dependency detected" );
        } );

        it( "should fail on complex circular dependencies", async () => {
            // Arrange.
            class ServiceA extends ServiceWithDependenciesBase<{
                serviceD: ServiceD,
            }> {
                public static getName() {
                    return "Services/ServiceA";
                }

                public getDependencies() {
                    return {
                        serviceD: "Services/ServiceD",
                    };
                }
            }

            class ServiceB extends ServiceWithDependenciesBase<{
                serviceA: ServiceA,
            }> {
                public static getName() {
                    return "Services/ServiceB";
                }

                public getDependencies() {
                    return {
                        serviceA: "Services/ServiceA",
                    };
                }
            }

            class ServiceC extends ServiceWithDependenciesBase<{
                serviceB: ServiceB,
            }> {
                public static getName() {
                    return "Services/ServiceC";
                }

                public getDependencies() {
                    return {
                        serviceB: "Services/ServiceB",
                    };
                }
            }

            class ServiceD extends ServiceWithDependenciesBase<{
                serviceC: ServiceC,
            }> {
                public static getName() {
                    return "Services/ServiceD";
                }

                public getDependencies() {
                    return {
                        serviceC: "Services/ServiceC",
                    };
                }
            }

            // Act & Assert.
            expect( async () => {
                ServiceLocatorMock.$.register( ServiceA );
                ServiceLocatorMock.$.register( ServiceB );
                ServiceLocatorMock.$.register( ServiceC );
                ServiceLocatorMock.$.register( ServiceD );
            } ).toThrow( "Circular dependency detected" );
        } );
    } );
} );
