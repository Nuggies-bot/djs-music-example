export = ExtendedClient;
declare class ExtendedClient extends Client<boolean> {
    constructor(...options: any[]);
    commands: Map<String, Object>;
    events: Map<String, Function>;
    queue: Map<String, Object>;
    utils: {};
    setup(token?: string): ExtendedClient;
    loadHandlers(): ExtendedClient;
}
import { Client } from "discord.js";
