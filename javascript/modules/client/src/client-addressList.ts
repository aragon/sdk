import { Random } from "@aragon/sdk-common";
import { AddressZero } from "@ethersproject/constants";
import { ContextPlugin } from "./context-plugin";
import { ClientCore } from "./internal/core";
import { encodeActionSetPluginConfig, encodeAddressListActionInit } from "./internal/encoding/plugins";
import { IPluginInstallEntry, GasFeeEstimation, DaoAction } from "./internal/interfaces/common";
import {
  ExecuteProposalStep,
  ExecuteProposalStepValue,
  IClientAddressList,
  ICreateProposal,
  IAddressListPluginInstall,
  IProposalQueryParams,
  AddressListProposal,
  ProposalCreationSteps,
  ProposalCreationStepValue,
  VoteValues,
  VoteProposalStep,
  VoteProposalStepValue,
  ProposalConfig,
  AddressListProposalListItem
} from "./internal/interfaces/plugins";
import { getDummyAddressListProposal, getDummyAddressListProposalListItem } from "./internal/temp-mock";
import { getProposalStatus } from "./internal/utils/plugins";

const PLUGIN_ID = "0x1234567890123456789012345678901234567890"

export class ClientAddressList extends ClientCore implements IClientAddressList {
  //@ts-ignore TODO: Remove
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
     * Creates a new proposal on the given AddressList plugin contract
     *
     * @param {ICreateProposal} _params
     * @return {*}  {AsyncGenerator<ProposalCreationStepValue>}
     * @memberof ClientAddressList
     */
    createProposal: (params: ICreateProposal): AsyncGenerator<ProposalCreationStepValue> =>
      this._createProposal(params),
    /**
     * Cast a vote on the given proposal using the client's wallet. Depending on the proposal settings, an affirmative vote may execute the proposal's actions on the DAO.
     *
     * @param {string} proposalId
     * @param {VoteValues} vote
     * @return {*}  {AsyncGenerator<VoteProposalStepValue>}
     * @memberof ClientAddressList
     */
    voteProposal: (proposalId: string, vote: VoteValues): AsyncGenerator<VoteProposalStepValue> =>
      this._voteProposal(proposalId, vote),
    /**
     * Executes the given proposal, provided that it has already passed
     *
     * @param {string} proposalId
     * @return {*}  {AsyncGenerator<ExecuteProposalStepValue>}
     * @memberof ClientAddressList
     */
    executeProposal: (proposalId: string): AsyncGenerator<ExecuteProposalStepValue> =>
      this._executeProposal(proposalId),
    /**
     * Returns the list of wallet addresses with signing capabilities on the plugin
     *
     * @return {*}  {Promise<string[]>}
     * @memberof ClientAddressList
     */
    getMembers: (addressOrEns: string): Promise<string[]> =>
      this._getMemebers(addressOrEns),
    /**
     * Returns the details of the given proposal
     *
     * @param {string} proposalId
     * @return {*}  {Promise<AddressListProposal>}
     * @memberof ClientAddressList
     */
    getProposal: (proposalId: string): Promise<AddressListProposal> =>
      this._getProposal(proposalId),
    /**
     * Returns a list of proposals on the Plugin, filtered by the given criteria
     *
     * @param {IProposalQueryParams}
     * @return {*}  {Promise<AddressListProposalListItem[]>}
     * @memberof ClientAddressList
     */
    getProposals: (params?: IProposalQueryParams): Promise<AddressListProposalListItem[]> =>
      this._getProposals(params ?? {}),
  }
  encoding = {
    /**
     * Computes the parameters to be given when creating a proposal that updates the governance configuration
     *
     * @param {ProposalConfig} params
     * @return {*}  {DaoAction}
     * @memberof ClientAddressList
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
    installEntry: (params: IAddressListPluginInstall): IPluginInstallEntry => {
      return {
        id: PLUGIN_ID,
        data: encodeAddressListActionInit(params),
      }
    }
  }
  estimation = {

    /**
     * Estimates the gas fee of creating a proposal on the plugin
     *
     * @param {ICreateProposal} params
     * @return {*}  {Promise<GasFeeEstimation>}
     * @memberof ClientAddressList
     */
    createProposal: (params: ICreateProposal): Promise<GasFeeEstimation> =>
      this._estimateCreateProposal(params),

    /**
     * Estimates the gas fee of casting a vote on a proposal
     *
     * @param {string} proposalId
     * @param {VoteValues} vote
     * @return {*}  {Promise<GasFeeEstimation>}
     * @memberof ClientAddressList
     */
    voteProposal: (proposalId: string, vote: VoteValues): Promise<GasFeeEstimation> =>
      this._estimateVoteProposal(proposalId, vote),

    /**
     * Estimates the gas fee of executing an AddressList proposal
     *
     * @param {string} proposalId
     * @return {*}  {Promise<GasFeeEstimation>}
     * @memberof ClientAddressList
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

  private async *_voteProposal(_proposalId: string, _vote: VoteValues): AsyncGenerator<VoteProposalStepValue> {
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

  private _getMemebers(_addressOrEns: string): Promise<string[]> {
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

  private _getProposal(proposalId: string): Promise<AddressListProposal> {
    if (!proposalId) {
      throw new Error("Invalid proposalId");
    }

    // TODO: Implement

    const proposal = getDummyAddressListProposal(proposalId)
    proposal.status = getProposalStatus(proposal.startDate, proposal.endDate, true, BigInt(proposal.result.yes), BigInt(proposal.result.no))
    return new Promise((resolve) => setTimeout(resolve, 1000)).then(() => (proposal))
  }

  private _getProposals({
    // TODO 
    // uncomment when querying to subgraph
    // daoAddressOrEns,
    limit = 0,
    // skip = 0,
    // direction = SortDirection.ASC,
    // sortBy = AddressListProposalSortBy.CREATED_AT
  }: IProposalQueryParams): Promise<AddressListProposalListItem[]> {
    let proposals: AddressListProposalListItem[] = []

    // TODO: Implement

    for (let index = 0; index < limit; index++) {
      proposals.push(getDummyAddressListProposalListItem())
    }
    proposals.map((proposal) => {
      proposal.status = getProposalStatus(proposal.startDate, proposal.endDate, true, BigInt(proposal.result.yes), BigInt(proposal.result.no))
    })
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

  private _estimateVoteProposal(_proposalId: string, _vote: VoteValues): Promise<GasFeeEstimation> {
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
