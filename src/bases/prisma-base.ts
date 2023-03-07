import { PrismaClient } from "@prisma/client";

import InitializeBase from "@internal/bases/initialize-base";
import PrismaInstance from "@internal/prisma";

export default abstract class PrismaBase extends InitializeBase {
    protected prisma: PrismaClient;

    protected constructor() {
        super();

        this.prisma = PrismaInstance.getClient();
    }
}
