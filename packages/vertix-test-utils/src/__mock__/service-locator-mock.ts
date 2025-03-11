import { jest } from "@jest/globals";
import { ServiceLocator } from "@vertix.gg/base/src/modules/service/service-locator";

export class ServiceLocatorMock extends ServiceLocator {
    public static getName() {
        return "ServiceLocatorMock";
    }

    public static reset() {
        this.instance = null;
    }

    public static get $() {
        if ( !this.instance ) {
            this.instance = new this();
        }

        return this.instance;
    }

    public static mockOrigin() {
        jest.spyOn( ServiceLocator, "$", "get" ).mockImplementation( () => this.$ );
    }
}
