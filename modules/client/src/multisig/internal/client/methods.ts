import {
  GraphQLError,
  InvalidAddressError,
  InvalidAddressOrEnsError,
  InvalidCidError,
  IpfsPinError,
  NoProviderError,
  NoSignerError,
  ProposalCreationError,
  resolveIpfsCid,
} from "@aragon/sdk-common";
import { isAddress } from "@ethersproject/address";
import {
  ApproveMultisigProposalParams,
  ApproveProposalStep,
  ApproveProposalStepValue,
  CanApproveParams,
  CreateMultisigProposalParams,
  ExecuteProposalParams,
  IMultisigClientMethods,
  MultisigProposal,
  MultisigProposalListItem,
  MultisigVotingSettings,
  SubgraphMultisigMembers,
  SubgraphMultisigProposal,
  SubgraphMultisigProposalListItem,
  SubgraphMultisigVotingSettings,
} from "../../interfaces";
import {
  addressOrEnsSchema,
  addressSchema,
  CanExecuteParams,
  ClientCore,
  computeProposalStatusFilter,
  ContextPlugin,
  executeProposalParamsSchema,
  ExecuteProposalStep,
  ExecuteProposalStepValue,
  findLog,
  IProposalQueryParams,
  ProposalCreationSteps,
  ProposalCreationStepValue,
  proposalIdSchema,
  ProposalMetadata,
  proposalMetadataSchema,
  ProposalSortBy,
  SortDirection,
} from "../../../client-common";
import {
  UNAVAILABLE_PROPOSAL_METADATA,
  UNSUPPORTED_PROPOSAL_METADATA_LINK,
} from "../../../client-common/constants";
import { Multisig__factory } from "@aragon/core-contracts-ethers";
import {
  QueryMultisigProposal,
  QueryMultisigProposals,
  QueryMultisigVotingSettings,
} from "../graphql-queries";
import { toMultisigProposal, toMultisigProposalListItem } from "../utils";
import { toUtf8Bytes } from "@ethersproject/strings";
import { QueryMultisigMembers } from "../graphql-queries/members";
import { approveMultisigProposalSchema, canApproveSchema, canExecuteSchema, createMultisigProposalSchema } from "../schemas";

/**
 * Methods module the SDK Address List Client
 */
