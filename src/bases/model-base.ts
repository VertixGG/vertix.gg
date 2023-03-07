import chalk from "chalk";

import PrismaBase from "@internal/bases/prisma-base";

export default abstract class ModelBase extends PrismaBase {
    protected constructor() {
        super();

        this.logger.addMessagePrefix( chalk.bold( chalk.cyan( "DB" ) ) );
    }
}
