import { PrismaClient } from "@prisma/client";

import PrismaInstance from "@internal/prisma";
import InitializeBase from "@internal/bases/initialize-base";

export default abstract class PrismaBase extends InitializeBase {
    protected prisma: PrismaClient;

    protected constructor() {
        super();

        this.prisma = PrismaInstance.getClient();
    }
}
