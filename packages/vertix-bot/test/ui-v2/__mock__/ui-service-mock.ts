import UIService from "@vertix.gg/bot/src/ui-v2/ui-service";

export class UIServiceMock extends UIService {
    public isSaveHashEnabled(): boolean {
        return false;
    }
}
