import { ContextErc20 } from "./context-erc20";
import { ClientCore } from "./internal/core";
import { encodeMultisigActionInit } from "./internal/encoding/plugins";
import { FactoryInitParams, GasFeeEstimation } from "./internal/interfaces/common";
import { ExecuteProposalStep, ExecuteProposalStepValue, IClientMultisig, ICreateProposalParams, IMultisigFactoryParams, IMultisigProposalQueryParams, IWithdrawParams, MultisigProposal, MultisigProposalSortBy, ProposalCreationSteps, ProposalCreationStepValue, SetVotingConfigStep, SetVotingConfigStepValue, VoteOptions, VoteProposalStep, VoteProposalStepValue, VotingConfig } from "./internal/interfaces/plugins";
import { getDummyMultisigProposal, getMultisigProposalsWithStatus } from "./internal/utils/plugins";


export class ClientMultisig extends ClientCore implements IClientMultisig {
  private _pluginAddress: string;

  constructor(context: ContextErc20) {
    super(context);

    if (!context.pluginAddress) {
      throw new Error("An address for the plugin is required");
    }
    this._pluginAddress = context.pluginAddress;
  }
  methods = {
    /**
     * Creates a new multisig voting proposal
     *
     * @param {ICreateProposalParams} _params
     * @return {*}  {AsyncGenerator<ProposalCreationStepValue>}
     * @memberof ClientMultisig
     */
    createProposal: (params: ICreateProposalParams): AsyncGenerator<ProposalCreationStepValue> =>
      this._createProposal(params),
    /**
     * Cast a vote o a proposal given the proposalId and the vote
     *
     * @param {string} proposalId
     * @param {VoteOptions} vote
     * @return {*}  {AsyncGenerator<VoteProposalStepValue>}
     * @memberof ClientMultisig
     */
    voteProposal: (proposalId: string, vote: VoteOptions): AsyncGenerator<VoteProposalStepValue> =>
      this._voteProposal(proposalId, vote),
    /**
     * Executes a proposal given a specific proposalId
     *
     * @param {string} proposalId
     * @return {*}  {AsyncGenerator<ExecuteProposalStepValue>}
     * @memberof ClientMultisig
     */
    executeProposal: (proposalId: string): AsyncGenerator<ExecuteProposalStepValue> =>
      this._executeProposal(proposalId),
    /**
     * Sets the voting configuration in a multisig proposal given a proposalId and a configuration
     *
     * @param {string} daoAddressOrEns
     * @param {VotingConfig} config
     * @return {*}  {AsyncGenerator<SetVotingConfigStepValue>}
     * @memberof ClientMultisig
     */
    setVotingConfig: (daoAddressOrEns: string, config: VotingConfig): AsyncGenerator<SetVotingConfigStepValue> =>
      this._setVotingConfig(daoAddressOrEns, config),
    /**
     * Returns the list of members of a spcific dao address or ens
     *
     * @param {string} daoAddressOrEns
     * @return {*}  {Promise<string[]>}
     * @memberof ClientMultisig
     */
    getMembers: (daoAddressOrEns: string): Promise<string[]> =>
      this._getMemebers(daoAddressOrEns),
    /**
     * Returns a proposal data given a specific propoosal id
     *
     * @param {string} proposalId
     * @return {*}  {Promise<MultisigProposal>}
     * @memberof ClientMultisig
     */
    getProposal: (propoosalId: string): Promise<MultisigProposal> =>
      this._getProposal(propoosalId),
    /**
     * Returns a list of proposals filtered by the input params
     *
     * @param {IMultisigProposalQueryParams}
     * @return {*}  {Promise<MultisigProposal[]>}
     * @memberof ClientMultisig
     */
    getProposalMany: (params?: IMultisigProposalQueryParams): Promise<MultisigProposal[]> =>
      this._getProposalMany(params ?? {}),
  }
  encoding = {
    /**
     * Computes the parameters to be given when creating the DAO,
     * so that the plugin is configured
     *
     * @param {IMultisigFactoryParams} params
     * @return {*}  {FactoryInitParams}
     * @memberof ClientMultisig
     */
    init: (params: IMultisigFactoryParams): FactoryInitParams => this._buildActionInit(params),
  }
  estimation = {

    /**
     * Estimates the gas fee of the creation oa multisig propoosal
     *
     * @param {ICreateProposalParams} params
     * @return {*}  {Promise<GasFeeEstimation>}
     * @memberof ClientMultisig
     */
    createProposal: (params: ICreateProposalParams): Promise<GasFeeEstimation> =>
      this._estimateCreateProposal(params),

    /**
     * Estimates the gas fee of voting in a multisig propoosal
     *
     * @param {string} proposalId
     * @param {VoteOptions} vote
     * @return {*}  {Promise<GasFeeEstimation>}
     * @memberof ClientMultisig
     */
    voteProposal: (proposalId: string, vote: VoteOptions): Promise<GasFeeEstimation> =>
      this._estimateVoteProposal(proposalId, vote),

    /**
     * Estimates the gas fee of executing a proposal
     *
     * @param {string} proposalId
     * @return {*}  {Promise<GasFeeEstimation>}
     * @memberof ClientMultisig
     */
    executeProposal: (proposalId: string): Promise<GasFeeEstimation> =>
      this._estimateExecuteProposal(proposalId),

    /**
     * Estimates the gas fee of setting the voting configuration in a multisig voting
     *
     * @param {string} daoAddressOrEns
     * @param {VotingConfig} config
     * @return {*}  {Promise<GasFeeEstimation>}
     * @memberof ClientMultisig
     */
    setVotingConfig: (daoAddressOrEns: string, config: VotingConfig): Promise<GasFeeEstimation> =>
      this._estimateSetVotingConfig(daoAddressOrEns, config)
  }

