import {
  Erc20Proposal,
  Erc20ProposalListItem,
  Erc20TokenDetails,
  ExecuteProposalStep,
  ExecuteProposalStepValue,
  ICanVoteParams,
  IClientErc20,
  ICreateProposalParams,
  IErc20PluginInstall,
  IExecuteProposalParams,
  IMintTokenParams,
  IPluginSettings,
  IProposalQueryParams,
  IVoteProposalParams,
  ProposalCreationSteps,
  ProposalCreationStepValue,
  ProposalMetadata,
  ProposalSortBy,
  SubgraphErc20Proposal,
  SubgraphErc20ProposalListItem,
  VoteProposalStep,
  VoteProposalStepValue,
  VoteValues,
} from "./internal/interfaces/plugins";
import { IDAO } from "@aragon/core-contracts-ethers";
import { ClientCore } from "./internal/core";
import {
  DaoAction,
  GasFeeEstimation,
  IInterfaceParams,
  IPluginInstallItem,
  SortDirection,
} from "./internal/interfaces/common";
import { ContextPlugin } from "./context-plugin";
import {
  computeProposalStatusFilter,
  isProposalId,
  toErc20Proposal,
  toErc20ProposalListItem,
} from "./internal/utils/plugins";
import {
  decodeMintTokenAction,
  decodeUpdatePluginSettingsAction,
  encodeErc20ActionInit,
  encodeMintTokenAction,
  encodeUpdatePluginSettingsAction,
  getFunctionFragment,
} from "./internal/encoding/plugins";
import {
  bytesToHex,
  GraphQLError,
  InvalidAddressError,
  InvalidAddressOrEnsError,
  InvalidProposalIdError,
  NoProviderError,
  Random,
} from "@aragon/sdk-common";
import { delay } from "./internal/temp-mock";
import { isAddress } from "@ethersproject/address";
import {
  QueryErc20Proposal,
  QueryErc20Proposals,
} from "./internal/graphql-queries/proposal";
import { formatEther } from "@ethersproject/units";
import { QueryErc20PluginSettings } from "./internal/graphql-queries/settings";
import { QueryToken } from "./internal/graphql-queries/token";

// NOTE: This address needs to be set when the plugin has been published and the ID is known
const PLUGIN_ID = "0x1234567890123456789012345678901234567890";
/**
 * Provider a generic client with high level methods to manage and interact an ERC20 Voting plugin installed in a DAO
 */
export class ClientErc20 extends ClientCore implements IClientErc20 {
  constructor(context: ContextPlugin) {
    super(context);
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
    createProposal: (
      params: ICreateProposalParams,
    ): AsyncGenerator<ProposalCreationStepValue> =>
      this._createProposal(params),
    /**
     * Cast a vote on the given proposal using the client's wallet. Depending on the proposal settings, an affirmative vote may execute the proposal's actions on the DAO.
     *
     * @param {IVoteProposalParams} params
     * @param {VoteValues} vote
     * @return {*}  {AsyncGenerator<VoteProposalStepValue>}
     * @memberof ClientErc20
     */
    voteProposal: (
      params: IVoteProposalParams,
    ): AsyncGenerator<VoteProposalStepValue> => this._voteProposal(params),
    /**
     * Executes the given proposal, provided that it has already passed
     *
     * @param {IExecuteProposalParams} params
     * @return {*}  {AsyncGenerator<ExecuteProposalStepValue>}
     * @memberof ClientErc20
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
     * Returns the list of wallet addresses holding tokens from the underlying ERC20 contract used by the plugin
     *
     * @return {*}  {Promise<string[]>}
     * @memberof ClientErc20
     */
    getMembers: (daoAddressOrEns: string): Promise<string[]> =>
      this._getMembers(daoAddressOrEns),
    /**
     * Returns the details of the given proposal
     *
     * @param {string} proposalId
     * @return {*}  {Promise<Erc20Proposal>}
     * @memberof ClientErc20
     */
    getProposal: (proposalId: string): Promise<Erc20Proposal | null> =>
      this._getProposal(proposalId),
    /**
     * Returns a list of proposals on the Plugin, filtered by the given criteria
     *
     * @param {IProposalQueryParams} params
     * @return {*}  {Promise<Erc20ProposalListItem[]>}
     * @memberof ClientErc20
     */
    getProposals: (
      params?: IProposalQueryParams,
    ): Promise<Erc20ProposalListItem[]> => this._getProposals(params ?? {}),
    /**
     * Returns the settings of a plugin given the address of the plugin instance
     *
     * @param {string} pluginAddress
     * @return {*}  {Promise<IPluginSettings>}
     * @memberof ClientErc20
     */
    getSettings: (pluginAddress: string): Promise<IPluginSettings | null> =>
      this._getSettings(pluginAddress),
    /**
     * Returns the details of the token used in a specific plugin instance
     *
     * @param {string} pluginAddress
     * @return {*}  {Promise<Erc20TokenDetails | null>}
     * @memberof ClientErc20
     */
    getToken: (pluginAddress: string): Promise<Erc20TokenDetails | null> =>
      this._getToken(pluginAddress),
  };

