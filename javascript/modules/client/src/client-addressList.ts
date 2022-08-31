import { bytesToHex, Random } from "@aragon/sdk-common";
import { AddressZero } from "@ethersproject/constants";
import { ContextPlugin } from "./context-plugin";
import { ClientCore } from "./internal/core";
import { getFunctionFragment } from "./internal/encoding/common";
import {
  decodeUpdatePluginSettingsAction,
  encodeAddressListActionInit,
  encodeUpdatePluginSettingsAction,
} from "./internal/encoding/plugins";
import {
  DaoAction,
  GasFeeEstimation,
  IInterfaceParams,
  IPluginInstallItem,
} from "./internal/interfaces/common";
import {
  AddressListProposal,
  AddressListProposalListItem,
  ExecuteProposalStep,
  ExecuteProposalStepValue,
  IAddressListPluginInstall,
  IClientAddressList,
  ICreateProposalParams,
  IExecuteProposalParams,
  IPluginSettings,
  IProposalQueryParams,
  IVoteProposalParams,
  ProposalCreationSteps,
  ProposalCreationStepValue,
  VoteProposalStep,
  VoteProposalStepValue,
} from "./internal/interfaces/plugins";
import {
  getDummyAddressListProposal,
  getDummyAddressListProposalListItem,
} from "./internal/temp-mock";
import { getProposalStatus } from "./internal/utils/plugins";

// NOTE: This address needs to be set when the plugin has been published and the ID is known
const PLUGIN_ID = "0x1234567890123456789012345678901234567890";

/**
 * Provider a generic client with high level methods to manage and interact an Address List Voting plugin installed in a DAO
 */
