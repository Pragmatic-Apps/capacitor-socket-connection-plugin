import { LoggerFactory, LoggerObserver, } from '@spryrocks/logger-plugin';
const _loggerObserver = new LoggerObserver();
const loggerObserver = _loggerObserver;
const pluginName = 'SocketConnectionPlugin';
const prepareLogData = ({ data }) => (Object.assign(Object.assign({}, data), { plugin: pluginName, action: undefined }));
const factory = new LoggerFactory({
    notifier: _loggerObserver,
    prepareLogData,
    globalData: undefined,
});
const createLogger = (tag) => factory.createLogger(tag);
export { loggerObserver as LoggerObserver, createLogger };
//# sourceMappingURL=logger.js.map