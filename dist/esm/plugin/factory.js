import { registerPlugin } from '@capacitor/core';
const pluginName = 'CapacitorSocketConnectionPlugin';
export const createPlugin = (pluginName, options) => {
    return registerPlugin(pluginName, { web: options === null || options === void 0 ? void 0 : options.web });
};
const plugin = createPlugin(pluginName);
export { plugin as NativePlugin };
//# sourceMappingURL=factory.js.map