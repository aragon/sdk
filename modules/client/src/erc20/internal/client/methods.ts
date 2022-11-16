import { isAddress } from "@ethersproject/address";
import {
  GraphQLError,
  InvalidAddressError,
  InvalidAddressOrEnsError,
  InvalidProposalIdError,
  NoProviderError,
  Random,
} from "@aragon/sdk-common";
import { formatEther } from "@ethersproject/units";
import {
  ClientCore,
  computeProposalStatusFilter,
  ContextPlugin,
  ExecuteProposalStep,
  ExecuteProposalStepValue,
  ICanVoteParams,
  ICreateProposalParams,
  IExecuteProposalParams,
  IPluginSettings,
  IProposalQueryParams,
  isProposalId,
  IVoteProposalParams,
  ProposalCreationSteps,
  ProposalCreationStepValue,
  ProposalMetadata,
  ProposalSortBy,
  SortDirection,
  VoteProposalStep,
  VoteProposalStepValue,
} from "../../../client-common";
import {
  Erc20Proposal,
  Erc20ProposalListItem,
  Erc20TokenDetails,
  IClientErc20Methods,
  SubgraphErc20Proposal,
  SubgraphErc20ProposalListItem,
} from "../../interfaces";
import {
  QueryErc20PluginSettings,
  QueryErc20Proposal,
  QueryErc20Proposals,
  QueryToken,
} from "../graphql-queries";
import { toErc20Proposal, toErc20ProposalListItem } from "../utils";
import { ERC20Voting__factory } from "@aragon/core-contracts-ethers";
import { id } from "@ethersproject/hash";
import { toUtf8Bytes } from "@ethersproject/strings";
import { hexZeroPad } from "@ethersproject/bytes";
/**
 * Methods module the SDK ERC20 Client
 */
