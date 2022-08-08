import { Random } from "@aragon/sdk-common";
import { AddressZero } from "@ethersproject/constants";
import { ContextPlugin } from "./context-plugin";
import { ClientCore } from "./internal/core";
import { encodeActionSetPluginConfig, encodeMultisigActionInit } from "./internal/encoding/plugins";
import { IPluginInstallEntry, GasFeeEstimation, DaoAction } from "./internal/interfaces/common";
import {
  ExecuteProposalStep,
  ExecuteProposalStepValue,
  IClientMultisig,
  ICreateProposal,
  IMultisigPluginInstall,
  IProposalQueryParams,
  MultisigProposal,
  ProposalCreationSteps,
  ProposalCreationStepValue,
  SetPluginConfigStep,
  SetPluginConfigStepValue,
  VoteOptions,
  VoteProposalStep,
  VoteProposalStepValue,
  ProposalConfig
} from "./internal/interfaces/plugins";
import { getDummyMultisigProposal } from "./internal/temp-mock";
import { getMultisigProposalsWithStatus } from "./internal/utils/plugins";

const PLUGIN_ID = "0x1234567890123456789012345678901234567890"

export class ClientMultisig extends ClientCore implements IClientMultisig {
  private _pluginAddress: string;

  constructor(context: ContextPlugin) {
    super(context);

    if (!context.pluginAddress) {
      throw new Error("An address for the plugin is required");
    }
    this._pluginAddress = context.pluginAddress;
  }
  methods = {
    /**
     * Creates a new proposal on the given Multisig plugin contract
     *
     * @param {ICreateProposal} _params
     * @return {*}  {AsyncGenerator<ProposalCreationStepValue>}
     * @memberof ClientMultisig
     */
    createProposal: (params: ICreateProposal): AsyncGenerator<ProposalCreationStepValue> =>
      this._createProposal(params),
    /**
     * Cast a vote on the given proposal using the client's wallet. Depending on the proposal settings, an affirmative vote may execute the proposal's actions on the DAO.
     *
     * @param {string} proposalId
     * @param {VoteOptions} vote
     * @return {*}  {AsyncGenerator<VoteProposalStepValue>}
     * @memberof ClientMultisig
     */
    voteProposal: (proposalId: string, vote: VoteOptions): AsyncGenerator<VoteProposalStepValue> =>
      this._voteProposal(proposalId, vote),
    /**
     * Executes the given proposal, provided that it has already passed
     *
     * @param {string} proposalId
     * @return {*}  {AsyncGenerator<ExecuteProposalStepValue>}
     * @memberof ClientMultisig
     */
    executeProposal: (proposalId: string): AsyncGenerator<ExecuteProposalStepValue> =>
      this._executeProposal(proposalId),
    /**
     * Sets the voting configuration in a Multisig proposal given a proposalId and a configuration
     *
     * @param {ProposalConfig} config
     * @return {*}  {AsyncGenerator<SetPluginConfigStepValue>}
     * @memberof ClientMultisig
     */
    setPluginConfig: (config: ProposalConfig): AsyncGenerator<SetPluginConfigStepValue> =>
      this._setPluginConfig(config),
    /**
     * Returns the list of wallet addresses with signing capabilities on the plugin
     *
     * @return {*}  {Promise<string[]>}
     * @memberof ClientMultisig
     */
    getMembers: (): Promise<string[]> =>
      this._getMemebers(),
    /**
     * Returns the details of the given proposal
     *
     * @param {string} proposalId
     * @return {*}  {Promise<MultisigProposal>}
     * @memberof ClientMultisig
     */
    getProposal: (proposalId: string): Promise<MultisigProposal> =>
      this._getProposal(proposalId),
    /**
     * Returns a list of proposals on the Plugin, filtered by the given criteria
     *
     * @param {IProposalQueryParams}
     * @return {*}  {Promise<MultisigProposal[]>}
     * @memberof ClientMultisig
     */
    getProposals: (params?: IProposalQueryParams): Promise<MultisigProposal[]> =>
      this._getProposals(params ?? {}),
  }
  encoding = {
    /**
     * Computes the parameters to be given when creating a proposal that updates the governance configuration
     *
     * @param {ProposalConfig} params
     * @return {*}  {DaoAction}
     * @memberof ClientMultisig
     */
    setPluginConfigAction: (params: ProposalConfig): DaoAction => this._buildActionSetPluginConfig(params)
  }
  static encoding = {
    /**
     * Computes the parameters to be given when creating the DAO,
     * so that the plugin is configured    
     * 
     * @param {IErc20PluginInstall} params
     * @return {*}  {FactoryInitParams}
     * @memberof ClientErc20
     */
    installEntry: (params: IMultisigPluginInstall): IPluginInstallEntry => {
      return {
        id: PLUGIN_ID,
        data: encodeMultisigActionInit(params)
      }
    }
  }
  estimation = {

    /**
     * Estimates the gas fee of creating a proposal on the plugin
     *
     * @param {ICreateProposal} params
     * @return {*}  {Promise<GasFeeEstimation>}
     * @memberof ClientMultisig
     */
    createProposal: (params: ICreateProposal): Promise<GasFeeEstimation> =>
      this._estimateCreateProposal(params),

    /**
     * Estimates the gas fee of casting a vote on a proposal
     *
     * @param {string} proposalId
     * @param {VoteOptions} vote
     * @return {*}  {Promise<GasFeeEstimation>}
     * @memberof ClientMultisig
     */
    voteProposal: (proposalId: string, vote: VoteOptions): Promise<GasFeeEstimation> =>
      this._estimateVoteProposal(proposalId, vote),

    /**
     * Estimates the gas fee of executing an Multisig proposal
     *
     * @param {string} proposalId
     * @return {*}  {Promise<GasFeeEstimation>}
     * @memberof ClientMultisig
     */
    executeProposal: (proposalId: string): Promise<GasFeeEstimation> =>
      this._estimateExecuteProposal(proposalId),
  }

