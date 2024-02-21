import { ILoggerObserver } from '@spryrocks/logger-plugin';
declare const loggerObserver: ILoggerObserver;
declare const createLogger: (tag?: string) => import("@spryrocks/logger").ILogger;
export { loggerObserver as LoggerObserver, createLogger };
