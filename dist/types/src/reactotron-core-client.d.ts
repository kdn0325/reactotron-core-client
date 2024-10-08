import WebSocket from "ws";
import type { Command, CommandTypeKey } from "reactotron-core-contract";
import { ClientOptions } from "./client-options";
export type { ClientOptions };
export { assertHasLoggerPlugin } from "./plugins/logger";
export type { LoggerPlugin } from "./plugins/logger";
export { assertHasStateResponsePlugin, hasStateResponsePlugin } from "./plugins/state-responses";
export type { StateResponsePlugin } from "./plugins/state-responses";
export declare enum ArgType {
    String = "string"
}
export interface CustomCommandArg {
    name: string;
    type: ArgType;
}
export interface LifeCycleMethods {
    onCommand?: (command: Command) => void;
    onConnect?: () => void;
    onDisconnect?: () => void;
}
type AnyFunction = (...args: any[]) => any;
export interface Plugin<Client> extends LifeCycleMethods {
    features?: {
        [key: string]: AnyFunction;
    };
    onPlugin?: (client: Client) => void;
}
export type PluginCreator<Client> = (client: Client) => Plugin<Client>;
interface DisplayConfig {
    name: string;
    value?: object | string | number | boolean | null | undefined;
    preview?: string;
    image?: string | {
        uri: string;
    };
    important?: boolean;
}
interface ArgTypeMap {
    [ArgType.String]: string;
}
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
export type CustomCommandArgs<Args extends CustomCommandArg[]> = UnionToIntersection<Args extends Array<infer U> ? U extends CustomCommandArg ? {
    [K in U as U["name"]]: ArgTypeMap[U["type"]];
} : never : never>;
export interface CustomCommand<Args extends CustomCommandArg[] = CustomCommandArg[]> {
    id?: number;
    command: string;
    handler: (args?: CustomCommandArgs<Args>) => void;
    title?: string;
    description?: string;
    args?: Args;
}
type ExtractFeatures<T> = T extends {
    features: infer U;
} ? U : never;
type PluginFeatures<Client, P extends PluginCreator<Client>> = ExtractFeatures<ReturnType<P>>;
export type InferFeaturesFromPlugins<Client, Plugins extends PluginCreator<Client>[]> = UnionToIntersection<PluginFeatures<Client, Plugins[number]>>;
type InferFeaturesFromPlugin<Client, P extends PluginCreator<Client>> = UnionToIntersection<PluginFeatures<Client, P>>;
export interface ReactotronCore {
    options: ClientOptions<this>;
    plugins: Plugin<this>[];
    startTimer: () => () => number;
    close: () => void;
    send: <Type extends CommandTypeKey, Payload extends Command<Type>["payload"]>(type: Type, payload?: Payload, important?: boolean) => void;
    display: (config: DisplayConfig) => void;
    onCustomCommand: <Args extends CustomCommandArg[] = CustomCommand["args"]>(config: CustomCommand<Args>) => () => void | ((config: string, optHandler?: () => void) => () => void);
    /**
     * Set the configuration options.
     */
    configure: (options: ClientOptions<this>) => ClientOptions<this>["plugins"] extends PluginCreator<this>[] ? this & InferFeaturesFromPlugins<this, ClientOptions<this>["plugins"]> : this;
    use: <P extends PluginCreator<this>>(pluginCreator: P) => this & InferFeaturesFromPlugin<this, P>;
    connect: () => this;
}
export type InferFeatures<Client = ReactotronCore, PC extends PluginCreator<Client> = PluginCreator<Client>> = PC extends (client: Client) => {
    features: infer U;
} ? U : never;
export declare const corePlugins: (((reactotron: ReactotronCore) => {
    features: {
        log: (...args: any[]) => void;
        logImportant: (...args: any[]) => void;
        debug: (message: any, important?: any) => void;
        warn: (message: any) => void;
        error: (message: any, stack: any) => void;
    };
}) | ((reactotron: ReactotronCore) => {
    features: {
        image: (payload: import("./plugins/image").ImagePayload) => void;
    };
}) | ((reactotron: ReactotronCore) => {
    features: {
        benchmark: (title: string) => {
            step: (stepTitle: string) => void;
            stop: (stopTitle: string) => void;
            last: (stopTitle: string) => void;
        };
    };
}) | ((reactotron: ReactotronCore) => {
    features: {
        stateActionComplete: (name: string, action: Record<string, any>, important?: any) => void;
        stateValuesResponse: (path: string, value: any, valid?: any) => void;
        stateKeysResponse: (path: string, keys: string[], valid?: boolean) => void;
        stateValuesChange: (changes: {
            path: string;
            value: any;
        }[]) => void;
        stateBackupResponse: (state: Record<string, any>) => void;
    };
}) | ((reactotron: ReactotronCore) => {
    features: {
        apiResponse: (request: {
            status: number;
        }, response: any, duration: number) => void;
    };
}) | ((reactotron: ReactotronCore) => {
    features: {
        clear: () => void;
    };
}) | ((reactotron: ReactotronCore) => {
    onCommand: ({ type, payload }: Command<CommandTypeKey, any>) => void;
    features: {
        repl: (name: string, value: import("./plugins/repl").AcceptableRepls) => void;
    };
}))[];
export type InferPluginsFromCreators<Client, PC extends PluginCreator<Client>[]> = PC extends Array<infer P extends PluginCreator<Client>> ? ReturnType<P>[] : never;
type CorePluginFeatures = InferFeaturesFromPlugins<ReactotronCore, typeof corePlugins>;
export interface Reactotron extends ReactotronCore, CorePluginFeatures {
}
export declare class ReactotronImpl implements ReactotronCore {
    options: ClientOptions<ReactotronCore>;
    /**
     * Are we connected to a server?
     */
    connected: boolean;
    /**
     * The socket we're using.
     */
    socket: WebSocket;
    /**
     * Available plugins.
     */
    plugins: Plugin<this>[];
    /**
     * Messages that need to be sent.
     */
    sendQueue: string[];
    /**
     * Are we ready to start communicating?
     */
    isReady: boolean;
    /**
     * The last time we sent a message.
     */
    lastMessageDate: Date;
    /**
     * The registered custom commands
     */
    customCommands: CustomCommand[];
    /**
     * The current ID for custom commands
     */
    customCommandLatestId: number;
    /**
     * Starts a timer and returns a function you can call to stop it and return the elapsed time.
     */
    startTimer: () => () => number;
    /**
     * Set the configuration options.
     */
    configure(options: ClientOptions<this>): ClientOptions<this>["plugins"] extends PluginCreator<this>[] ? this & InferFeaturesFromPlugins<this, ClientOptions<this>["plugins"]> : this;
    close(): void;
    /**
     * Connect to the Reactotron server.
     */
    connect(): this;
    /**
     * Sends a command to the server
     */
    send: <Type extends CommandTypeKey, Payload extends import("reactotron-core-contract").CommandMap[Type]>(type: Type, payload?: Payload, important?: boolean) => void;
    /**
     * Sends a custom command to the server to displays nicely.
     */
    display(config: DisplayConfig): void;
    /**
     * Client libraries can hijack this to report errors.
     */
    reportError(this: any, error: Error): void;
    /**
     * Adds a plugin to the system
     */
    use(pluginCreator: PluginCreator<this>): this & PluginFeatures<this, typeof pluginCreator>;
    onCustomCommand(config: CustomCommand | string, optHandler?: () => void): () => void;
}
export declare function createClient<Client extends ReactotronCore = ReactotronCore>(options?: ClientOptions<Client>): Client;
