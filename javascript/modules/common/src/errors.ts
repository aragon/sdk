export class TimeoutError extends Error {
  constructor(message?: string) {
    super(message ? message : "Time out");
  }
}
export class UnsupportedProtocolError extends Error {
  constructor(protocol: string) {
    super("Unsupported protocol: " + protocol);
  }
}