export class ClientErc20Methods extends ClientCore
  implements IClientErc20Methods {
  constructor(context: ContextPlugin) {
    super(context);
    Object.freeze(ClientErc20Methods.prototype);
    Object.freeze(this);
  }
  /**
   * Creates a new proposal on the given ERC20 plugin contract
   *
   * @param {ICreateProposalParams} params
   * @return {*}  {AsyncGenerator<ProposalCreationStepValue>}
   * @memberof ClientErc20
   */
  public async *createProposal(
    _params: ICreateProposalParams,
  ): AsyncGenerator<ProposalCreationStepValue> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (!signer.provider) {
      throw new Error("A web3 provider is needed");
    }

    const erc20Contract = ERC20Voting__factory.connect(
      _params.pluginAddress,
      signer,
    );

    let cid = "";
    try {
      cid = await this.ipfs.add(JSON.stringify(_params.metadata));
    } catch {
      throw new Error("Could not pin the metadata on IPFS");
    }

    const tx = await erc20Contract.createVote(
      toUtf8Bytes(cid),
      _params.actions || [],
      Math.round(_params.startDate?.getTime() || 0 / 1000),
      Math.round(_params.endDate?.getTime() || 0 / 1000),
      _params.executeOnPass || false,
      _params.creatorVote || 0,
    );

    yield {
      key: ProposalCreationSteps.CREATING,
      txHash: tx.hash,
    };

    const receipt = await tx.wait();
    const addresslistContractInterface = ERC20Voting__factory.createInterface();
    const log = receipt.logs.find(
      (log) =>
        log.topics[0] ===
          id(
            addresslistContractInterface.getEvent("VoteCreated").format(
              "sighash",
            ),
          ),
    );
    if (!log) {
      throw new Error("Failed to create proposal");
    }

    const parsedLog = addresslistContractInterface.parseLog(log);
    if (!parsedLog.args["voteId"]) {
      throw new Error("Failed to create proposal");
    }

    yield {
      key: ProposalCreationSteps.DONE,
      proposalId: hexZeroPad(parsedLog.args["voteId"].toHexString(), 32),
    };
  }
  /**
   * Cast a vote on the given proposal using the client's wallet. Depending on the proposal settings, an affirmative vote may execute the proposal's actions on the DAO.
   *
   * @param {IVoteProposalParams} params
   * @param {VoteValues} vote
   * @return {*}  {AsyncGenerator<VoteProposalStepValue>}
   * @memberof ClientErc20
   */
  public async *voteProposal(
    _params: IVoteProposalParams,
  ): AsyncGenerator<VoteProposalStepValue> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (!signer.provider) {
      throw new Error("A web3 provider is needed");
    }

    const erc20VotingContract = ERC20Voting__factory.connect(
      _params.pluginAddress,
      signer,
    );

    const tx = await erc20VotingContract.vote(
      _params.proposalId,
      _params.vote,
      false,
    );

    yield {
      key: VoteProposalStep.VOTING,
      txHash: tx.hash,
    };

    await tx.wait();

    yield {
      key: VoteProposalStep.DONE,
      voteId: hexZeroPad(_params.proposalId, 32),
    };
  }
  /**
   * Executes the given proposal, provided that it has already passed
   *
   * @param {IExecuteProposalParams} params
   * @return {*}  {AsyncGenerator<ExecuteProposalStepValue>}
   * @memberof ClientErc20
   */
  public async *executeProposal(
    _params: IExecuteProposalParams,
  ): AsyncGenerator<ExecuteProposalStepValue> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (!signer.provider) {
      throw new Error("A web3 provider is needed");
    }

    const erc20VotingContract = ERC20Voting__factory.connect(
      _params.pluginAddress,
      signer,
    );
    const tx = await erc20VotingContract.execute(_params.proposalId);

    yield {
      key: ExecuteProposalStep.EXECUTING,
      txHash: tx.hash,
    };
    await tx.wait();
    yield {
      key: ExecuteProposalStep.DONE,
    };
  }

  /**
   * Checks if an user can vote in a proposal
   *
   * @param {ICanVoteParams} params
   * @returns {*}  {Promise<boolean>}
   */
  public async canVote(params: ICanVoteParams): Promise<boolean> {
    const signer = this.web3.getConnectedSigner();
    if (!signer.provider) {
      throw new NoProviderError();
    } else if (!isAddress(params.address) || !isAddress(params.pluginAddress)) {
      throw new InvalidAddressError();
    }

    const erc20VotingContract = ERC20Voting__factory.connect(
      params.pluginAddress,
      signer,
    );
    return erc20VotingContract.callStatic.canVote(
      params.proposalId,
      params.address,
    );
  }

  /**
   * Returns the list of wallet addresses holding tokens from the underlying ERC20 contract used by the plugin
   *
   * @return {*}  {Promise<string[]>}
   * @memberof ClientErc20
   */
  public getMembers(_daoAddressOrEns: string): Promise<string[]> {
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

  /**
   * Returns the details of the given proposal
   *
   * @param {string} proposalId
   * @return {*}  {Promise<Erc20Proposal>}
   * @memberof ClientErc20
   */
  public async getProposal(proposalId: string): Promise<Erc20Proposal | null> {
    if (!isProposalId(proposalId)) {
      throw new InvalidProposalIdError();
    }
    try {
      await this.graphql.ensureOnline();
      const client = this.graphql.getClient();
      const {
        erc20VotingProposal,
      }: {
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
  /**
   * Returns a list of proposals on the Plugin, filtered by the given criteria
   *
   * @param {IProposalQueryParams} params
   * @return {*}  {Promise<Erc20ProposalListItem[]>}
   * @memberof ClientErc20
   */
  public async getProposals({
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
      const {
        erc20VotingProposals,
      }: {
        erc20VotingProposals: SubgraphErc20ProposalListItem[];
      } = await client.request(QueryErc20Proposals, {
        where,
        limit,
        skip,
        direction,
        sortBy,
      });
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
            return this.ipfs
              .fetchString(test_cid)
              .then((stringMetadata: string) => {
                // TODO: Parse and validate schema¡
                const metadata = JSON.parse(stringMetadata) as ProposalMetadata;
                return toErc20ProposalListItem(proposal, metadata);
              });
          },
        ),
      );
    } catch {
      throw new GraphQLError("ERC20 proposals");
    }
  }

  /**
   * Returns the settings of a plugin given the address of the plugin instance
   *
   * @param {string} pluginAddress
   * @return {*}  {Promise<IPluginSettings>}
   * @memberof ClientErc20
   */
  public async getSettings(
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

  /**
   * Returns the details of the token used in a specific plugin instance
   *
   * @param {string} pluginAddress
   * @return {*}  {Promise<Erc20TokenDetails | null>}
   * @memberof ClientErc20
   */
  public async getToken(
    pluginAddress: string,
  ): Promise<Erc20TokenDetails | null> {
    if (!isAddress(pluginAddress)) {
      throw new InvalidAddressError();
    }
    try {
      await this.graphql.ensureOnline();
      const client = this.graphql.getClient();
      const { erc20VotingPackage } = await client.request(QueryToken, {
        address: pluginAddress,
      });
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
}
