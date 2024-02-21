import type { CapPlugin, ICapacitorSocketConnectionDefinitions } from './definitions';
export type PluginImplementation = unknown;
export type PluginRegistration = () => PluginImplementation;
export type CreatePlugin = <TPlugin>(pluginName: string, options?: {
    web?: PluginRegistration;
}) => TPlugin;
export declare const createPlugin: CreatePlugin;
declare const plugin: ICapacitorSocketConnectionDefinitions & CapPlugin;
export { plugin as NativePlugin };
