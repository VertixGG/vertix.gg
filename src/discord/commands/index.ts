import { ICommand } from "../interfaces/command";

import { Hello } from "./hello";
import { HelloEmbed } from "./hello-embed";

export const Commands: ICommand[] = [
    Hello,
    HelloEmbed,
];
