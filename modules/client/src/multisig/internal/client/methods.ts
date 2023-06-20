import {
  boolArrayToBitmap,
  decodeProposalId,
  encodeProposalId,
  getExtendedProposalId,
  InvalidAddressOrEnsError,
  InvalidCidError,
  InvalidProposalIdError,
  IpfsPinError,
  isProposalId,
  NoProviderError,
  ProposalCreationError,
  resolveIpfsCid,
  SizeMismatchError,
  UnsupportedNetworkError,
} from "@aragon/sdk-common";
import { isAddress } from "@ethersproject/address";
import {
  ApproveMultisigProposalParams,
  ApproveProposalStep,
  ApproveProposalStepValue,
  CanApproveParams,
  CreateMultisigProposalParams,
  MultisigPluginPrepareInstallationParams,
  MultisigProposal,
  MultisigProposalListItem,
  MultisigVotingSettings,
} from "../../types";
import {
  SubgraphMultisigProposal,
  SubgraphMultisigProposalListItem,
  SubgraphMultisigVotingSettings,
} from "../types";
import {
  computeProposalStatusFilter,
  ExecuteProposalStep,
  ExecuteProposalStepValue,
  isFailingProposal,
  ProposalCreationSteps,
  ProposalCreationStepValue,
  ProposalQueryParams,
  ProposalSortBy,
  SubgraphMembers,
} from "../../../client-common";
import { Multisig__factory } from "@aragon/osx-ethers";
import {
  QueryMultisigMembers,
  QueryMultisigProposal,
  QueryMultisigProposals,
  QueryMultisigVotingSettings,
} from "../graphql-queries";
import { toMultisigProposal, toMultisigProposalListItem } from "../utils";
import { toUtf8Bytes } from "@ethersproject/strings";
import { IMultisigClientMethods } from "../interfaces";
import { AlwaysFailingProposalError } from "@aragon/sdk-common";
import {
  ClientCore,
  EMPTY_PROPOSAL_METADATA_LINK,
  findLog,
  LIVE_CONTRACTS,
  prepareGenericInstallation,
  PrepareInstallationStepValue,
  ProposalMetadata,
  SortDirection,
  SupportedNetwork,
  SupportedNetworksArray,
  UNAVAILABLE_PROPOSAL_METADATA,
  UNSUPPORTED_PROPOSAL_METADATA_LINK,
} from "@aragon/sdk-client-common";
import { INSTALLATION_ABI } from "../constants";

/**
 * Methods module the SDK Address List Client
 */
