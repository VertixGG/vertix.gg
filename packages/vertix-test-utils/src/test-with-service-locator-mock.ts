import { ServiceLocatorMock } from "@vertix.gg/test-utils/src/__mock__/service-locator-mock";

export class TestWithServiceLocatorMock {
    private static beforeEach() {
        // Mock ServiceLocator.
        ServiceLocatorMock.mockOrigin();

        // Reset ServiceLocator.
        ServiceLocatorMock.reset();
    }

    private static async afterEach() {
        // Await for all services to be registered.
        await ServiceLocatorMock.$.waitForAll();
    }

    public static async withUIServiceMock() {
        this.beforeEach();

        ServiceLocatorMock.$.register(
            ( await import( "@vertix.gg/test-utils/src/__mock__/ui-service-mock" ) ).UIServiceMock
        );
        ServiceLocatorMock.$.register(
            ( await import( "@vertix.gg/test-utils/src/__mock__/ui-hash-service-mock" ) ).UIHashServiceMock
        );

        await this.afterEach();
    }

    public static async withUIAdapterServiceMock() {
        this.beforeEach();

        ServiceLocatorMock.$.register(
            ( await import( "@vertix.gg/test-utils/src/__mock__/ui-service-mock" ) ).UIServiceMock
        );
        ServiceLocatorMock.$.register(
            ( await import( "@vertix.gg/test-utils/src/__mock__/ui-hash-service-mock" ) ).UIHashServiceMock
        );
        ServiceLocatorMock.$.register(
            ( await import( "@vertix.gg/test-utils/src/__mock__/ui-adapter-service-mock" ) ).UIAdapterServiceMock
        );

        await this.afterEach();
    }
}
