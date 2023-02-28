import { PrismaClient } from "@prisma/client";

import PrismaInstance from "@internal/prisma";
import InitializeBase from "@internal/bases/initialize-base";

export default class PrismaBase extends InitializeBase {
    protected prisma: PrismaClient;

    constructor() {
        super();

        this.prisma = PrismaInstance.getClient();
    }
}
