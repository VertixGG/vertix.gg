import { PrismaClient } from "@prisma/client";

import { Debugger } from "@internal/modules/debugger";

import { CacheBase } from "@internal/bases/cache-base";
import { InitializeBase } from "@internal/bases/initialize-base";

import { PrismaInstance } from "@internal/prisma";

export abstract class ModelBaseCached<TCacheResult> extends CacheBase<TCacheResult> {
    protected prisma: PrismaClient;

    protected debugger: Debugger;

    protected constructor( shouldDebugCache: boolean ) {
        super( shouldDebugCache );

        this.prisma = PrismaInstance.getClient();

        this.debugger = new Debugger( this );
    }
}

export abstract class ModelBase extends InitializeBase {
    protected prisma: PrismaClient;

    protected debugger: Debugger;

    protected constructor() {
        super();

        this.prisma = PrismaInstance.getClient();

        this.debugger = new Debugger( this );
    }
}

