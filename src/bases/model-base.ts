import chalk from "chalk";

import Debugger from "@internal/modules/debugger";

import PrismaBase from "@internal/bases/prisma-base";

export abstract class ModelBase extends PrismaBase {
    protected debugger: Debugger;

    protected constructor() {
        super();

        this.logger.addMessagePrefix( chalk.bold( chalk.cyan( "DB" ) ) );

        this.debugger = new Debugger( this, chalk.bold( chalk.cyan( "DB" ) ) );
    }
}

export default ModelBase;
