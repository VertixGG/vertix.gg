import { ObjectBase } from "@vertix.gg/base/src/bases";
import { EventBus } from "@vertix.gg/base/src/modules/event-bus/event-bus";

export class MockObject extends ObjectBase {
    public static getName () {
        return "MockObject";
    }

    public constructor () {
        super();
    }

    public mockMethod () {
    }
}

export class MockEventBus extends EventBus {
    public static getName () {
        return "MockEventBus";
    }

    public static reset () {
        EventBus.instance = null;
    }
}
