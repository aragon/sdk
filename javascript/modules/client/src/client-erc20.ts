import {
  Erc20Proposal,
  IClientErc20,
  ICreateProposalParams,
  IErc20FactoryParams,
  IWithdrawParams,
  ProposalCreationSteps,
  ProposalCreationStepValue,
  VoteOptions,
  // VotingConfig,
} from "./internal/interfaces/plugins";
import { DAO__factory, IDAO } from "@aragon/core-contracts-ethers";
import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero } from "@ethersproject/constants";
import { ClientCore } from "./internal/core";
import {
  DaoAction,
  // DaoConfig,
  FactoryInitParams,
  ProposalStatus,
} from "./internal/interfaces/common";
import { ContextErc20 } from "./context-erc20";
import { strip0x } from "@aragon/sdk-common";

/**
 * Provider a generic client with high level methods to manage and interact with DAO's
 */
export class ClientErc20 extends ClientCore implements IClientErc20 {
  // @ts-ignore TODO: Remove
  private _pluginAddress: string;

  constructor(context: ContextErc20) {
    super(context);

    if (!context.pluginAddress) {
      throw new Error("An address for the plugin is required");
    }
    this._pluginAddress = context.pluginAddress;
  }

  //// HIGH LEVEL HANDLERS

  /** Contains all the generic high level methods to interact with a DAO */
  methods = {
    createProposal: (params: ICreateProposalParams) =>
      this._createProposal(params),
    voteProposal: (proposalId: string, vote: VoteOptions) =>
      this._voteProposal(proposalId, vote),
    executeProposal: (proposalId: string) => this._executeProposal(proposalId),
    // setDaoConfig: (address: string, config: DaoConfig) =>
    //   this._setDaoConfig(address, config),
    // setVotingConfig: (address: string, config: VotingConfig) =>
    //   this._setVotingConfig(address, config),
    /** Retrieves the list of Ethereum addresses that can cast weighted votes on the given DAO's proposals */
    getMembers: (daoAddressOrEns: string) => this._getMembers(daoAddressOrEns),
    /** Retrieves the list of proposals of the given DAO */
    getProposals: (daoAddressOrEns: string) =>
      this._getProposals(daoAddressOrEns),
  };

  //// ACTION BUILDERS

  /** Contains the helpers to encode actions and parameters that can be passed as a serialized buffer on-chain */
  encoding = {
    /** Computes the parameters to be given when creating the DAO, as the initialization for the plugin */
    init: (params: IErc20FactoryParams) => this._buildActionInit(params),
    /** Computes the action payload to pass upon proposal creation */
    withdrawAction: (params: IWithdrawParams) =>
      this._buildActionWithdraw(params),
  };

  //// ESTIMATION HANDLERS

  /** Contains the gas estimation of the Ethereum transactions */
  estimation = {
    createProposal: (params: ICreateProposalParams) =>
      this._estimateCreateProposal(params),
    voteProposal: (proposalId: string, vote: VoteOptions) =>
      this._estimateVoteProposal(proposalId, vote),
    executeProposal: (proposalId: string) =>
      this._estimateExecuteProposal(proposalId),
    // setDaoConfig: (daoAddress: string, config: DaoConfig) =>
    //   this._estimateSetDaoConfig(daoAddress, config),
    // setVotingConfig: (daoAddress: string, config: VotingConfig) =>
    //   this._estimateSetVotingConfig(daoAddress, config),
  };

  //// PRIVATE METHOD IMPLEMENTATIONS

  private async *_createProposal(
    _params: ICreateProposalParams,
  ): AsyncGenerator<ProposalCreationStepValue> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (!signer.provider) {
      throw new Error("A web3 provider is needed");
    }

    // TODO: Remove below as the new contracts are ready

    yield {
      key: ProposalCreationSteps.CREATING,
      txHash:
        "0x0123456789012345678901234567890123456789012345678901234567890123",
    };

    yield {
      key: ProposalCreationSteps.DONE,
      proposalId:
        "0x1234567890123456789012345678901234567890123456789012345678901234",
    };

    // TODO: Uncomment as the new contracts are ready