  private async *_createProposal(
    _params: ICreateProposalParams,
  ): AsyncGenerator<ProposalCreationStepValue> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (!signer.provider) {
      throw new Error("A web3 provider is needed");
    }
    yield {
      key: ProposalCreationSteps.CREATING,
      txHash: "0x0123456789012345678901234567890123456789012345678901234567890123"
    }
    yield {
      key: ProposalCreationSteps.DONE,
      proposalId: "0x0123456789012345678901234567890123456789012345678901234567890123"
    }
  }

  private async *_voteProposal(_proposalId: string, _vote: VoteOptions): AsyncGenerator<VoteProposalStepValue> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (!signer.provider) {
      throw new Error("A web3 provider is needed");
    }
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
    yield {
      key: ExecuteProposalStep.EXECUTING,
      txHash: '0x0123456789012345678901234567890123456789012345678901234567890123'
    }
    yield {
      key: ExecuteProposalStep.DONE,
      voteId: '0x0123456789012345678901234567890123456789012345678901234567890123'
    }
  }

  private async *_setVotingConfig(_daoAddressOrEns: string, _config: VotingConfig): AsyncGenerator<SetVotingConfigStepValue> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (!signer.provider) {
      throw new Error("A web3 provider is needed");
    }
    yield {
      key: SetVotingConfigStep.CONFIGURING,
      txHash: '0x0123456789012345678901234567890123456789012345678901234567890123'
    }
    yield {
      key: SetVotingConfigStep.DONE
    }
  }

  private _getMemebers(daoAddressOrEns: string): Promise<string[]> {
    if (!daoAddressOrEns) {
      throw new Error("Invalid DAO address or ENS");
    }
    const mockAddresses: string[] = [
      "0x0123456789012345678901234567890123456789",
      "0x1234567890123456789012345678901234567890",
      "0x2345678901234567890123456789012345678901",
      "0x3456789012345678901234567890123456789012",
      "0x4567890123456789012345678901234567890123",
    ]
    return new Promise(resolve => setTimeout(resolve, 1000)).then(() =>
      mockAddresses.filter(() => Math.random() > 0.4)
    );
  }

  private _getProposal(proposalId: string): Promise<MultisigProposal> {
    if (!proposalId) {
      throw new Error("Invalid proposalId");
    }
    const proposal = getMultisigProposalsWithStatus([getDummyMultisigProposal()])[0]
    return new Promise((resolve) => setTimeout(resolve, 1000)).then(() => (proposal))
  }

  /**
   * Returns a list of proposals filtered by the input params
   *
   * @private
   * @param {IMultisigProposalQueryParams} {
   *     limit = 0,
   *     // TODO
   *     // uncomment this
   *     // skip = 0,
   *     // sortDirection = SortDireccions.ASC,
   *     // sortBy = MultisigProposalSortBy.CREATED_AT
   *   }
   * @return {*}  {Promise<MultisigProposal[]>}
   * @memberof ClientMultisig
   */
  private _getProposalMany({
    // TODO 
    // uncomment when querying to subgraph
    // daoAddressOrEns,
    limit = 0,
    // skip = 0,
    // sortDirection = SortDireccions.ASC,
    // sortBy = MultisigProposalSortBy.CREATED_AT
  }: IMultisigProposalQueryParams): Promise<MultisigProposal[]> {
    let proposals: MultisigProposal[] = []
    for (let index = 0; index < limit; index++) {
      proposals.push(getDummyMultisigProposal())
    }
    proposals = getMultisigProposalsWithStatus(proposals)
    return new Promise((resolve) => setTimeout(resolve, 1000)).then(() => (proposals))
  }

  private _buildActionInit(params: IMultisigFactoryParams): FactoryInitParams {
    return {
      id: this._pluginAddress,
      data: encodeMultisigActionInit(params)
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
    return Promise.resolve(this.web3.getApproximateGasFee(BigInt(Math.random() * (1500 - 1000 + 1) + 1000)))
  }

  private _estimateVoteProposal(_proposalId: string, _vote: VoteOptions): Promise<GasFeeEstimation> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (!signer.provider) {
      throw new Error("A web3 provider is needed");
    }
    // TODO: Remove below as the new contracts are ready
    return Promise.resolve(this.web3.getApproximateGasFee(BigInt(Math.random() * (1500 - 1000 + 1) + 1000)))
  }

  private _estimateExecuteProposal(_proposalId: string): Promise<GasFeeEstimation> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (!signer.provider) {
      throw new Error("A web3 provider is needed");
    }
    // TODO: Remove below as the new contracts are ready
    return Promise.resolve(this.web3.getApproximateGasFee(BigInt(Math.random() * (1500 - 1000 + 1) + 1000)))
  }

  private _estimateSetVotingConfig(_daoAddressOrEns: string, _config: VotingConfig): Promise<GasFeeEstimation> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (!signer.provider) {
      throw new Error("A web3 provider is needed");
    }
    // TODO: Remove below as the new contracts are ready
    return Promise.resolve(this.web3.getApproximateGasFee(BigInt(Math.random() * (1500 - 1000 + 1) + 1000)))
  }
}
