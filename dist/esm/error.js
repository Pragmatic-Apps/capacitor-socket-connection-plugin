export class SocketConnectionError extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
//# sourceMappingURL=error.js.map