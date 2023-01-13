import { hexToBytes, strip0x } from "@aragon/sdk-common";
import {
  computeProposalStatus,
  ContractVotingSettings,
  DaoAction,
  parseEtherRatio,
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
  const executionDate = new Date(
    parseInt(proposal.executionDate) * 1000,
  );
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
      description: metadata.description,
      resources: metadata.resources,
      media: metadata.media,
    },
    startDate,
    endDate,
    creationDate,
    creationBlockNumber: parseInt(proposal.creationBlockNumber),
    executionDate,
    executionBlockNumber: parseInt(proposal.executionBlockNumber) || 0,
    actions: proposal.actions.map(
      (action: SubgraphAction): DaoAction => {
        return {
          data: hexToBytes(strip0x(action.data)),
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
      // TODO
      // this should be decoded using the number of decimals that we want
      // right now the encoders/recoders use 2 digit precission but the actual
      // subgraph values are 18 digits precision. Uncomment below for 2 digits
      // precision

      // minSupport: decodeRatio(
      //   BigInt(proposal.totalSupportThresholdPct),
      //   2,
      // ),
      // minTurnout: decodeRatio(
      //   BigInt(proposal.relativeSupportThresholdPct),
      //   2,
      // ),
      minSupport: parseEtherRatio(proposal.supportThreshold),
      minTurnout: parseEtherRatio(proposal.minParticipation),
      duration: parseInt(proposal.endDate) -
        parseInt(proposal.startDate),
    },
    totalVotingWeight: parseInt(proposal.totalVotingPower),
    votes: proposal.voters.map(
      (voter: SubgraphAddresslistVotingVoterListItem) => {
        return {
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
    status: computeProposalStatus(proposal),
    result: {
      yes: proposal.yes ? parseInt(proposal.yes) : 0,
      no: proposal.no ? parseInt(proposal.no) : 0,
      abstain: proposal.abstain ? parseInt(proposal.abstain) : 0,
    },
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
