import { Wechaty } from './wechaty';
export declare type WechatyPluginUninstaller = () => void;
export declare type WechatyPluginReturn = void | WechatyPluginUninstaller;
export interface WechatyPlugin {
    (bot: Wechaty): WechatyPluginReturn;
}
declare function isWechatyPluginUninstaller(pluginReturn: WechatyPluginReturn): pluginReturn is WechatyPluginUninstaller;
export { isWechatyPluginUninstaller, };
//# sourceMappingURL=plugin.d.ts.map