    /*
    const erc20VotingInstance = ERC20Voting__factory.connect(
      this._pluginAddress,
      signer
    );

    const tx = await erc20VotingInstance.newVote(
      ...unwrapProposalParams(params)
    );

    yield { key: ProposalCreationSteps.CREATING, txHash: tx.hash };

    const receipt = await tx.wait();
    const startVoteEvent = receipt.events?.find(e => e.event === "StartVote");
    if (!startVoteEvent || startVoteEvent.args?.voteId) {
      return Promise.reject(new Error("Could not read the proposal ID"));
    }

    yield {
      key: ProposalCreationSteps.DONE,
      proposalId: startVoteEvent.args?.voteId,
    };
    */
  }

  // @ts-ignore  TODO: Remove this comment when implemented
  private _voteProposal(proposalId: string, vote: VoteOptions) {
    // TODO: Unimplemented
    return Promise.reject(new Error("Unimplemented"));
  }
  // @ts-ignore  TODO: Remove this comment when implemented
  private _executeProposal(proposalId: string) {
    // TODO: Unimplemented
    return Promise.reject(new Error("Unimplemented"));
  }
  // private _setDaoConfig(daoAddress: string, config: DaoConfig) {
  //   return Promise.reject(new Error("Unimplemented"));
  // }
  // private _setVotingConfig(daoAddress: string, config: VotingConfig) {
  //   return Promise.reject(new Error("Unimplemented"));
  // }

  //// PRIVATE ACTION BUILDER HANDLERS

  // @ts-ignore  TODO: Remove this comment when implemented
  private _buildActionInit(params: IErc20FactoryParams): FactoryInitParams {
    // TODO: Unimplemented
    throw new Error("Unimplemented");
  }

  private _buildActionWithdraw(params: IWithdrawParams): DaoAction {
    const data = encodeWithdrawActionData(params);

    // TODO: CONFIRM THAT THE "to" field needs to contain the DAO address
    return { to: AddressZero, value: BigInt(0), data };
  }

  //// PRIVATE METHOD GAS ESTIMATIONS

  private _estimateCreateProposal(_params: ICreateProposalParams) {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (!signer.provider) {
      throw new Error("A web3 provider is needed");
    }

    // TODO: Remove below as the new contracts are ready

    return Promise.resolve(this.web3.getApproximateGasFee(BigInt(1234)));

    // TODO: Uncomment below as the new contracts are ready
    /*
    const erc20VotingInstance = ERC20Voting__factory.connect(
      this._pluginAddress,
      signer
    );

    return erc20VotingInstance.estimateGas.newVote(
      ...unwrapProposalParams(params),
    ).then((gasLimit) => {
      return this.web3.getApproximateGasFee(gasLimit.toBigInt());
    });
    */
  }

  // @ts-ignore  TODO: Remove this comment when implemented
  private _estimateVoteProposal(proposalId: string, vote: VoteOptions) {
    // TODO: Unimplemented
    return Promise.resolve({ average: BigInt(0), max: BigInt(0) });
  }
  // @ts-ignore  TODO: Remove this comment when implemented
  private _estimateExecuteProposal(proposalId: string) {
    // TODO: Unimplemented
    return Promise.resolve({ average: BigInt(0), max: BigInt(0) });
  }
  // private _estimateSetDaoConfig(daoAddress: string, config: DaoConfig) {
  //   return Promise.resolve({ average: BigInt(0), max: BigInt(0) });
  // }
  // private _estimateSetVotingConfig(daoAddress: string, config: VotingConfig) {
  //   return Promise.resolve({ average: BigInt(0), max: BigInt(0) });
  // }

  //// PRIVATE RETRIEVAL HANDLERS
  private _getMembers(daoAddressOrEns: string) {
    if (!daoAddressOrEns) {
      throw new Error("Invalid DAO address or ENS");
    }

    const mockAddresses = [
      "0x8367dc645e31321CeF3EeD91a10a5b7077e21f70",
      "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
      "0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8",
      "0x2dB75d8404144CD5918815A44B8ac3f4DB2a7FAf",
      "0xc1d60f584879f024299DA0F19Cdb47B931E35b53",
    ];

    return new Promise(resolve => setTimeout(resolve, 1000)).then(() =>
      mockAddresses.filter(() => Math.random() > 0.4)
    );
  }

  // TODO: get method ready for filtering, ordering and limiting
  private _getProposals(daoAddressOrEns: string) {
    if (!daoAddressOrEns) {
      throw new Error("Invalid DAO address or ENS");
    }

    return new Promise(resolve => setTimeout(resolve, 1000)).then(() =>
      getProposalsWithStatus(MOCK_PROPOSALS)
    );
  }
}

//// PARAMETER MANAGERS

