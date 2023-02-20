import {
  boolArrayToBitmap,
  decodeProposalId,
  encodeProposalId,
  GraphQLError,
  InvalidAddressOrEnsError,
  InvalidCidError,
  InvalidProposalIdError,
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
  ClientCore,
  computeProposalStatusFilter,
  ContextPlugin,
  ExecuteProposalStep,
  ExecuteProposalStepValue,
  findLog,
  IProposalQueryParams,
  isProposalId,
  ProposalCreationSteps,
  ProposalCreationStepValue,
  ProposalMetadata,
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

    const multisigContract = Multisig__factory.connect(
      params.pluginAddress,
      signer,
    );

    if (
      params.failSafeActions?.length &&
      params.failSafeActions.length !== params.actions?.length
    ) {
      throw new Error(
        "Size mismatch: actions and failSafeActions should match",
      );
    }
    const allowFailureMap = boolArrayToBitmap(params.failSafeActions);

    const startTimestamp = params.startDate?.getTime() || 0;
    const endTimestamp = params.endDate?.getTime() || 0;

    const tx = await multisigContract.createProposal(
      toUtf8Bytes(params.metadataUri),
      params.actions || [],
      allowFailureMap,
      params.approve || false,
      params.tryExecution || false,
      Math.round(startTimestamp / 1000),
      Math.round(endTimestamp / 1000),
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
      proposalId: encodeProposalId(params.pluginAddress, Number(proposalId)),
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

    if (!isProposalId(params.proposalId)) {
      throw new InvalidProposalIdError();
    }
    const { pluginAddress, id } = decodeProposalId(params.proposalId);

    const multisigContract = Multisig__factory.connect(
      pluginAddress,
      signer,
    );

    const tx = await multisigContract.approve(
      id,
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
   * @param {string} proposalId
   * @return {*}  {AsyncGenerator<ExecuteMultisigProposalStepValue>}
   * @memberof MultisigClientMethods
   */
  public async *executeProposal(
    proposalId: string,
  ): AsyncGenerator<ExecuteProposalStepValue> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new NoSignerError();
    } else if (!signer.provider) {
      throw new NoProviderError();
    }

    if (!isProposalId(proposalId)) {
      throw new InvalidProposalIdError();
    }
    const { pluginAddress, id } = decodeProposalId(proposalId);

    const multisigContract = Multisig__factory.connect(
      pluginAddress,
      signer,
    );

    const tx = await multisigContract.execute(
      id,
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
   * Checks whether the current proposal can be approved by the given address
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
    if (!isAddress(params.addressOrEns)) {
      throw new InvalidAddressOrEnsError();
    }

    if (!isProposalId(params.proposalId)) {
      throw new InvalidProposalIdError();
    }
    const { pluginAddress, id } = decodeProposalId(params.proposalId);

    const multisigContract = Multisig__factory.connect(
      pluginAddress,
      signer,
    );

    return multisigContract.canApprove(id, params.addressOrEns);
  }
  /**
   * Checks whether the current proposal can be executed
   *
   * @param {string} proposalId
   * @return {*}  {Promise<boolean>}
   * @memberof MultisigClientMethods
   */
  public async canExecute(
    proposalId: string
  ): Promise<boolean> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new NoSignerError();
    } else if (!signer.provider) {
      throw new NoProviderError();
    }

    if (!isProposalId(proposalId)) {
      throw new InvalidProposalIdError();
    }
    const { pluginAddress, id } = decodeProposalId(proposalId);

    const multisigContract = Multisig__factory.connect(
      pluginAddress,
      signer,
    );

    return multisigContract.canExecute(id);
  }
  /**
   * Returns the voting settings
   *
   * @param {string} addressOrEns
   * @return {*}  {Promise<MultisigVotingSettings>}
   * @memberof MultisigClientMethods
   */
  public async getVotingSettings(
    address: string,
  ): Promise<MultisigVotingSettings> {
    // TODO
    // update this with yup validation
    if (!isAddress(address)) {
      throw new InvalidAddressOrEnsError();
    }
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
    address: string,
  ): Promise<string[]> {
    // TODO
    // update this with yup validation
    if (!isAddress(address)) {
      throw new InvalidAddressOrEnsError();
    }
    try {
      await this.graphql.ensureOnline();
      const client = this.graphql.getClient();
      const { multisigPlugin }: {
        multisigPlugin: SubgraphMultisigMembers;
      } = await client.request(QueryMultisigMembers, {
        address,
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
    if (!proposalId) {
      throw new InvalidProposalIdError();
    }
    if (!/^0x[A-Za-z0-9]{40}_(0x[A-Fa-f0-9]{1,64})$/.test(proposalId)) {
      throw new InvalidProposalIdError();
    }
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
