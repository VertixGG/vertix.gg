import { EventBus } from "@vertix.gg/base/src/modules/event-bus/event-bus";

export class EventBusMock extends EventBus {
    public static reset() {
        EventBus.instance = null;
    }
}
