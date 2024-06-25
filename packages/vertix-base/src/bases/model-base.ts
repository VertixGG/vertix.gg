import  "@vertix.gg/prisma/bot-client";

import { Debugger } from "@vertix.gg/base/src/modules/debugger";

import { CacheBase } from "@vertix.gg/base/src/bases/cache-base";

import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

type PossibleClients = PrismaBot.PrismaClient;// | PrismaApiClient;

export abstract class ModelBaseCached<TPrismaClient extends PossibleClients, TCacheResult> extends CacheBase<TCacheResult> {
    protected prisma: TPrismaClient;

    protected debugger: Debugger;

    protected constructor( shouldDebugCache = true, shouldDebugModel = true ) {
        super( shouldDebugCache );

        this.prisma = this.getClient();

        this.debugger = new Debugger( this, "", shouldDebugModel );
    }

    protected abstract getClient(): TPrismaClient;
}

export abstract class ModelBase<TPrismaClient extends PossibleClients> extends InitializeBase {
    protected prisma: TPrismaClient;

    protected debugger: Debugger;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected constructor( shouldDebugCache = true, shouldDebugModel = true ) {
        super();

        this.prisma = this.getClient();

        this.debugger = new Debugger( this, "", shouldDebugModel );
    }

    protected abstract getClient(): TPrismaClient;
}

