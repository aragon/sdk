import {
  bytesToHex,
  GraphQLError,
  hexToBytes,
  InvalidAddressError,
  InvalidAddressOrEnsError,
  InvalidProposalIdError,
  Random,
  RequiredProviderError,
  strip0x,
} from "@aragon/sdk-common";
import { ContextPlugin } from "./context-plugin";
import { ClientCore } from "./internal/core";
import {
  decodeUpdatePluginSettingsAction,
  encodeAddressListActionInit,
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
  VoteProposalStep,
  VoteProposalStepValue,
  VoteValues,
} from "./internal/interfaces/plugins";
import { delay } from "./internal/temp-mock";
import { computeProposalStatus } from "./internal/utils/plugins";
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
      const { whitelistProposal } = await client.request(
        QueryAddressListProposal,
        {
          proposalId,
        },
      );
      if (!whitelistProposal) {
        return null;
      }
      // TODO
      // delete this cid once the proposals in subgraph have the correct
      // format in the metadata field
      const test_cid = "QmXhJawTJ3PkoKMyF3a4D89zybAHjpcGivkb7F1NkHAjpo";
      const metadataString = await this.ipfs.fetchString(test_cid);
      // TODO: Parse and validate schema
      const metadata = JSON.parse(metadataString) as ProposalMetadata;
      const startDate = new Date(
        parseInt(whitelistProposal.startDate) * 1000,
      );
      const endDate = new Date(parseInt(whitelistProposal.endDate) * 1000);
      const creationDate = new Date(
        parseInt(whitelistProposal.createdAt) * 1000,
      );
      // get status
      const status = computeProposalStatus(
        startDate,
        endDate,
        whitelistProposal.executed,
        whitelistProposal
          .yea,
        whitelistProposal.nay,
      );
      // get start and end date
      return {
        id: whitelistProposal.id,
        dao: {
          address: whitelistProposal.dao.id,
          name: whitelistProposal.dao.name,
        },
        creatorAddress: whitelistProposal.creator,
        metadata: {
          title: metadata.title,
          summary: metadata.summary,
          description: metadata.description,
          resources: metadata.resources,
          media: metadata.media,
        },
        startDate,
        endDate,
        creationDate,
        actions: whitelistProposal.actions.map(
          (action: { data: string; to: string; value: string }): DaoAction => {
            return {
              data: hexToBytes(strip0x(action.data)),
              to: action.to,
              value: BigInt(action.value),
            };
          },
        ),
        status,
        result: {
          yes: whitelistProposal.yea ? parseInt(whitelistProposal.yea) : 0,
          no: whitelistProposal.yea ? parseInt(whitelistProposal.nay) : 0,
          abstain: whitelistProposal.yea
            ? parseInt(whitelistProposal.abstain)
            : 0,
        },
        settings: {
          // TODO
          // this should be decoded using the number of decimals that we want
          // right now the encoders/recoders use 2 digit precission but the actual
          // subgraph values are 18 digits precision. Uncomment below for 2 digits
          // precision

          // minSupport: decodeRatio(
          //   BigInt(whitelistProposal.supportRequiredPct),
          //   2,
          // ),
          // minTurnout: decodeRatio(
          //   BigInt(whitelistProposal.participationRequiredPct),
          //   2,
          // ),
          // TODO DELETE ME
          minSupport: parseFloat(
            whitelistProposal.supportRequiredPct,
          ),
          minTurnout: parseFloat(
            whitelistProposal.participationRequiredPct,
          ),
          duration: parseInt(whitelistProposal.endDate) -
            parseInt(whitelistProposal.startDate),
        },
        totalVotingWeight: parseInt(whitelistProposal.votingPower),
        votes: whitelistProposal.voters.map(
          (voter: { voter: { id: string }; vote: string; weight: string }) => {
            let vote;
            switch (voter.vote) {
              case "Yea":
                vote = VoteValues.YES;
                break;
              case "Nay":
                vote = VoteValues.NO;
                break;
              case "Abstain":
                vote = VoteValues.ABSTAIN;
                break;
            }
            return {
              address: voter.voter.id,
              vote,
            };
          },
        ),
      };
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
        await this.web3.ensureOnline()
        const provider = this.web3.getProvider();
        if (!provider) {
          throw new RequiredProviderError();
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
      const { whitelistProposals } = await client.request(
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
        whitelistProposals.map(
          async (proposal: any): Promise<AddressListProposalListItem> => {
            // TODO
            // delete this cid once the proposals in subgraph have the correct
            // format in the metadata field
            const test_cid = "QmXhJawTJ3PkoKMyF3a4D89zybAHjpcGivkb7F1NkHAjpo";
            const metadataString = await this.ipfs.fetchString(test_cid);
            // TODO: Parse and validate schema
            const metadata = JSON.parse(metadataString) as ProposalMetadata;
            const startDate = new Date(
              parseInt(proposal.startDate) * 1000,
            );
            const endDate = new Date(parseInt(proposal.endDate) * 1000);
            // get status
            const status = computeProposalStatus(
              startDate,
              endDate,
              proposal.executed,
              proposal
                .yea,
              proposal.nay,
            );
            // add proposal to list
            return {
              id: proposal.id,
              dao: {
                address: proposal.dao.id,
                name: proposal.dao.name,
              },
              creatorAddress: proposal.creator,
              metadata: {
                title: metadata.title,
                summary: metadata.summary,
              },
              startDate,
              endDate,
              status,
              result: {
                yes: proposal.yea ? parseInt(proposal.yea) : 0,
                no: proposal.yea ? parseInt(proposal.nay) : 0,
                abstain: proposal.yea ? parseInt(proposal.abstain) : 0,
              },
            };
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
