import {
  Erc20Proposal,
  ExecuteProposalStep,
  ExecuteProposalStepValue,
  IClientErc20,
  ICreateProposalParams,
  IErc20FactoryParams,
  IProposalQueryParams,
  ProposalCreationSteps,
  ProposalCreationStepValue,
  SetVotingConfigStep,
  SetVotingConfigStepValue,
  VoteOptions,
  VoteProposalStep,
  VoteProposalStepValue,
  VotingConfig,
  // VotingConfig,
} from "./internal/interfaces/plugins";
import { IDAO } from "@aragon/core-contracts-ethers";
import { ClientCore } from "./internal/core";
import {
  PluginInitAction,
  GasFeeEstimation,
} from "./internal/interfaces/common";
import { ContextErc20 } from "./context-erc20";
import { getERC20ProposalsWithStatus } from "./internal/utils/plugins";
import { encodeErc20ActionInit } from "./internal/encoding/plugins";
import { Random } from "@aragon/sdk-common";
import { getDummyErc20Proposal, getRandomInteger } from "./internal/temp-mock";

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
    /**
     * Creates a new proposal on the given ERC20 plugin contract
     *
     * @param {ICreateProposalParams} params
     * @return {*}  {AsyncGenerator<ProposalCreationStepValue>}
     * @memberof ClientErc20
     */
    createProposal: (params: ICreateProposalParams): AsyncGenerator<ProposalCreationStepValue> =>
      this._createProposal(params),
    /**
     * Cast a vote on the given proposal using the client's wallet. Depending on the proposal settings, an affirmative vote may execute the proposal's actions on the DAO.
     *
     * @param {string} proposalId
     * @param {VoteOptions} vote
     * @return {*}  {AsyncGenerator<VoteProposalStepValue>}
     * @memberof ClientErc20
     */
    voteProposal: (proposalId: string, vote: VoteOptions): AsyncGenerator<VoteProposalStepValue> =>
      this._voteProposal(proposalId, vote),
    /**
     * Executes the given proposal, provided that it has already passed
     *
     * @param {string} proposalId
     * @return {*}  {AsyncGenerator<ExecuteProposalStepValue>}
     * @memberof ClientErc20
     */
    executeProposal: (proposalId: string): AsyncGenerator<ExecuteProposalStepValue> =>
      this._executeProposal(proposalId),
    /**
     * Sets the voting configuration in a allowlist proposal given a daoAddress and a configuration
     *
     * @param {VotingConfig} config
     * @return {*}  {AsyncGenerator<SetVotingConfigStepValue>}
     * @memberof ClientErc20
     */
    setPluginConfig: (config: VotingConfig): AsyncGenerator<SetVotingConfigStepValue> =>
      this._setPluginConfig(config),

    /**
     * Returns the list of wallet addresses holding tokens from the underlying ERC20 contract used by the plugin
     *
     * @return {*}  {Promise<string[]>}
     * @memberof ClientErc20
     */
    getMembers: (): Promise<string[]> => this._getMembers(),
    /**
     * Returns the details of the given proposal
     * 
     * @param {string} proposalId
     * @return {*}  {Promise<Erc20Proposal>}
     * @memberof ClientErc20
     */
    getProposal: (proposalId: string): Promise<Erc20Proposal> =>
      this._getProposal(proposalId),
    /**
     * Returns a list of proposals on the Plugin, filtered by the given criteria
     *
     * @param {IProposalQueryParams} params
     * @return {*}  {Promise<Erc20Proposal[]>}
     * @memberof ClientErc20
     */
    getProposalMany: (params?: IProposalQueryParams): Promise<Erc20Proposal[]> =>
      this._getProposalMany(params ?? {}),
  };

  //// ACTION BUILDERS

  /** Contains the helpers to encode actions and parameters that can be passed as a serialized buffer on-chain */
  encoding = {
    /**
     * Encodes the parameters for the plugin initialization as a hex string, to be used when deploying a DAO or installing/updating the plugin
     *
     * @param {IErc20FactoryParams} params
     * @return {*}  {FactoryInitParams}
     * @memberof ClientErc20
     */
  // DaoConfig,
    init: (params: IErc20FactoryParams): PluginInitAction => this._buildActionInit(params),
  }
  //// ESTIMATION HANDLERS

  /** Contains the gas estimation of the Ethereum transactions */
  estimation = {
    /**
     * Estimates the gas fee of creating a proposal on the plugin
     *
     * @param {ICreateProposalParams} params
     * @return {*}  {Promise<GasFeeEstimation>}
     * @memberof ClientErc20
     */
    createProposal: (params: ICreateProposalParams): Promise<GasFeeEstimation> =>
      this._estimateCreateProposal(params),
    /**
     * Estimates the gas fee of casting a vote on a proposal
     *
     * @param {string} proposalId
     * @param {VoteOptions} vote
     * @return {*}  {Promise<GasFeeEstimation>}
     * @memberof ClientErc20
     */
    voteProposal: (proposalId: string, vote: VoteOptions): Promise<GasFeeEstimation> =>
      this._estimateVoteProposal(proposalId, vote),
    /**
     * Estimates the gas fee of executing an ERC20 proposal
     *
     * @param {string} proposalId
     * @return {*}  {Promise<GasFeeEstimation>}
     * @memberof ClientErc20
     */
    executeProposal: (proposalId: string): Promise<GasFeeEstimation> =>
      this._estimateExecuteProposal(proposalId),
    /**
     * Estimates the gas fee of updating the governance configuration through a new ERC20 proposal
     *
     * @param {string} daoAddressOrEns
     * @param {VotingConfig} config
     * @return {*}  {Promise<GasFeeEstimation>}
     * @memberof ClientErc20
     */
    setPluginConfig: (config: VotingConfig): Promise<GasFeeEstimation> =>
      this._estimateSetPluginConfig(config),
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

  private async *_voteProposal(_proposalId: string, _vote: VoteOptions): AsyncGenerator<VoteProposalStepValue> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (!signer.provider) {
      throw new Error("A web3 provider is needed");
    }

    // TODO: Implement

    yield {
      key: VoteProposalStep.VOTING,
      txHash: '0x0123456789012345678901234567890123456789012345678901234567890123'
    }
    yield {
      key: VoteProposalStep.DONE,
      voteId: '0x0123456789012345678901234567890123456789012345678901234567890123'
    }
  }

  private async *_executeProposal(_proposalId: string): AsyncGenerator<ExecuteProposalStepValue> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (!signer.provider) {
      throw new Error("A web3 provider is needed");
    }

    // TODO: Implement

    yield {
      key: ExecuteProposalStep.EXECUTING,
      txHash: '0x0123456789012345678901234567890123456789012345678901234567890123'
    }
    yield {
      key: ExecuteProposalStep.DONE
    }
  }

  private async *_setPluginConfig(_config: VotingConfig): AsyncGenerator<SetVotingConfigStepValue> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (!signer.provider) {
      throw new Error("A web3 provider is needed");
    }

    // TODO: Implement

    yield {
      key: SetVotingConfigStep.CREATING_PROPOSAL,
      txHash: '0x0123456789012345678901234567890123456789012345678901234567890123'
    }
    yield {
      key: SetVotingConfigStep.DONE
    }
  }


  //// PRIVATE ACTION BUILDER HANDLERS

  private _buildActionInit(params: IErc20FactoryParams): PluginInitAction {
    return {
      id: this._pluginAddress,
      data: encodeErc20ActionInit(params)
    }
  }

  private _estimateCreateProposal(_params: ICreateProposalParams): Promise<GasFeeEstimation> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (!signer.provider) {
      throw new Error("A web3 provider is needed");
    }

    // TODO: Remove below as the new contracts are ready

    return Promise.resolve(this.web3.getApproximateGasFee(BigInt(getRandomInteger(1000, 1500))))

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
  private _estimateVoteProposal(proposalId: string, vote: VoteOptions): Promise<GasFeeEstimation> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (!signer.provider) {
      throw new Error("A web3 provider is needed");
    }
    // TODO: remove this
    return Promise.resolve(this.web3.getApproximateGasFee(BigInt(getRandomInteger(1000, 1500))))
  }
  // @ts-ignore  TODO: Remove this comment when implemented
  private _estimateExecuteProposal(proposalId: string): Promise<GasFeeEstimation> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (!signer.provider) {
      throw new Error("A web3 provider is needed");
    }
    // TODO: remove this
    return Promise.resolve(this.web3.getApproximateGasFee(BigInt(getRandomInteger(1000, 1500))))
  }


  private _estimateSetPluginConfig(_config: VotingConfig): Promise<GasFeeEstimation> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (!signer.provider) {
      throw new Error("A web3 provider is needed");
    }
    // TODO: Remove below as the new contracts are ready
    return Promise.resolve(this.web3.getApproximateGasFee(BigInt(getRandomInteger(1000, 1500))))
  }

  private _getMembers(): Promise<string[]> {

    // TODO: Implementation

    const mockAddresses = [
      "0x8367dc645e31321CeF3EeD91a10a5b7077e21f70",
      "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
      "0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8",
      "0x2dB75d8404144CD5918815A44B8ac3f4DB2a7FAf",
      "0xc1d60f584879f024299DA0F19Cdb47B931E35b53",
    ];

    return new Promise(resolve => setTimeout(resolve, 1000)).then(() =>
      mockAddresses.filter(() => Random.getFloat() > 0.4)
    );
  }

  private _getProposal(proposalId: string) {
    if (!proposalId) {
      throw new Error("Invalid proposalId");
    }
    const proposal: Erc20Proposal = getERC20ProposalsWithStatus([getDummyErc20Proposal(proposalId)])[0]
    return new Promise((resolve) => setTimeout(resolve, 1000)).then(() => (proposal))
  }

  private _getProposalMany({
    // TODO 
    // uncomment when querying to subgraph
    // addressOrEns,
    limit = 0,
    // skip = 0,
    // sortDirection = SortDireccions.ASC,
    // sortBy = Erc20ProposalSortBy.CREATED_AT
  }: IProposalQueryParams): Promise<Erc20Proposal[]> {
    let proposals: Erc20Proposal[] = []
    for (let index = 0; index < limit; index++) {
      proposals.push(getDummyErc20Proposal())
    }
    proposals = getERC20ProposalsWithStatus(proposals)
    return new Promise((resolve) => setTimeout(resolve, 1000)).then(() => (proposals))
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
