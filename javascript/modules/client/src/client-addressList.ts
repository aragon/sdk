import {
  bytesToHex,
  GraphQLError,
  InvalidAddressError,
  InvalidAddressOrEnsError,
  InvalidProposalIdError,
  NoProviderError,
  NoSignerError,
  Random,
} from "@aragon/sdk-common";
import { ContextPlugin } from "./context-plugin";
import { ClientCore } from "./internal/core";
import {
  decodeAddMemebersAction,
  decodeRemoveMemebersAction,
  decodeUpdatePluginSettingsAction,
  encodeAddMembersAction,
  encodeAddressListActionInit,
  encodeRemoveMembersAction,
  encodeUpdatePluginSettingsAction,
  getFunctionFragment,
} from "./internal/encoding/plugins";
import {
  DaoAction,
  GasFeeEstimation,
  IInterfaceParams,
  IPluginInstallItem,
  SortDirection,
} from "./internal/interfaces/common";
import {
  AddressListProposal,
  AddressListProposalListItem,
  ExecuteProposalStep,
  ExecuteProposalStepValue,
  IAddressListPluginInstall,
  ICanVoteParams,
  IClientAddressList,
  ICreateProposalParams,
  IExecuteProposalParams,
  IPluginSettings,
  IProposalQueryParams,
  IVoteProposalParams,
  ProposalCreationSteps,
  ProposalCreationStepValue,
  ProposalMetadata,
  ProposalSortBy,
  SubgraphAddressListProposal,
  SubgraphAddressListProposalListItem,
  VoteProposalStep,
  VoteProposalStepValue,
} from "./internal/interfaces/plugins";
import { delay } from "./internal/temp-mock";
import {
  isProposalId,
  toAddressListProposal,
  toAddressListProposalListItem,
} from "./internal/utils/plugins";
import { isAddress } from "@ethersproject/address";
import {
  QueryAddressListProposal,
  QueryAddressListProposals,
} from "./internal/graphql-queries/proposal";
import { QueryAddressListPluginSettings } from "./internal/graphql-queries/settings";

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
     * Checks if an user can vote in a proposal
     *
     * @param {ICanVoteParams} params
     * @returns {*}  {Promise<boolean>}
     */
    canVote: (
      params: ICanVoteParams,
    ): Promise<boolean> => this._canVote(params),
    /**
     * Returns the list of wallet addresses with signing capabilities on the plugin
     *
     * @return {*}  {Promise<string[]>}
     * @memberof ClientAddressList
     */
    getMembers: (daoAddressOrEns: string): Promise<string[]> =>
      this._getMemebers(daoAddressOrEns),
    /**
     * Returns the details of the given proposal
     *
     * @param {string} proposalId
     * @return {*}  {Promise<AddressListProposal>}
     * @memberof ClientAddressList
     */
    getProposal: (proposalId: string): Promise<AddressListProposal | null> =>
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
    getSettings: (pluginAddress: string): Promise<IPluginSettings | null> =>
      this._getSettings(pluginAddress),
  };
  encoding = {
    /**
     * Computes the parameters to be given when creating a proposal that updates the governance configuration
     *
     * @param {string} pluginAddress
     * @param {IPluginSettings} params
     * @return {*}  {DaoAction}
     * @memberof ClientAddressList
     */
    updatePluginSettingsAction: (
      pluginAddress: string,
      params: IPluginSettings,
    ): DaoAction =>
      this._buildUpdatePluginSettingsAction(pluginAddress, params),

    /**
     * Computes the parameters to be given when creating a proposal that adds addresses to address list
     *
     * @param pluginAddress
     * @param members
     * @returns {*} {DaoAction}
     */
    addMembersAction: (pluginAddress: string, members: string[]): DaoAction =>
      this._buildAddMembersAction(pluginAddress, members),

    /**
     * Computes the parameters to be given when creating a proposal that removes addresses from the address list
     *
     * @param pluginAddress
     * @param members
     * @returns {*} {DaoAction}
     */
    removeMembersAction: (
      pluginAddress: string,
      members: string[],
    ): DaoAction => this._buildRemoveMembersAction(pluginAddress, members),
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
     * Decodes a list of addresses from an encoded add members action
     *
     * @param data
     * @returns {*}  {string[]}
     */
    addMembersAction: (data: Uint8Array): string[] =>
      decodeAddMemebersAction(data),

    /**
     * Decodes a list of addresses from an encoded remove members action
     *
     * @param data
     * @returns {*}  {string[]}
     */
    removeMembersAction: (data: Uint8Array): string[] =>
      decodeRemoveMemebersAction(data),

    /**
     * Returns the decoded function info given the encoded data of an action
     *
     * @param {Uint8Array} data
     * @return {*}  {IInterfaceParams | null}
     * @memberof ClientAddressList
     */
    findInterface: (data: Uint8Array): IInterfaceParams | null =>
      this._findInterfaceParams(data),
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
    await delay(1000);
    yield {
      key: ProposalCreationSteps.CREATING,
      txHash:
        "0x0123456789012345678901234567890123456789012345678901234567890123",
    };
    await delay(3000);
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
    await delay(1000);
    yield {
      key: VoteProposalStep.VOTING,
      txHash:
        "0x0123456789012345678901234567890123456789012345678901234567890123",
    };
    await delay(3000);
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
    await delay(1000);
    yield {
      key: ExecuteProposalStep.EXECUTING,
      txHash:
        "0x0123456789012345678901234567890123456789012345678901234567890123",
    };
    await delay(3000);
    yield {
      key: ExecuteProposalStep.DONE,
    };
  }

  private async _canVote(
    params: ICanVoteParams,
  ): Promise<boolean> {
    const signer = this.web3.getConnectedSigner();
    if (!signer.provider) {
      throw new NoProviderError();
    } else if (!isAddress(params.address) || !isAddress(params.pluginAddress)) {
      throw new InvalidAddressError();
    } else if (!isProposalId(params.proposalId)) {
      throw new InvalidProposalIdError();
    }

    // TODO: Implement
    await delay(1000);
    return parseInt(params.address.slice(-1), 16) % 2 === 1;
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

  private async _getProposal(
    proposalId: string,
  ): Promise<AddressListProposal | null> {
    if (!proposalId) {
      throw new InvalidProposalIdError();
    }
    try {
      await this.graphql.ensureOnline();
      const client = this.graphql.getClient();
      const { whitelistProposal: addressListProposal }: {
        whitelistProposal: SubgraphAddressListProposal;
      } = await client.request(
        QueryAddressListProposal,
        {
          proposalId,
        },
      );
      if (!addressListProposal) {
        return null;
      }
      // TODO
      // delete this cid once the proposals in subgraph have the correct
      // format in the metadata field
      const test_cid = "QmXhJawTJ3PkoKMyF3a4D89zybAHjpcGivkb7F1NkHAjpo";
      const metadataString = await this.ipfs.fetchString(test_cid);
      // TODO: Parse and validate schema
      const metadata = JSON.parse(metadataString) as ProposalMetadata;
      return toAddressListProposal(addressListProposal, metadata);
    } catch (err) {
      throw new GraphQLError("AddressList proposal");
    }
  }

  private async _getProposals({
    daoAddressOrEns,
    limit = 0,
    skip = 0,
    direction = SortDirection.ASC,
    sortBy = ProposalSortBy.CREATED_AT,
  }: IProposalQueryParams): Promise<AddressListProposalListItem[]> {
    let where = {};
    let address = daoAddressOrEns;
    if (address) {
      if (!isAddress(address)) {
        await this.web3.ensureOnline();
        const provider = this.web3.getProvider();
        if (!provider) {
          throw new NoProviderError();
        }
        const resolvedAddress = await provider.resolveName(address);
        if (!resolvedAddress) {
          throw new InvalidAddressOrEnsError();
        }
        address = resolvedAddress;
      }
      where = { dao: address };
    }
    try {
      await this.graphql.ensureOnline();
      const client = this.graphql.getClient();
      const { whitelistProposals: addressListProposals }: {
        whitelistProposals: SubgraphAddressListProposalListItem[];
      } = await client.request(
        QueryAddressListProposals,
        {
          where,
          limit,
          skip,
          direction,
          sortBy,
        },
      );
      await this.ipfs.ensureOnline();
      return Promise.all(
        addressListProposals.map(
          (
            proposal: SubgraphAddressListProposalListItem,
          ): Promise<AddressListProposalListItem> => {
            // TODO
            // delete this cid once the proposals in subgraph have the correct
            // format in the metadata field
            const test_cid = "QmXhJawTJ3PkoKMyF3a4D89zybAHjpcGivkb7F1NkHAjpo";
            return this.ipfs.fetchString(test_cid).then(
              (stringMetadata: string) => {
                // TODO: Parse and validate schema
                const metadata = JSON.parse(stringMetadata) as ProposalMetadata;
                return toAddressListProposalListItem(proposal, metadata);
              },
            );
          },
        ),
      );
    } catch {
      throw new GraphQLError("AddressList proposals");
    }
  }

  private _buildUpdatePluginSettingsAction(
    pluginAddress: string,
    params: IPluginSettings,
  ): DaoAction {
    if (!isAddress(pluginAddress)) {
      throw new Error("Invalid plugin address");
    }
    // TODO: check if to and value are correct
    return {
      to: pluginAddress,
      value: BigInt(0),
      data: encodeUpdatePluginSettingsAction(params),
    };
  }

  private _buildAddMembersAction(
    pluginAddress: string,
    members: string[],
  ): DaoAction {
    if (!isAddress(pluginAddress)) {
      throw new InvalidAddressError();
    }
    for (const member of members) {
      if (!isAddress(member)) {
        throw new InvalidAddressError();
      }
    }
    return {
      to: pluginAddress,
      value: BigInt(0),
      data: encodeAddMembersAction(members),
    };
  }

  private _buildRemoveMembersAction(
    pluginAddress: string,
    members: string[],
  ): DaoAction {
    if (!isAddress(pluginAddress)) {
      throw new InvalidAddressError();
    }
    for (const member of members) {
      if (!isAddress(member)) {
        throw new InvalidAddressError();
      }
    }
    return {
      to: pluginAddress,
      value: BigInt(0),
      data: encodeRemoveMembersAction(members),
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

  private async _getSettings(
    pluginAddress: string,
  ): Promise<IPluginSettings | null> {
    if (!isAddress(pluginAddress)) {
      throw new InvalidAddressError();
    }
    try {
      await this.graphql.ensureOnline();
      const client = this.graphql.getClient();
      const { whitelistPackage } = await client.request(
        QueryAddressListPluginSettings,
        {
          address: pluginAddress,
        },
      );
      if (!whitelistPackage) {
        return null;
      }
      return {
        // TODO
        // the number of decimals in the minSupport and minTurnout
        // is wrong, they have no precision
        minDuration: parseInt(whitelistPackage.minDuration),
        minSupport: parseFloat(whitelistPackage.supportRequiredPct),
        minTurnout: parseFloat(whitelistPackage.participationRequiredPct),
      };
    } catch {
      throw new Error("Cannot fetch the settings data from GraphQL");
    }
  }

  private _findInterfaceParams(data: Uint8Array): IInterfaceParams | null {
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
