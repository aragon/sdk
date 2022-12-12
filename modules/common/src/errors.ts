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
export class InvalidCidError extends Error {
  constructor() {
    super("The value does not contain a valid CiD");
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

export class NoTokenAddress extends Error {
  constructor() {
    super("A token address is needed");
  }
}

export class NoDaoFactory extends Error {
  constructor() {
    super("A dao factory address is needed");
  }
}

export class NoPluginRepoRegistry extends Error {
  constructor() {
    super("A plugin repo registry address is needed");
  }
}

export class NoDaoRegistry extends Error {
  constructor() {
    super("A dao registry address is needed");
  }
}

export class IpfsPinError extends Error {
  constructor() {
    super("Failed to pin data on IPFS");
  }
}

export class ProposalCreationError extends Error {
  constructor() {
    super("Failed to create proposal");
  }
}

export class MissingExecPermissionError extends Error {
  constructor() {
    super("No plugin requests EXECUTE_PERMISSION");
  }
}
export class IpfsFetchError extends Error {
  constructor() {
    super("Failed to fetch data from IPFS");
  }
}
export class InvalidPermissionError extends Error {
  constructor() {
    super("The specified permission does not exist");
  }
}

export class InvalidDataError extends Error {
  constructor() {
    super("Invalid type, an Uint8Array was expected");
  }
}

export class InvalidBigintError extends Error {
  constructor() {
    super("Invalid type, BigInt was expected");
  }
}
export class InvalidVotingModeError extends Error {
  constructor() {
    super("Invalid voting mode");
  }
}
export class EnsureAllowanceError extends Error {
  constructor() {
    super("Could not define a minimum allowance");
  }
}
export class InvalidPrecisionError extends Error {
  constructor() {
    super("Invalid precision, number must be an integer greater than 0");
  }
}

export class InvalidDateError extends Error {
  constructor() {
    super("Invalid type, Date was expected");
  }
}
export class InvalidBigNumberishError extends Error {
  constructor() {
    super("Invalid type, BigNumberish was expected");
  }
}

export class InvalidVoteValueError extends Error {
  constructor() {
    super("Invalid vote value");
  }
}

export class InvalidIpfsUriError extends Error {
  constructor() {
    super("Invalid ipfs uri");
  }
}
