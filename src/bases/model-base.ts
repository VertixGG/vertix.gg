import PrismaBase from "@internal/bases/prisma-base";
import chalk from "chalk";

export default abstract class ModelBase extends PrismaBase {
    protected constructor() {
        super();

        this.logger.addMessagePrefix( chalk.bold( chalk.cyan( "DB" ) ) );
    }
}
