import Mocker from "ts-mockito";

import { UIService } from "@vertix.gg/gui/src/ui-service";

import type { Client } from "discord.js";

export class UIServiceMock extends UIService {
    public constructor() {
        super(Mocker.mock<Client<true>>());
    }

    protected static setupCleanupTimerInterval(): void {
        // Do nothing.
    }
}