  //// ACTION BUILDERS

  /** Contains the helpers to encode actions and parameters that can be passed as a serialized buffer on-chain */
  encoding = {
    /**
     * Computes the parameters to be given when creating a proposal that updates the governance configuration
     *
     * @param {string} pluginAddress
     * @param {IPluginSettings} params
     * @return {*}  {DaoAction}
     * @memberof ClientErc20
     */
    updatePluginSettingsAction: (
      pluginAddress: string,
      params: IPluginSettings,
    ): DaoAction =>
      this._buildUpdatePluginSettingsAction(pluginAddress, params),
    /**
     * Computes the parameters to be given when creating a proposal that mints an amount of ERC-20 tokens to an address
     *
     * @param minterAddress
     * @param params
     * @returns {*}  {DaoAction}
     * @memberof ClientErc20
     */
    mintTokenAction: (
      minterAddress: string,
      params: IMintTokenParams,
    ): DaoAction => this._buildMintTokenAction(minterAddress, params),
  };
  decoding = {
    /**
     * Decodes a dao metadata from an encoded update metadata action
     *
     * @param {Uint8Array} data
     * @return {*}  {IPluginSettings}
     * @memberof ClientErc20
     */
    updatePluginSettingsAction: (data: Uint8Array): IPluginSettings =>
      decodeUpdatePluginSettingsAction(data),
    /**
     * Decodes the mint token params from an encoded mint token action
     *
     * @param data
     * @returns {*}  {IMintTokenParams}
     */
    mintTokenAction: (data: Uint8Array): IMintTokenParams =>
      decodeMintTokenAction(data),
    /**
     * Returns the decoded function info given the encoded data of an action
     *
     * @param {Uint8Array} data
     * @return {*}  {IInterfaceParams | null}
     * @memberof ClientErc20
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
     * @memberof ClientErc20
     */
    getPluginInstallItem: (params: IErc20PluginInstall): IPluginInstallItem => {
      return {
        // id: this._pluginAddress,
        id: PLUGIN_ID,
        data: encodeErc20ActionInit(params),
      };
    },
  };
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
    createProposal: (
      params: ICreateProposalParams,
    ): Promise<GasFeeEstimation> => this._estimateCreateProposal(params),

    /**
     * Estimates the gas fee of casting a vote on a proposal
     *
     * @param {IVoteProposalParams} params
     * @param {VoteValues} vote
     * @return {*}  {Promise<GasFeeEstimation>}
     * @memberof ClientErc20
     */
    voteProposal: (params: IVoteProposalParams): Promise<GasFeeEstimation> =>
      this._estimateVoteProposal(params),

    /**
     * Estimates the gas fee of executing an ERC20 proposal
     *
     * @param {IExecuteProposalParams} params
     * @return {*}  {Promise<GasFeeEstimation>}
     * @memberof ClientErc20
     */
    executeProposal: (
      params: IExecuteProposalParams,
    ): Promise<GasFeeEstimation> => this._estimateExecuteProposal(params),
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

