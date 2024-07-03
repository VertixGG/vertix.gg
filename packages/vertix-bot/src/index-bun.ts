import process from "process";

import { entryPoint } from "@vertix.gg/bot/src/entrypoint";

Error.stackTraceLimit = Infinity;

console.log(process.env);

await entryPoint();