export class MultisigClientMethods extends ClientCore
  implements IMultisigClientMethods {
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

    if (isFailingProposal(params.actions)) {
      throw new AlwaysFailingProposalError();
    }

    const multisigContract = Multisig__factory.connect(
      params.pluginAddress,
      signer,
    );

    if (
      params.failSafeActions?.length &&
      params.failSafeActions.length !== params.actions?.length
    ) {
      throw new SizeMismatchError();
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
    } catch (e) {
      throw new IpfsPinError(e);
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
   * Prepares the installation of a multisig plugin in a given dao
   *
   * @param {MultisigPluginPrepareInstallationParams} params
   * @return {*}  {AsyncGenerator<PrepareInstallationStepValue>}
   * @memberof MultisigClientMethods
   */
  public async *prepareInstallation(
    params: MultisigPluginPrepareInstallationParams,
  ): AsyncGenerator<PrepareInstallationStepValue> {
    const network = await this.web3.getProvider().getNetwork();
    const networkName = network.name as SupportedNetwork;
    if (!SupportedNetworksArray.includes(networkName)) {
      throw new UnsupportedNetworkError(networkName);
    }
    // todo params
    yield* prepareGenericInstallation(this.web3, {
      daoAddressOrEns: params.daoAddressOrEns,
      pluginRepo: LIVE_CONTRACTS[networkName].multisigRepo,
      version: params.versionTag,
      installationAbi: INSTALLATION_ABI,
      installationParams: [
        params.settings.members,
        [
          params.settings.votingSettings.onlyListed,
          params.settings.votingSettings.minApprovals,
        ],
      ],
    });
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
    if (!isAddress(params.approverAddressOrEns)) {
      throw new InvalidAddressOrEnsError();
    }
    const { pluginAddress, id } = decodeProposalId(params.proposalId);

    const multisigContract = Multisig__factory.connect(
      pluginAddress,
      signer,
    );

    return multisigContract.canApprove(id, params.approverAddressOrEns);
  }
  /**
   * Checks whether the current proposal can be executed
   *
   * @param {string} proposalId
   * @return {*}  {Promise<boolean>}
   * @memberof MultisigClientMethods
   */
  public async canExecute(
    proposalId: string,
  ): Promise<boolean> {
    const signer = this.web3.getConnectedSigner();

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
    pluginAddress: string,
  ): Promise<MultisigVotingSettings> {
    // TODO
    // update this with yup validation
    if (!isAddress(pluginAddress)) {
      throw new InvalidAddressOrEnsError();
    }
    const query = QueryMultisigVotingSettings;
    const params = {
      address: pluginAddress.toLowerCase(),
    };
    const name = "Multisig settings";
    type T = { multisigPlugin: SubgraphMultisigVotingSettings };
    const { multisigPlugin } = await this.graphql.request<T>({
      query,
      params,
      name,
    });
    return {
      onlyListed: multisigPlugin.onlyListed,
      minApprovals: multisigPlugin.minApprovals,
    };
  }
  /**
   * returns the members of the multisig
   *
   * @param {string} pluginAddress
   * @param {number} blockNumber
   * @return {*}  {Promise<string[]>}
   * @memberof MultisigClientMethods
   */
  public async getMembers(
    pluginAddress: string,
    blockNumber?: number,
  ): Promise<string[]> {
    // TODO
    // update this with yup validation
    if (!isAddress(pluginAddress)) {
      throw new InvalidAddressOrEnsError();
    }
    const query = QueryMultisigMembers;
    const params = {
      address: pluginAddress.toLowerCase(),
      block: blockNumber ? { number: blockNumber } : null,
    };
    const name = "Multisig members";
    type T = { multisigPlugin: SubgraphMembers };
    const { multisigPlugin } = await this.graphql.request<T>({
      query,
      params,
      name,
    });
    return multisigPlugin.members.map((member) => member.address);
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
    if (!isProposalId(proposalId)) {
      throw new InvalidProposalIdError();
    }
    const extendedProposalId = getExtendedProposalId(proposalId);
    const query = QueryMultisigProposal;
    const params = {
      proposalId: extendedProposalId,
    };
    const name = "Multisig proposal";
    type T = { multisigProposal: SubgraphMultisigProposal };
    const { multisigProposal } = await this.graphql.request<T>({
      query,
      params,
      name,
    });
    if (!multisigProposal) {
      return null;
    } else if (!multisigProposal.metadata) {
      return toMultisigProposal(
        multisigProposal,
        EMPTY_PROPOSAL_METADATA_LINK,
      );
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
  }

  /**
   * Returns a list of proposals on the Plugin, filtered by the given criteria
   *
   * @param {ProposalQueryParams} {
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
  }: ProposalQueryParams): Promise<MultisigProposalListItem[]> {
    let where = {};
    let address = daoAddressOrEns;
    if (address) {
      if (!isAddress(address)) {
        await this.web3.ensureOnline();
        const provider = this.web3.getProvider();
        if (!provider) {
          throw new NoProviderError();
        }
        try {
          const resolvedAddress = await provider.resolveName(address);
          if (!resolvedAddress) {
            throw new InvalidAddressOrEnsError();
          }
          address = resolvedAddress;
        } catch (e) {
          throw new InvalidAddressOrEnsError(e);
        }
      }
      where = { dao: address.toLowerCase() };
    }
    if (status) {
      where = { ...where, ...computeProposalStatusFilter(status) };
    }
    const query = QueryMultisigProposals;
    const params = {
      where,
      limit,
      skip,
      direction,
      sortBy,
    };
    const name = "Multisig proposals";
    type T = { multisigProposals: SubgraphMultisigProposalListItem[] };
    const { multisigProposals } = await this.graphql.request<T>({
      query,
      params,
      name,
    });
    return Promise.all(
      multisigProposals.map(
        async (
          proposal: SubgraphMultisigProposalListItem,
        ): Promise<MultisigProposalListItem> => {
          if (!proposal.metadata) {
            return toMultisigProposalListItem(
              proposal,
              EMPTY_PROPOSAL_METADATA_LINK,
            );
          }
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
  }
}
