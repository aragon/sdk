import {
  GraphQLError,
  InvalidAddressOrEnsError,
  InvalidCidError,
  InvalidProposalIdError,
  IpfsPinError,
  NoProviderError,
  NoSignerError,
  resolveIpfsCid,
} from "@aragon/sdk-common";
import {
  ClientCore,
  ContextPlugin,
  ExecuteProposalStep,
  ExecuteProposalStepValue,
  ProposalMetadata,
  ProposalSortBy,
  SortDirection,
} from "../../../client-common";
import {
  UNAVAILABLE_PROPOSAL_METADATA,
  UNSUPPORTED_PROPOSAL_METADATA_LINK,
} from "../../../client-common/constants";
import {
  AdminProposal,
  AdminProposalListItem,
  ExecuteProposalParams,
  IClientAdminMethods,
  IAdminProposalQueryParams,
  SubgraphAdminProposal,
  SubgraphAdminProposalListItem,
} from "../../interfaces";
import {
  QueryAdminProposal,
  QueryAdminProposals,
} from "../graphql-queries/proposal";
import {
  computeProposalStatusFilter,
  toAdminProposal,
  toAdminProposalListItem,
} from "../utils";
import { isAddress } from "@ethersproject/address";

/**
 * Methods module for the SDK Admin Client
 */
export class ClientAdminMethods extends ClientCore
  implements IClientAdminMethods {
  constructor(context: ContextPlugin) {
    super(context);
  }
  /**
   * Executes the given proposal if the user has
   *
   * @param {ExecuteProposalParams} params
   * @return {*}  {AsyncGenerator<ExecuteProposalStepValue>}
   * @memberof ClientAdminMethods
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
    // TODO
    // use new ethers contracts
    // @ts-ignore
    const adminContract = Admin__factory.connect(
      params.pluginAddress,
      signer,
    );
    const tx = await adminContract.execute(params.metadataUri, params.actions);
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
   * Pins a metadata object into IPFS and retruns the generated hash
   *
   * @param {ProposalMetadata} params
   * @return {*}  {Promise<string>}
   * @memberof ClientAdminMethods
   */
  public async pinMetadata(
    params: ProposalMetadata,
  ): Promise<string> {
    try {
      const cid = await this.ipfs.add(JSON.stringify(params));
      await this.ipfs.pin(cid);
      return `ipfs://${cid}`;
    } catch {
      throw new IpfsPinError();
    }
  }

  public async getProposal(
    proposalId: string,
  ): Promise<AdminProposal | null> {
    if (!proposalId) {
      throw new InvalidProposalIdError();
    }
    try {
      await this.graphql.ensureOnline();
      const client = this.graphql.getClient();
      const {
        adminProposal,
      }: { adminProposal: SubgraphAdminProposal } = await client.request(
        QueryAdminProposal,
        proposalId,
      );

      if (!adminProposal) {
        return null;
      }

      try {
        const metadataCid = resolveIpfsCid(adminProposal.metadata);
        const metadataString = await this.ipfs.fetchString(metadataCid);
        const metadata = JSON.parse(metadataString) as ProposalMetadata;
        return toAdminProposal(adminProposal, metadata);
        // TODO: Parse and validate schema
      } catch (err) {
        if (err instanceof InvalidCidError) {
          return toAdminProposal(
            adminProposal,
            UNSUPPORTED_PROPOSAL_METADATA_LINK,
          );
        }
        return toAdminProposal(
          adminProposal,
          UNAVAILABLE_PROPOSAL_METADATA,
        );
      }
    } catch (err) {
      throw new GraphQLError("Admin proposal");
    }
  }
  /**
   * Returns a list of proposals on the Plugin, filtered by the given criteria
   *
   * @param {IAdminProposalQueryParams}
   * @return {*}  {Promise<AdminProposalListItem[]>}
   * @memberof ClientAdminMethods
   */
  public async getProposals(
    {
      administratorAddressOrEns,
      limit = 10,
      status,
      skip = 0,
      direction = SortDirection.ASC,
      sortBy = ProposalSortBy.CREATED_AT,
    }: IAdminProposalQueryParams,
  ): Promise<AdminProposalListItem[]> {
    let where = {};
    let address = administratorAddressOrEns;
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
        adminProposals,
      }: {
        adminProposals: SubgraphAdminProposalListItem[];
      } = await client.request(QueryAdminProposals, {
        where,
        limit,
        skip,
        direction,
        sortBy,
      });
      await this.ipfs.ensureOnline();
      return Promise.all(
        adminProposals.map(
          async (
            proposal: SubgraphAdminProposalListItem,
          ): Promise<AdminProposalListItem> => {
            // format in the metadata field
            try {
              const metadataCid = resolveIpfsCid(proposal.metadata);
              const stringMetadata = await this.ipfs.fetchString(metadataCid);
              const metadata = JSON.parse(stringMetadata) as ProposalMetadata;
              return toAdminProposalListItem(proposal, metadata);
            } catch (err) {
              if (err instanceof InvalidCidError) {
                return toAdminProposalListItem(
                  proposal,
                  UNSUPPORTED_PROPOSAL_METADATA_LINK,
                );
              }
              return toAdminProposalListItem(
                proposal,
                UNAVAILABLE_PROPOSAL_METADATA,
              );
            }
          },
        ),
      );
    } catch {
      throw new GraphQLError("ERC20 proposals");
    }
  }
}
