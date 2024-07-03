import Mocker from "ts-mockito";

import UIAdapterService from "@vertix.gg/gui/src/ui-adapter-service";

import type { Client } from "discord.js";

export class UIAdapterServiceMock extends UIAdapterService {
    public constructor() {
        super( Mocker.mock<Client<true>>() );
    }

    protected static setupCleanupTimerInterval(): void {
        // Do nothing.
    }

    public isSaveHashEnabled(): boolean {
        return false;
    }
}
