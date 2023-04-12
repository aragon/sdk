import { decodeRatio, getCompactProposalId, hexToBytes } from "@aragon/sdk-common";
import {
  computeProposalStatus,
  ContractVotingSettings,
  DaoAction,
  ProposalMetadata,
  SubgraphAction,
  SubgraphVoteValuesMap,
  VoteValues,
  votingSettingsToContract,
} from "../../client-common";
import {
  AddresslistVotingProposal,
  AddresslistVotingProposalListItem,
  ContractAddresslistVotingInitParams,
  IAddresslistVotingPluginInstall,
  SubgraphAddresslistVotingProposal,
  SubgraphAddresslistVotingProposalListItem,
  SubgraphAddresslistVotingVoterListItem,
} from "../interfaces";

export function toAddresslistVotingProposal(
  proposal: SubgraphAddresslistVotingProposal,
  metadata: ProposalMetadata,
): AddresslistVotingProposal {
  const startDate = new Date(
    parseInt(proposal.startDate) * 1000,
  );
  const endDate = new Date(parseInt(proposal.endDate) * 1000);
  const creationDate = new Date(
    parseInt(proposal.createdAt) * 1000,
  );
  const executionDate = proposal.executionDate
    ? new Date(
      parseInt(proposal.executionDate) * 1000,
    )
    : null;
  return {
    id: getCompactProposalId(proposal.id),
    dao: {
      address: proposal.dao.id,
      name: proposal.dao.subdomain,
    },
    creatorAddress: proposal.creator,
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
    executionTxHash: proposal.executionTxHash || null,
    creationBlockNumber: parseInt(proposal.creationBlockNumber),
    executionDate,
    executionBlockNumber: parseInt(proposal.executionBlockNumber) || null,
    actions: proposal.actions.map(
      (action: SubgraphAction): DaoAction => {
        return {
          data: hexToBytes(action.data),
          to: action.to,
          value: BigInt(action.value),
        };
      },
    ),
    status: computeProposalStatus(proposal),
    result: {
      yes: proposal.yes ? parseInt(proposal.yes) : 0,
      no: proposal.no ? parseInt(proposal.no) : 0,
      abstain: proposal.abstain ? parseInt(proposal.abstain) : 0,
    },
    settings: {
      supportThreshold: decodeRatio(BigInt(proposal.supportThreshold), 6),
      minParticipation: decodeRatio(
        (BigInt(proposal.minVotingPower) * BigInt(1000000)) /
          BigInt(proposal.totalVotingPower),
        6,
      ),
      duration: parseInt(proposal.endDate) -
        parseInt(proposal.startDate),
    },
    totalVotingWeight: parseInt(proposal.totalVotingPower),
    votes: proposal.voters.map(
      (voter: SubgraphAddresslistVotingVoterListItem) => {
        return {
          voteReplaced: voter.voteReplaced,
          address: voter.voter.address,
          vote: SubgraphVoteValuesMap.get(voter.voteOption) as VoteValues,
        };
      },
    ),
  };
}
export function toAddresslistVotingProposalListItem(
  proposal: SubgraphAddresslistVotingProposalListItem,
  metadata: ProposalMetadata,
): AddresslistVotingProposalListItem {
  const startDate = new Date(
    parseInt(proposal.startDate) * 1000,
  );
  const endDate = new Date(parseInt(proposal.endDate) * 1000);
  return {
    id: getCompactProposalId(proposal.id),
    dao: {
      address: proposal.dao.id,
      name: proposal.dao.subdomain,
    },
    creatorAddress: proposal.creator,
    metadata: {
      title: metadata.title,
      summary: metadata.summary,
    },
    startDate,
    endDate,
    status: computeProposalStatus(proposal),
    result: {
      yes: proposal.yes ? parseInt(proposal.yes) : 0,
      no: proposal.no ? parseInt(proposal.no) : 0,
      abstain: proposal.abstain ? parseInt(proposal.abstain) : 0,
    },
    votes: proposal.voters.map(
      (voter: SubgraphAddresslistVotingVoterListItem) => {
        return {
          voteReplaced: voter.voteReplaced,
          address: voter.voter.address,
          vote: SubgraphVoteValuesMap.get(voter.voteOption) as VoteValues,
        };
      },
    ),
  };
}

export function addresslistVotingInitParamsToContract(
  params: IAddresslistVotingPluginInstall,
): ContractAddresslistVotingInitParams {
  return [
    Object.values(
      votingSettingsToContract(params.votingSettings),
    ) as ContractVotingSettings,
    params.addresses,
  ];
}
