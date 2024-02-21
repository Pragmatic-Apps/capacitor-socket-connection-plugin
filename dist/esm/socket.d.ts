import { OnSocketClose, OnSocketData, OnSocketError, SocketData, SocketOptions } from './types';
export interface ISocket {
    onData: OnSocketData | undefined;
    onClose: OnSocketClose | undefined;
    onError: OnSocketError | undefined;
    open(host: string, port: number): Promise<void>;
    write(data: SocketData): Promise<void>;
    close(): Promise<void>;
}
export declare class Socket implements ISocket {
    private readonly logger;
    onData: OnSocketData | undefined;
    onClose: OnSocketClose | undefined;
    onError: OnSocketError | undefined;
    private _state;
    private _link;
    constructor(_options?: SocketOptions);
    open(host: string, port: number): Promise<void>;
    write(data: SocketData): Promise<void>;
    close(): Promise<void>;
    private onDataEventReceived;
    private onCloseEventReceived;
    private onErrorEventReceived;
    private get state();
    private set state(value);
    private getLink;
    private getLinkOrThrow;
    private setLink;
    private checkState;
    private checkEventUuid;
    private checkStateOrThrow;
    private onOpeningInternal;
    private onOpenedInternal;
    private onDataInternal;
    private onErrorInternal;
    private onClosingInternal;
    private onClosedInternal;
    private closeInternal;
    private setupListeners;
    private createErrorFromObject;
    private processErrorCode;
    private processError;
    private wrapCall;
}