  private async *_voteProposal(
    _pluginInstanceAddres: IVoteProposalParams,
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

  //// PRIVATE ACTION BUILDER HANDLERS
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

  private _buildMintTokenAction(
    minterAddress: string,
    params: IMintTokenParams,
  ): DaoAction {
    if (!isAddress(minterAddress) || !isAddress(params.address)) {
      throw new InvalidAddressError();
    }
    return {
      to: minterAddress,
      value: BigInt(0),
      data: encodeMintTokenAction(params),
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

    // TODO: Remove below as the new contracts are ready

    return Promise.resolve(
      this.web3.getApproximateGasFee(Random.getBigInt(BigInt(1500))),
    );

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
  private _estimateVoteProposal(
    _params: IVoteProposalParams,
  ): Promise<GasFeeEstimation> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (!signer.provider) {
      throw new Error("A web3 provider is needed");
    }
    // TODO: remove this
    return Promise.resolve(
      this.web3.getApproximateGasFee(Random.getBigInt(BigInt(1500))),
    );
  }

  // @ts-ignore  TODO: Remove this comment when implemented
  private _estimateExecuteProposal(
    _params: IExecuteProposalParams,
  ): Promise<GasFeeEstimation> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (!signer.provider) {
      throw new Error("A web3 provider is needed");
    }
    // TODO: remove this
    return Promise.resolve(
      this.web3.getApproximateGasFee(Random.getBigInt(BigInt(1500))),
    );
  }

  private _getMembers(_daoAddressOrEns: string): Promise<string[]> {
    // TODO: Implement

    const mockAddresses = [
      "0x8367dc645e31321CeF3EeD91a10a5b7077e21f70",
      "0xDA9dfA130Df4dE4673b89022EE50ff26f6EA73Cf",
      "0xBE0eB53F46cd790Cd13851d5EFf43D12404d33E8",
      "0x2dB75d8404144CD5918815A44B8ac3f4DB2a7FAf",
      "0xc1d60f584879f024299DA0F19Cdb47B931E35b53",
    ];

    return new Promise((resolve) => setTimeout(resolve, 1000)).then(() =>
      mockAddresses.filter(() => Random.getFloat() > 0.4)
    );
  }

  private async _getProposal(
    proposalId: string,
  ): Promise<Erc20Proposal | null> {
    if (!isProposalId(proposalId)) {
      throw new InvalidProposalIdError();
    }
    try {
      await this.graphql.ensureOnline();
      const client = this.graphql.getClient();
      const { erc20VotingProposal }: {
        erc20VotingProposal: SubgraphErc20Proposal;
      } = await client.request(QueryErc20Proposal, {
        proposalId,
      });
      if (!erc20VotingProposal) {
        return null;
      }
      // TODO
      // delete this cid once the proposals in subgraph have the correct
      // format in the metadata field
      const test_cid = "QmXhJawTJ3PkoKMyF3a4D89zybAHjpcGivkb7F1NkHAjpo";
      const metadataString = await this.ipfs.fetchString(test_cid);
      // TODO: Parse and validate schema
      const metadata = JSON.parse(metadataString) as ProposalMetadata;
      return toErc20Proposal(erc20VotingProposal, metadata);
    } catch (err) {
      throw new GraphQLError("ERC20 proposal");
    }
  }

  private async _getProposals({
    daoAddressOrEns,
    limit = 10,
    status,
    skip = 0,
    direction = SortDirection.ASC,
    sortBy = ProposalSortBy.CREATED_AT,
  }: IProposalQueryParams): Promise<Erc20ProposalListItem[]> {
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
    if (status) {
      where = { ...where, ...computeProposalStatusFilter(status) };
    }
    try {
      await this.graphql.ensureOnline();
      const client = this.graphql.getClient();
      const { erc20VotingProposals }: {
        erc20VotingProposals: SubgraphErc20ProposalListItem[];
      } = await client.request(
        QueryErc20Proposals,
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
        erc20VotingProposals.map(
          (
            proposal: SubgraphErc20ProposalListItem,
          ): Promise<Erc20ProposalListItem> => {
            // TODO
            // delete this cid once the proposals in subgraph have the correct
            // format in the metadata field
            const test_cid = "QmXhJawTJ3PkoKMyF3a4D89zybAHjpcGivkb7F1NkHAjpo";
            return this.ipfs.fetchString(test_cid).then(
              (stringMetadata: string) => {
                // TODO: Parse and validate schema¡
                const metadata = JSON.parse(stringMetadata) as ProposalMetadata;
                return toErc20ProposalListItem(proposal, metadata);
              },
            );
          },
        ),
      );
    } catch {
      throw new GraphQLError("ERC20 proposals");
    }
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
      const { erc20VotingPackage } = await client.request(
        QueryErc20PluginSettings,
        {
          address: pluginAddress,
        },
      );
      if (!erc20VotingPackage) {
        return null;
      }
      return {
        minDuration: parseInt(erc20VotingPackage.minDuration),
        // TODO: use decodeRatio() when ready
        minSupport: parseFloat(
          formatEther(erc20VotingPackage.supportRequiredPct),
        ),
        minTurnout: parseFloat(
          formatEther(erc20VotingPackage.participationRequiredPct),
        ),
      };
    } catch {
      throw new GraphQLError("plugin settings");
    }
  }

  private async _getToken(
    pluginAddress: string,
  ): Promise<Erc20TokenDetails | null> {
    if (!isAddress(pluginAddress)) {
      throw new InvalidAddressError();
    }
    try {
      await this.graphql.ensureOnline();
      const client = this.graphql.getClient();
      const { erc20VotingPackage } = await client.request(
        QueryToken,
        {
          address: pluginAddress,
        },
      );
      if (!erc20VotingPackage) {
        return null;
      }
      return {
        address: erc20VotingPackage.token.id,
        decimals: parseInt(erc20VotingPackage.token.decimals),
        name: erc20VotingPackage.token.name,
        symbol: erc20VotingPackage.token.symbol,
      };
    } catch (err) {
      throw new GraphQLError("token");
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

//// PARAMETER MANAGERS

// @ts-ignore TODO: Remove when contracts are available
function unwrapProposalParams(
  params: ICreateProposalParams,
): [ProposalMetadata, IDAO.ActionStruct[], number, number, boolean, number] {
  return [
    params.metadata,
    params.actions ?? [],
    // TODO: Verify => seconds?
    params.startDate ? Math.floor(params.startDate.getTime() / 1000) : 0,
    // TODO: Verify => seconds?
    params.endDate ? Math.floor(params.endDate.getTime() / 1000) : 0,
    params.executeOnPass ?? false,
    params.creatorVote ?? VoteValues.ABSTAIN,
  ];
}