export class MultisigClientMethods extends ClientCore
  implements IMultisigClientMethods {
  constructor(context: ContextPlugin) {
    super(context);
  }
  /**
   * Creates a new proposal on the given multisig plugin contract
   *
   * @param {CreateMultisigProposalParams} params
   * @return {*}  {AsyncGenerator<ProposalCreationStepValue>}
   * @memberof MultisigClientMethods
   */
  public async *createProposal(
    params: CreateMultisigProposalParams,
  ): AsyncGenerator<ProposalCreationStepValue> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new NoSignerError();
    } else if (!signer.provider) {
      throw new NoProviderError();
    }

    createMultisigProposalSchema.validateSync(params)

    const multisigContract = Multisig__factory.connect(
      params.pluginAddress,
      signer,
    );

    const tx = await multisigContract.createProposal(
      toUtf8Bytes(params.metadataUri),
      params.actions || [],
      params.approve || false,
      params.tryExecution || true,
    );

    yield {
      key: ProposalCreationSteps.CREATING,
      txHash: tx.hash,
    };

    const receipt = await tx.wait();
    const multisigContractInterface = Multisig__factory
      .createInterface();
    const log = findLog(
      receipt,
      multisigContractInterface,
      "ProposalCreated",
    );
    if (!log) {
      throw new ProposalCreationError();
    }

    const parsedLog = multisigContractInterface.parseLog(log);
    const proposalId = parsedLog.args["proposalId"];
    if (!proposalId) {
      throw new ProposalCreationError();
    }

    yield {
      key: ProposalCreationSteps.DONE,
      proposalId: BigInt(proposalId),
    };
  }

  /**
   * Pins a metadata object into IPFS and retruns the generated hash
   *
   * @param {ProposalMetadata} params
   * @return {*}  {Promise<string>}
   * @memberof MultisigClientMethods
   */
  public async pinMetadata(params: ProposalMetadata): Promise<string> {
    proposalMetadataSchema.validateSync(params)
    try {
      const cid = await this.ipfs.add(JSON.stringify(params));
      await this.ipfs.pin(cid);
      return `ipfs://${cid}`;
    } catch {
      throw new IpfsPinError();
    }
  }
  /**
   * Allow a wallet in the multisig give approval to a proposal
   *
   * @param {ApproveMultisigProposalParams} params
   * @return {*}  {AsyncGenerator<ApproveProposalStepValue>}
   * @memberof MultisigClientMethods
   */
  public async *approveProposal(
    params: ApproveMultisigProposalParams,
  ): AsyncGenerator<ApproveProposalStepValue> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new NoSignerError();
    } else if (!signer.provider) {
      throw new NoProviderError();
    }
    approveMultisigProposalSchema.validateSync(params)
    if (!isAddress(params.pluginAddress)) {
      throw new InvalidAddressError();
    }
    const multisigContract = Multisig__factory.connect(
      params.pluginAddress,
      signer,
    );

    const tx = await multisigContract.approve(
      params.proposalId,
      params.tryExecution,
    );

    yield {
      key: ApproveProposalStep.APPROVING,
      txHash: tx.hash,
    };

    await tx.wait();

    yield {
      key: ApproveProposalStep.DONE,
    };
  }
  /**
   * Allow a wallet in the multisig give approval to a proposal
   *
   * @param {params} ExecuteProposalParams
   * @return {*}  {AsyncGenerator<ExecuteMultisigProposalStepValue>}
   * @memberof MultisigClientMethods
   */
  public async *executeProposal(
    params: ExecuteProposalParams,
  ): AsyncGenerator<ExecuteProposalStepValue> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new NoSignerError();
    } else if (!signer.provider) {
      throw new NoProviderError();
    }
    executeProposalParamsSchema.validateSync(params)
    const multisigContract = Multisig__factory.connect(
      params.pluginAddress,
      signer,
    );

    const tx = await multisigContract.execute(
      params.proposalId,
    );

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
   * Returns the list of wallet addresses with signing capabilities on the plugin
   *
   * @param {string} addressOrEns
   * @return {*}  {Promise<boolean>}
   * @memberof MultisigClientMethods
   */
  public async canApprove(
    params: CanApproveParams,
  ): Promise<boolean> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new NoSignerError();
    } else if (!signer.provider) {
      throw new NoProviderError();
    }
    canApproveSchema.validateSync(params)
    const multisigContract = Multisig__factory.connect(
      params.pluginAddress,
      signer,
    );

    return multisigContract.canApprove(params.proposalId, params.addressOrEns);
  }
  /**
   * Returns the list of wallet addresses with signing capabilities on the plugin
   *
   * @param {string} addressOrEns
   * @return {*}  {Promise<boolean>}
   * @memberof MultisigClientMethods
   */
  public async canExecute(
    params: CanExecuteParams,
  ): Promise<boolean> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new NoSignerError();
    } else if (!signer.provider) {
      throw new NoProviderError();
    }
    canExecuteSchema.validateSync(params)
    if (!isAddress(params.pluginAddress)) {
      throw new InvalidAddressError();
    }
    const multisigContract = Multisig__factory.connect(
      params.pluginAddress,
      signer,
    );

    return multisigContract.canExecute(params.proposalId);
  }
  /**
   * returns the voting settings
   *
   * @param {string} addressOrEns
   * @return {*}  {Promise<MultisigVotingSettings>}
   * @memberof MultisigClientMethods
   */
  public async getVotingSettings(
    address: string,
  ): Promise<MultisigVotingSettings> {
    addressSchema.validateSync(address)
    try {
      await this.graphql.ensureOnline();
      const client = this.graphql.getClient();
      const { multisigPlugin }: {
        multisigPlugin: SubgraphMultisigVotingSettings;
      } = await client.request(QueryMultisigVotingSettings, {
        address,
      });
      return {
        onlyListed: multisigPlugin.onlyListed,
        minApprovals: parseInt(multisigPlugin.minApprovals),
      };
    } catch {
      throw new GraphQLError("Multisig settings");
    }
  }
  /**
   * returns the members of the multisig
   *
   * @param {string} addressOrEns
   * @return {*}  {Promise<string[]>}
   * @memberof MultisigClientMethods
   */
  public async getMembers(
    addressOrEns: string,
  ): Promise<string[]> {
    addressOrEnsSchema.validateSync(addressOrEns)
    try {
      await this.graphql.ensureOnline();
      const client = this.graphql.getClient();
      const { multisigPlugin }: {
        multisigPlugin: SubgraphMultisigMembers;
      } = await client.request(QueryMultisigMembers, {
        addressOrEns,
      });
      return multisigPlugin.members.map((member) => member.address);
    } catch {
      throw new GraphQLError("Multisig members");
    }
  }
  /**
   * Returns the details of the given proposal
   *
   * @param {string} proposalId
   * @return {*}  {(Promise<MultisigProposal | null>)}
   * @memberof MultisigClientMethods
   */
  public async getProposal(
    proposalId: string,
  ): Promise<MultisigProposal | null> {
    proposalIdSchema.validateSync(proposalId)
    try {
      await this.graphql.ensureOnline();
      const client = this.graphql.getClient();
      const {
        multisigProposal,
      }: {
        multisigProposal: SubgraphMultisigProposal;
      } = await client.request(QueryMultisigProposal, {
        proposalId,
      });
      if (!multisigProposal) {
        return null;
      }
      try {
        const metadataCid = resolveIpfsCid(multisigProposal.metadata);
        const metadataString = await this.ipfs.fetchString(metadataCid);
        const metadata = JSON.parse(metadataString) as ProposalMetadata;
        return toMultisigProposal(multisigProposal, metadata);
        // TODO: Parse and validate schema
      } catch (err) {
        if (err instanceof InvalidCidError) {
          return toMultisigProposal(
            multisigProposal,
            UNSUPPORTED_PROPOSAL_METADATA_LINK,
          );
        }
        return toMultisigProposal(
          multisigProposal,
          UNAVAILABLE_PROPOSAL_METADATA,
        );
      }
    } catch (err) {
      throw new GraphQLError("Multisig proposal");
    }
  }

  /**
   * Returns a list of proposals on the Plugin, filtered by the given criteria
   *
   * @param {IProposalQueryParams} {
   *       daoAddressOrEns,
   *       limit = 10,
   *       status,
   *       skip = 0,
   *       direction = SortDirection.ASC,
   *       sortBy = ProposalSortBy.CREATED_AT,
   *     }
   * @return {*}  {Promise<MultisigProposalListItem[]>}
   * @memberof MultisigClientMethods
   */
  public async getProposals({
    daoAddressOrEns,
    limit = 10,
    status,
    skip = 0,
    direction = SortDirection.ASC,
    sortBy = ProposalSortBy.CREATED_AT,
  }: IProposalQueryParams): Promise<MultisigProposalListItem[]> {
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
        multisigProposals,
      }: {
        multisigProposals: SubgraphMultisigProposalListItem[];
      } = await client.request(QueryMultisigProposals, {
        where,
        limit,
        skip,
        direction,
        sortBy,
      });
      await this.ipfs.ensureOnline();
      return Promise.all(
        multisigProposals.map(
          async (
            proposal: SubgraphMultisigProposalListItem,
          ): Promise<MultisigProposalListItem> => {
            // format in the metadata field
            try {
              const metadataCid = resolveIpfsCid(proposal.metadata);
              const stringMetadata = await this.ipfs.fetchString(metadataCid);
              const metadata = JSON.parse(stringMetadata) as ProposalMetadata;
              return toMultisigProposalListItem(proposal, metadata);
            } catch (err) {
              if (err instanceof InvalidCidError) {
                return toMultisigProposalListItem(
                  proposal,
                  UNSUPPORTED_PROPOSAL_METADATA_LINK,
                );
              }
              return toMultisigProposalListItem(
                proposal,
                UNAVAILABLE_PROPOSAL_METADATA,
              );
            }
          },
        ),
      );
    } catch {
      throw new GraphQLError("Multisig proposals");
    }
  }
}
