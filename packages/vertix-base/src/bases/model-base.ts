import "@vertix.gg/prisma/bot-client";

import { Debugger } from "@vertix.gg/base/src/modules/debugger";

import { CacheBase } from "@vertix.gg/base/src/bases/cache-base";

import { InitializeBase } from "@vertix.gg/base/src/bases/initialize-base";

export type TPossibleClients = PrismaBot.PrismaClient; // | PrismaApiClient;

export abstract class ModelBaseCachedWithClient<
    TPrismaClient extends TPossibleClients,
    TCacheResult
> extends CacheBase<TCacheResult> {
    protected prisma: TPrismaClient;

    protected debugger: Debugger;

    protected constructor( shouldDebugCache = true, shouldDebugModel = true ) {
        super( shouldDebugCache );

        this.prisma = this.getClient();

        this.debugger = new Debugger( this, "", shouldDebugModel );
    }

    protected abstract getClient(): TPrismaClient;
}

export abstract class ModelBaseCachedWithModel<TModel, TCacheResult> extends CacheBase<TCacheResult> {
    protected model: TModel;

    protected debugger: Debugger;

    protected constructor( shouldDebugCache = true, shouldDebugModel = true ) {
        super( shouldDebugCache );

        this.model = this.getModel();

        this.debugger = new Debugger( this, "", shouldDebugModel );
    }

    protected abstract getModel(): TModel;
}

export abstract class ModelBase<TPrismaClient extends TPossibleClients> extends InitializeBase {
    protected prisma: TPrismaClient;

    protected debugger: Debugger;

    protected constructor( shouldDebugModel = true ) {
        super();

        this.prisma = this.getClient();

        this.debugger = new Debugger( this, "", shouldDebugModel );
    }

    protected abstract getClient(): TPrismaClient;
}
