import { ServiceBase } from "@vertix.gg/base/src/modules/service/service-base";

import type { FastifyInstance } from "fastify";

export abstract class RouteBase extends ServiceBase {
    protected abstract registerRoutes( fastify: FastifyInstance ): void;

    public register( fastify: FastifyInstance ): void {
        this.registerRoutes( fastify );

        this.logger.info( this.register, "Routes registered" );
    }
}

export default RouteBase;