export class ClientAddressList extends ClientCore
  implements IClientAddressList {
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
     * @param {ICreateProposalParams} _params
     * @return {*}  {AsyncGenerator<ProposalCreationStepValue>}
     * @memberof ClientAddressList
     */
    createProposal: (
      params: ICreateProposalParams,
    ): AsyncGenerator<ProposalCreationStepValue> =>
      this._createProposal(params),
    /**
     * Cast a vote on the given proposal using the client's wallet. Depending on the proposal settings, an affirmative vote may execute the proposal's actions on the DAO.
     *
     * @param {string} proposalId
     * @param {IVoteProposalParams} params
     * @return {*}  {AsyncGenerator<VoteProposalStepValue>}
     * @memberof ClientAddressList
     */
    voteProposal: (
      params: IVoteProposalParams,
    ): AsyncGenerator<VoteProposalStepValue> => this._voteProposal(params),
    /**
     * Executes the given proposal, provided that it has already passed
     *
     * @param {IExecuteProposalParams} params
     * @return {*}  {AsyncGenerator<ExecuteProposalStepValue>}
     * @memberof ClientAddressList
     */
    executeProposal: (
      params: IExecuteProposalParams,
    ): AsyncGenerator<ExecuteProposalStepValue> =>
      this._executeProposal(params),
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
    getProposals: (
      params?: IProposalQueryParams,
    ): Promise<AddressListProposalListItem[]> =>
      this._getProposals(params ?? {}),
    /**
     * Returns the settings of a plugin given the address of the plugin instance
     *
     * @param {string} pluginAddress
     * @return {*}  {Promise<IPluginSettings>}
     * @memberof ClientAddressList
     */
    getSettings: (pluginAddress: string): Promise<IPluginSettings> =>
      this._getSettings(pluginAddress),
  };
  encoding = {
    /**
     * Computes the parameters to be given when creating a proposal that updates the governance configuration
     *
     * @param {IPluginSettings} params
     * @return {*}  {DaoAction}
     * @memberof ClientAddressList
     */
    updatePluginSettingsAction: (params: IPluginSettings): DaoAction =>
      this._buildUpdatePluginSettingsAction(params),
  };
  decoding = {
    /**
     * Decodes a dao metadata from an encoded update metadata action
     *
     * @param {Uint8Array} data
     * @return {*}  {IPluginSettings}
     * @memberof ClientAddressList
     */
    updatePluginSettingsAction: (data: Uint8Array): IPluginSettings =>
      decodeUpdatePluginSettingsAction(data),

    /**
     * Returns the decoded function info given the encoded data of an action
     *
     * @param {Uint8Array} data
     * @return {*}  {IInterfaceParams | null}
     * @memberof ClientAddressList
     */
    getInterface: (data: Uint8Array): IInterfaceParams | null =>
      this._getInterfaceParams(data),
  };
  static encoding = {
    /**
     * Computes the parameters to be given when creating the DAO,
     * so that the plugin is configured
     *
     * @param {IErc20PluginInstall} params
     * @return {*}  {FactoryInitParams}
     * @memberof ClientAddressList
     */
    getPluginInstallItem: (
      params: IAddressListPluginInstall,
    ): IPluginInstallItem => {
      return {
        id: PLUGIN_ID,
        data: encodeAddressListActionInit(params),
      };
    },
  };
  estimation = {
    /**
     * Estimates the gas fee of creating a proposal on the plugin
     *
     * @param {ICreateProposalParams} params
     * @return {*}  {Promise<GasFeeEstimation>}
     * @memberof ClientAddressList
     */
    createProposal: (
      params: ICreateProposalParams,
    ): Promise<GasFeeEstimation> => this._estimateCreateProposal(params),

    /**
     * Estimates the gas fee of casting a vote on a proposal
     *
     * @param {IVoteProposalParams} params
     * @param {VoteValues} vote
     * @return {*}  {Promise<GasFeeEstimation>}
     * @memberof ClientAddressList
     */
    voteProposal: (params: IVoteProposalParams): Promise<GasFeeEstimation> =>
      this._estimateVoteProposal(params),

    /**
     * Estimates the gas fee of executing an AddressList proposal
     *
     * @param {params} params
     * @return {*}  {Promise<GasFeeEstimation>}
     * @memberof ClientAddressList
     */
    executeProposal: (
      params: IExecuteProposalParams,
    ): Promise<GasFeeEstimation> => this._estimateExecuteProposal(params),
  };

  private async *_createProposal(
    _params: ICreateProposalParams,
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
      txHash:
        "0x0123456789012345678901234567890123456789012345678901234567890123",
    };
    yield {
      key: ProposalCreationSteps.DONE,
      proposalId:
        "0x0123456789012345678901234567890123456789012345678901234567890123",
    };
  }

  private async *_voteProposal(
    _params: IVoteProposalParams,
  ): AsyncGenerator<VoteProposalStepValue> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (!signer.provider) {
      throw new Error("A web3 provider is needed");
    }

    // TODO: Implement

    yield {
      key: VoteProposalStep.VOTING,
      txHash:
        "0x0123456789012345678901234567890123456789012345678901234567890123",
    };
    yield {
      key: VoteProposalStep.DONE,
      voteId:
        "0x0123456789012345678901234567890123456789012345678901234567890123",
    };
  }

  private async *_executeProposal(
    _params: IExecuteProposalParams,
  ): AsyncGenerator<ExecuteProposalStepValue> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (!signer.provider) {
      throw new Error("A web3 provider is needed");
    }

    // TODO: Implement

    yield {
      key: ExecuteProposalStep.EXECUTING,
      txHash:
        "0x0123456789012345678901234567890123456789012345678901234567890123",
    };
    yield {
      key: ExecuteProposalStep.DONE,
    };
  }

  private _getMemebers(_addressOrEns: string): Promise<string[]> {
    const mockAddresses: string[] = [
      "0x0123456789012345678901234567890123456789",
      "0x1234567890123456789012345678901234567890",
      "0x2345678901234567890123456789012345678901",
      "0x3456789012345678901234567890123456789012",
      "0x4567890123456789012345678901234567890123",
    ];

    // TODO: Implement

    return new Promise((resolve) => setTimeout(resolve, 1000)).then(() =>
      mockAddresses.filter(() => Random.getFloat() > 0.4)
    );
  }

  private _getProposal(proposalId: string): Promise<AddressListProposal> {
    if (!proposalId) {
      throw new Error("Invalid proposalId");
    }

    // TODO: Implement

    const proposal = getDummyAddressListProposal(proposalId);
    proposal.status = getProposalStatus(
      proposal.startDate,
      proposal.endDate,
      true,
      BigInt(proposal.result.yes),
      BigInt(proposal.result.no),
    );
    return new Promise((resolve) => setTimeout(resolve, 1000)).then(
      () => (proposal)
    );
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
    let proposals: AddressListProposalListItem[] = [];

    // TODO: Implement

    for (let index = 0; index < limit; index++) {
      const proposal = getDummyAddressListProposalListItem();
      proposal.status = getProposalStatus(
        proposal.startDate,
        proposal.endDate,
        true,
        BigInt(proposal.result.yes),
        BigInt(proposal.result.no),
      );
      proposals.push(proposal);
    }
    return new Promise((resolve) => setTimeout(resolve, 1000)).then(
      () => (proposals)
    );
  }

  private _buildUpdatePluginSettingsAction(params: IPluginSettings): DaoAction {
    // TODO: check if to and value are correct
    return {
      to: AddressZero,
      value: BigInt(0),
      data: encodeUpdatePluginSettingsAction(params),
    };
  }

  private _estimateCreateProposal(
    _params: ICreateProposalParams,
  ): Promise<GasFeeEstimation> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (!signer.provider) {
      throw new Error("A web3 provider is needed");
    }

    // TODO: Implement

    return Promise.resolve(
      this.web3.getApproximateGasFee(Random.getBigInt(BigInt(1500))),
    );
  }

  private _estimateVoteProposal(
    _params: IVoteProposalParams,
  ): Promise<GasFeeEstimation> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (!signer.provider) {
      throw new Error("A web3 provider is needed");
    }

    // TODO: Implement

    return Promise.resolve(
      this.web3.getApproximateGasFee(Random.getBigInt(BigInt(1500))),
    );
  }

  private _estimateExecuteProposal(
    _params: IExecuteProposalParams,
  ): Promise<GasFeeEstimation> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (!signer.provider) {
      throw new Error("A web3 provider is needed");
    }

    // TODO: Implement

    return Promise.resolve(
      this.web3.getApproximateGasFee(Random.getBigInt(BigInt(1500))),
    );
  }

  private _getSettings(_pluginAddress: string): Promise<IPluginSettings> {
    const pluginSettings: IPluginSettings = {
      minDuration: 7200,
      minTurnout: 0.55,
      minSupport: 0.25,
    };
    return new Promise((resolve) => setTimeout(resolve, 1000)).then(
      () => (pluginSettings)
    );
  }

  private _getInterfaceParams(data: Uint8Array): IInterfaceParams | null {
    try {
      const func = getFunctionFragment(data);
      return {
        id: func.format("minimal"),
        functionName: func.name,
        hash: bytesToHex(data, true).substring(0, 10),
      };
    } catch {
      return null;
    }
  }
}
