import { jest } from "@jest/globals";
import { EventBus } from "@vertix.gg/base/src/modules/event-bus/event-bus";

export class EventBusMock extends EventBus {
    public static reset() {
        EventBus.instance = null;
    }

    public static get $() {
        if ( ! this.instance ) {
            this.instance = new this();
        }

        return this.instance;
    }

    public static mockOrigin() {
        jest.spyOn( EventBusMock, "$", "get" ).mockImplementation( () => this.$ );
    }
}
