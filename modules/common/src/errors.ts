class SdkError extends Error {
  public cause?: Error | string;
  constructor(message: string, cause?: any) {
    super(message);
    if (typeof cause === "string") {
      this.cause = cause;
    } else if (cause instanceof Error) {
      this.cause = cause.message;
    }
  }
}

export class TimeoutError extends SdkError {
  constructor(message?: string, cause?: any) {
    super(message ? message : "Time out", cause);
  }
}
export class UnsupportedProtocolError extends SdkError {
  constructor(protocol: string, cause?: any) {
    super("Unsupported protocol: " + protocol, cause);
  }
}
export class GraphQLError extends SdkError {
  constructor(model: string, cause?: any) {
    super("Cannot fetch the " + model + " data from GraphQL", cause);
  }
}
export class IpfsError extends SdkError {
  constructor(cause?: any) {
    super("Cannot add or get data from ipfs", cause);
  }
}
export class InvalidAddressOrEnsError extends SdkError {
  constructor(cause?: any) {
    super("Invalid address or ENS", cause);
  }
}
export class InvalidAddressError extends SdkError {
  constructor(cause?: any) {
    super("Invalid address", cause);
  }
}
export class InvalidCidError extends SdkError {
  constructor(cause?: any) {
    super("The value does not contain a valid CiD", cause);
  }
}
export class InvalidProposalIdError extends SdkError {
  constructor(cause?: any) {
    super("Invalid proposal ID", cause);
  }
}
export class NoProviderError extends SdkError {
  constructor(cause?: any) {
    super("A web3 provider is needed", cause);
  }
}
export class NoSignerError extends SdkError {
  constructor(cause?: any) {
    super("A signer is needed", cause);
  }
}
export class UnexpectedActionError extends SdkError {
  constructor(cause?: any) {
    super("The received action is different from the expected one", cause);
  }
}

export class NoTokenAddress extends SdkError {
  constructor(cause?: any) {
    super("A token address is needed", cause);
  }
}

export class NoDaoFactory extends SdkError {
  constructor(cause?: any) {
    super("A dao factory address is needed", cause);
  }
}

export class NoPluginRepoRegistry extends SdkError {
  constructor(cause?: any) {
    super("A plugin repo registry address is needed", cause);
  }
}

export class NoDaoRegistry extends SdkError {
  constructor(cause?: any) {
    super("A dao registry address is needed", cause);
  }
}

export class IpfsPinError extends SdkError {
  constructor(cause?: any) {
    super("Failed to pin data on IPFS", cause);
  }
}

export class ProposalCreationError extends SdkError {
  constructor(cause?: any) {
    super("Failed to create proposal", cause);
  }
}

export class MissingExecPermissionError extends SdkError {
  constructor(cause?: any) {
    super("No plugin requests EXECUTE_PERMISSION", cause);
  }
}
export class IpfsFetchError extends SdkError {
  constructor(cause?: any) {
    super("Failed to fetch data from IPFS", cause);
  }
}
export class InvalidVotingModeError extends SdkError {
  constructor(cause?: any) {
    super("Invalid voting mode", cause);
  }
}
export class UpdateAllowanceError extends SdkError {
  constructor(cause?: any) {
    super("Could not define a minimum allowance", cause);
  }
}
export class InvalidPrecisionError extends SdkError {
  constructor(cause?: any) {
    super("Invalid precision, number must be an integer greater than 0", cause);
  }
}
export class FailedDepositError extends SdkError {
  constructor(cause?: any) {
    super("Failed to deposit", cause);
  }
}
export class AmountMismatchError extends SdkError {
  constructor(expected: bigint, received: bigint, cause?: any) {
    super(
      `Deposited amount mismatch. Expected: ${expected}, received: ${received}`,
      cause,
    );
  }
}
export class UnsupportedNetworkError extends SdkError {
  constructor(network: string, cause?: any) {
    super("Unsupported network: " + network, cause);
  }
}
export class ClientNotInitializedError extends SdkError {
  constructor(client: string, cause?: any) {
    super(client + " client is not initialized", cause);
  }
}
export class NoNodesAvailableError extends SdkError {
  constructor(name: string, cause?: any) {
    super("No " + name + " nodes available", cause);
  }
}

export class PluginInstallationPreparationError extends SdkError {
  constructor(cause?: any) {
    super("Failed to install plugin", cause);
  }
}
export class DataDecodingError extends SdkError {
  constructor(message: string, cause?: any) {
    super("Cannot decode data: " + message, cause);
  }
}

export class InvalidContractAddressError extends SdkError {
  constructor(cause?: any) {
    super("Invalid contract address", cause);
  }
}
export class InvalidContractAbiError extends SdkError {
  constructor(cause?: any) {
    super("Invalid contract ABI", cause);
  }
}
export class CannotEstimateGasError extends SdkError {
  constructor(cause?: any) {
    super("Cannot estimate gas error", cause);
  }
}
export class InstallationNotFoundError extends SdkError {
  constructor(cause?: any) {
    super("Installation not found", cause);
  }
}
export class PluginUninstallationPreparationError extends SdkError {
  constructor(cause?: any) {
    super("plugin uninstallation error", cause);
  }
}

export class MissingMetadataError extends SdkError {
  constructor(cause?: any) {
    super("Missing metadata", cause);
  }
}

export class InvalidPrepareUninstallationAbiError extends SdkError {
  constructor(cause?: Error) {
    super("Invalid prepare uninstallation ABI", cause);
  }
}