// @ts-ignore TODO: Remove when contracts are available
function unwrapProposalParams(
  params: ICreateProposalParams
): [string, IDAO.ActionStruct[], number, number, boolean, number] {
  return [
    params.metadataUri,
    params.actions ?? [],
    // TODO: Verify => seconds?
    params.startDate ? Math.floor(params.startDate.getTime() / 1000) : 0,
    // TODO: Verify => seconds?
    params.endDate ? Math.floor(params.endDate.getTime() / 1000) : 0,
    params.executeIfPassed ?? false,
    params.creatorVote ?? VoteOptions.NONE,
  ];
}

function encodeWithdrawActionData(params: IWithdrawParams): Uint8Array {
  const daoInterface = DAO__factory.createInterface();
  const args = unwrapWithdrawParams(params);

  const hexBytes = daoInterface.encodeFunctionData("withdraw", args);

  // TODO: ENCODE HEX => UINT8Array in a BROWSER FRIENDLY way
  return new Uint8Array(Buffer.from(strip0x(hexBytes), "hex"));
}

function unwrapWithdrawParams(
  params: IWithdrawParams
): [string, string, BigNumber, string] {
  return [
    params.tokenAddress ?? AddressZero,
    params.recipientAddress,
    BigNumber.from(params.amount),
    params.reference ?? "",
  ];
}

/// HELPER FUNCTIONS TODO: move to utils?
function getProposalsWithStatus(proposals: Erc20Proposal[]) {
  const now = new Date();

  return proposals.map(proposal => {
    if (proposal.startDate >= now) {
      return { ...proposal, status: ProposalStatus.PENDING };
    } else if (proposal.endDate >= now) {
      return { ...proposal, status: ProposalStatus.ACTIVE };
    } else if (proposal.executed) {
      return { ...proposal, status: ProposalStatus.EXECUTED };
    } else if (
      proposal.result.yea &&
      proposal.result.nay &&
      proposal.result.yea > proposal.result.nay
    ) {
      return { ...proposal, status: ProposalStatus.SUCCEEDED };
    } else {
      return { ...proposal, status: ProposalStatus.DEFEATED };
    }
  });
}

/// MOCK DATA FOR PROPOSALS
const dateWithinThisYear = new Date(
  new Date().setFullYear(new Date().getFullYear() - 1)
).getTime();

const startDate = new Date(
  dateWithinThisYear + Math.random() * (Date.now() - dateWithinThisYear)
);

const MOCK_PROPOSALS: Erc20Proposal[] = [
  {
    id: "0x56fb7bd9491ff76f2eda54724c84c8b87a5a5fd7_0x0",
    daoAddress: "0x56fb7bd9491ff76f2eda54724c84c8b87a5a5fd7",
    daoName: "DAO 1",
    creator: "0x8367dc645e31321CeF3EeD91a10a5b7077e21f70",

    startDate,
    endDate: new Date(startDate.getTime() + 7200000),
    createdAt: new Date(dateWithinThisYear),

    title: "New Founding for Lorex Lab SubDao",
    summary:
      "As most community members know, Aragon has strived to deploy its products to more cost-efficient blockchain networks to facilitate interaction.",
    proposal: "This is the super important proposal body",
    resources: [{ url: "https://example.com", description: "Example" }],

    voteId: "0",
    token: {
      address: "0x9df6870250396e10d187b188b8bd9179ba1a9c18",
      name: "DAO Token",
      symbol: "DAO",
      decimals: 18,
    },

    result: {
      yea: 3,
      nay: 1,
      abstain: 2,
    },

    open: false,
    executed: false,
    status: ProposalStatus.PENDING,

    config: {
      participationRequiredPct: 30,
      supportRequiredPct: 52,
    },

    votingPower: 135,

    voters: [
      {
        address: "0x8367dc645e31321CeF3EeD91a10a5b7077e21f70",
        voteValue: VoteOptions.YEA,
        weight: 1,
      },
      {
        address: "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
        voteValue: VoteOptions.YEA,
        weight: 1,
      },
      {
        address: "0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8",
        voteValue: VoteOptions.NAY,
        weight: 1,
      },
      {
        address: "0x2dB75d8404144CD5918815A44B8ac3f4DB2a7FAf",
        voteValue: VoteOptions.ABSTAIN,
        weight: 1,
      },
      {
        address: "0xc1d60f584879f024299DA0F19Cdb47B931E35b53",
        voteValue: VoteOptions.YEA,
        weight: 1,
      },
      {
        address: "0xc8541aae19c5069482239735ad64fac3dcc52ca2",
        voteValue: VoteOptions.ABSTAIN,
        weight: 1,
      },
    ],
  },
];
