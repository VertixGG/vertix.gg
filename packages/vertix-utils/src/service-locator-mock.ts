import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

export class ServiceLocatorMock extends ServiceLocator {
    public static reset() {
        ServiceLocator.instance = null;
    }
}
