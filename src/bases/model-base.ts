import PrismaBase from "@internal/bases/prisma-base";
import chalk from "chalk";

export default class ModelBase extends PrismaBase {
    constructor() {
        super();

        this.logger.addMessagePrefix( chalk.bold( chalk.cyan( "DB" ) ) );
    }
}