  private async *_createProposal(
    _params: ICreateProposal,
  ): AsyncGenerator<ProposalCreationStepValue> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (!signer.provider) {
      throw new Error("A web3 provider is needed");
    }

    // TODO: Implement

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

  private async *_setPluginConfig(_config: ProposalConfig): AsyncGenerator<SetPluginConfigStepValue> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (!signer.provider) {
      throw new Error("A web3 provider is needed");
    }

    // TODO: Implement

    yield {
      key: SetPluginConfigStep.CREATING_PROPOSAL,
      txHash: '0x0123456789012345678901234567890123456789012345678901234567890123'
    }
    yield {
      key: SetPluginConfigStep.DONE
    }
  }

  private _getMemebers(): Promise<string[]> {
    const mockAddresses: string[] = [
      "0x0123456789012345678901234567890123456789",
      "0x1234567890123456789012345678901234567890",
      "0x2345678901234567890123456789012345678901",
      "0x3456789012345678901234567890123456789012",
      "0x4567890123456789012345678901234567890123",
    ]

    // TODO: Implement

    return new Promise(resolve => setTimeout(resolve, 1000)).then(() =>
      mockAddresses.filter(() => Random.getFloat() > 0.4)
    );
  }

  private _getProposal(proposalId: string): Promise<MultisigProposal> {
    if (!proposalId) {
      throw new Error("Invalid proposalId");
    }

    // TODO: Implement

    const proposal = getMultisigProposalsWithStatus([getDummyMultisigProposal(proposalId)])[0]
    return new Promise((resolve) => setTimeout(resolve, 1000)).then(() => (proposal))
  }

  /**
   * Returns a list of proposals filtered by the input params
   *
   * @private
   * @param {IProposalQueryParams} {
   *     limit = 0,
   *     // TODO
   *     // uncomment this
   *     // skip = 0,
   *     // direction = SortDireccion.ASC,
   *     // sortBy = MultisigProposalSortBy.CREATED_AT
   *   }
   * @return {*}  {Promise<MultisigProposal[]>}
   * @memberof ClientMultisig
   */
  private _getProposals({
    // TODO 
    // uncomment when querying to subgraph
    // daoAddressOrEns,
    limit = 0,
    // skip = 0,
    // direction = SortDireccion.ASC,
    // sortBy = MultisigProposalSortBy.CREATED_AT
  }: IProposalQueryParams): Promise<MultisigProposal[]> {
    let proposals: MultisigProposal[] = []

    // TODO: Implement

    for (let index = 0; index < limit; index++) {
      proposals.push(getDummyMultisigProposal())
    }
    proposals = getMultisigProposalsWithStatus(proposals)
    return new Promise((resolve) => setTimeout(resolve, 1000)).then(() => (proposals))
  }

  private _buildActionSetPluginConfig(params: ProposalConfig): DaoAction {
    // TODO: check if to and value are correct
    return {
      to: AddressZero,
      value: BigInt(0),
      data: encodeActionSetPluginConfig(params)
    }
  }

  private _estimateCreateProposal(_params: ICreateProposal): Promise<GasFeeEstimation> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (!signer.provider) {
      throw new Error("A web3 provider is needed");
    }

    // TODO: Implement

    return Promise.resolve(this.web3.getApproximateGasFee(Random.getBigInt(BigInt(1500))))
  }

  private _estimateVoteProposal(_proposalId: string, _vote: VoteOptions): Promise<GasFeeEstimation> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (!signer.provider) {
      throw new Error("A web3 provider is needed");
    }

    // TODO: Implement

    return Promise.resolve(this.web3.getApproximateGasFee(Random.getBigInt(BigInt(1500))))
  }

  private _estimateExecuteProposal(_proposalId: string): Promise<GasFeeEstimation> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (!signer.provider) {
      throw new Error("A web3 provider is needed");
    }

    // TODO: Implement

    return Promise.resolve(this.web3.getApproximateGasFee(Random.getBigInt(BigInt(1500))))
  }
}
