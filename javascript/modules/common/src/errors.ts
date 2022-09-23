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
export class GraphQLError extends Error {
  constructor(model: string) {
    super("Cannot fetch the " + model + " data from GraphQL");
  }
}
export class InvalidAddressOrEnsError extends Error {
  constructor() {
    super("Invalid address or ENS");
  }
}
export class InvalidAddressError extends Error {
  constructor() {
    super("Invalid address");
  }
}
export class InvalidProposalIdError extends Error {
  constructor() {
    super("Invalid proposal ID");
  }
}
export class NoProviderError extends Error {
  constructor() {
    super("A web3 provider is needed");
  }
}
export class NoSignerError extends Error {
  constructor() {
    super("A signer is needed");
  }
}
export class UnexpectedActionError extends Error {
  constructor() {
    super("The received action is different from the expected one");
  }
}
