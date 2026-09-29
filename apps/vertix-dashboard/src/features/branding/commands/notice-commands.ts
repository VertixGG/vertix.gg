import { CommandBase } from "@zenflux/react-commander/command-base";

import type { BrandingState } from "@vertix.gg/dashboard/src/features/branding/commands/base";

export class ClearErrorCommand extends CommandBase<BrandingState> {
    public static getName(): string {
        return "Dashboard/Branding/ClearError";
    }

    public apply() {
        return this.setState( { error: null, reasons: [] } );
    }
}

export class DismissReportCommand extends CommandBase<BrandingState> {
    public static getName(): string {
        return "Dashboard/Branding/DismissReport";
    }

    public apply() {
        return this.setState( { report: null } );
    }
}
