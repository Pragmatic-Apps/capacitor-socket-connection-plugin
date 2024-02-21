'use strict';

var core = require('@capacitor/core');
var loggerPlugin = require('@spryrocks/logger-plugin');

var PluginEvents;
(function (PluginEvents) {
    PluginEvents["OnData"] = "OnData";
    PluginEvents["OnClose"] = "OnClose";
    PluginEvents["OnError"] = "OnError";
})(PluginEvents || (PluginEvents = {}));

const pluginName$1 = 'CapacitorSocketConnectionPlugin';
const createPlugin = (pluginName, options) => {
    return core.registerPlugin(pluginName, { web: options === null || options === void 0 ? void 0 : options.web });
};
const plugin = createPlugin(pluginName$1);

const _loggerObserver = new loggerPlugin.LoggerObserver();
const loggerObserver = _loggerObserver;
const pluginName = 'SocketConnectionPlugin';
const prepareLogData = ({ data }) => (Object.assign(Object.assign({}, data), { plugin: pluginName, action: undefined }));
const factory = new loggerPlugin.LoggerFactory({
    notifier: _loggerObserver,
    prepareLogData,
    globalData: undefined,
});
const createLogger = (tag) => factory.createLogger(tag);

class SocketConnectionError extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

class Socket {
    // eslint-disable-next-line @typescript-eslint/no-useless-constructor,@typescript-eslint/no-empty-function
    constructor(_options) {
        this.logger = createLogger();
        this._state = 'initial';
        this.setupListeners();
    }
    //region Actions
    async open(host, port) {
        this.logger.debug('Open connection', { host, port });
        this.checkStateOrThrow('initial', `You can call "open" method only once`);
        this.onOpeningInternal();
        let close;
        try {
            const { link } = await this.wrapCall(plugin.openConnection({ host, port }));
            close = this.checkState('closing');
            this.onOpenedInternal(link);
        }
        catch (error) {
            this.onErrorInternal(error);
            throw error;
        }
        if (close) {
            this.closeInternal().catch();
        }
    }
    async write(data) {
        this.checkStateOrThrow('opened', `Not supported state: ${this.state}`);
        return this.wrapCall(plugin.sendData({ link: this.getLinkOrThrow(), data: Array.from(data) }));
    }
    async close() {
        if (this.checkState('initial')) {
            this.logger.debug('Connection closed from initial state');
            this.onClosedInternal();
            return;
        }
        if (this.checkState('opening')) {
            this.logger.debug('Connection closing from opening state');
            this.onClosingInternal();
            return;
        }
        await this.closeInternal();
    }
    //endregion
    //region Events
    onDataEventReceived(event) {
        if (!this.checkEventUuid(event))
            return;
        this.onDataInternal(event.data);
    }
    onCloseEventReceived(event) {
        if (!this.checkEventUuid(event))
            return;
        this.logger.info('onClose event received', { event });
        this.onClosedInternal();
    }
    onErrorEventReceived(event) {
        if (!this.checkEventUuid(event))
            return;
        this.logger.info('onError event received', { event });
        this.onErrorInternal(this.createErrorFromObject(event.error));
    }
    //endregion
    //region State & Helpers
    get state() {
        return this._state;
    }
    set state(newState) {
        const oldState = this._state;
        this.logger.info(`Set state: "${newState}"`, { oldState });
        this._state = newState;
    }
    getLink() {
        return this._link;
    }
    getLinkOrThrow() {
        if (!this._link)
            throw new SocketConnectionError('PluginLink is undefined');
        return this._link;
    }
    setLink(link) {
        this._link = link;
        this.logger.updateParams({ link: link.uuid });
    }
    checkState(...states) {
        return states.includes(this.state);
    }
    checkEventUuid(event) {
        var _a;
        return event.socketUuid === ((_a = this.getLink()) === null || _a === void 0 ? void 0 : _a.uuid);
    }
    checkStateOrThrow(state, errorMessage) {
        if (!this.checkState(state)) {
            this.logger.error(undefined, errorMessage, { level: loggerPlugin.ErrorLevel.Low });
            throw new SocketConnectionError(errorMessage);
        }
    }
    //endregion
    //region Internal
    onOpeningInternal() {
        this.state = 'opening';
    }
    onOpenedInternal(link) {
        this.setLink(link);
        this.state = 'opened';
        this.logger.info('Connection opened');
    }
    onDataInternal(bytes) {
        if (!this.checkState('opened'))
            return;
        const data = new Uint8Array(bytes);
        if (this.onData)
            this.onData(data);
    }
    onErrorInternal(error) {
        if (this.checkState('error'))
            return;
        if (this.checkState('closed'))
            return;
        if (this.checkState('closing')) {
            this.onClosedInternal();
            return;
        }
        this.logger.error(error, undefined, { level: loggerPlugin.ErrorLevel.Medium });
        this.state = 'error';
        if (this.onError)
            this.onError(error);
    }
    onClosingInternal() {
        this.state = 'closing';
    }
    onClosedInternal() {
        if (this.checkState('closed'))
            return;
        if (this.checkState('error'))
            return;
        this.state = 'closed';
        if (this.onClose)
            this.onClose();
    }
    async closeInternal() {
        if (this.checkState('opened')) {
            this.logger.debug('Close connection');
            this.onClosingInternal();
            await this.wrapCall(plugin.closeConnection({ link: this.getLinkOrThrow() }));
            this.onClosedInternal();
            this.logger.info('Connection closed');
            return;
        }
        this.logger.info(`Cannot close connection from state "${this.state}"`);
    }
    setupListeners() {
        plugin.addListener(PluginEvents.OnData, (data) => {
            this.onDataEventReceived(data);
        });
        plugin.addListener(PluginEvents.OnClose, (data) => {
            this.onCloseEventReceived(data);
        });
        plugin.addListener(PluginEvents.OnError, (data) => {
            this.onErrorEventReceived(data);
        });
    }
    //endregion
    createErrorFromObject(error) {
        return new SocketConnectionError(error.message);
    }
    processErrorCode(code) {
        try {
            const errorObject = JSON.parse(code);
            return this.createErrorFromObject(errorObject);
        }
        catch (_a) {
            return undefined;
        }
    }
    processError(error) {
        var _a;
        if (error.code) {
            const processedError = this.processErrorCode(error.code);
            if (processedError)
                return processedError;
        }
        return new SocketConnectionError((_a = error.errorMessage) !== null && _a !== void 0 ? _a : 'Unknown error');
    }
    wrapCall(promise) {
        return promise.catch((error) => {
            throw this.processError(error);
        });
    }
}

exports.LoggerObserver = loggerObserver;
exports.Socket = Socket;
exports.SocketConnectionError = SocketConnectionError;
//# sourceMappingURL=plugin.cjs.js.map
