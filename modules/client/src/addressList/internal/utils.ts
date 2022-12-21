import { encodeRatio, hexToBytes, strip0x } from "@aragon/sdk-common";
import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero } from "@ethersproject/constants";
import {
  computeProposalStatus,
  DaoAction,
  ProposalMetadata,
  SubgraphAction,
  SubgraphVoteValuesMap,
  VoteValues,
} from "../../client-common";
import {
  AddressListProposal,
  AddressListProposalListItem,
  ContractAddressListInitParams,
  IAddressListPluginInstall,
  SubgraphAddressListProposal,
  SubgraphAddressListProposalListItem,
  SubgraphAddressListVoterListItem,
} from "../interfaces";

export function toAddressListProposal(
  proposal: SubgraphAddressListProposal,
  metadata: ProposalMetadata,
): AddressListProposal {
  const startDate = new Date(
    parseInt(proposal.startDate) * 1000,
  );
  const endDate = new Date(parseInt(proposal.endDate) * 1000);
  const creationDate = new Date(
    parseInt(proposal.createdAt) * 1000,
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
      supportThreshold: parseFloat(
        proposal.supportThreshold,
      ),
      minParticipation: parseFloat(
        proposal.minParticipation,
      ),
      duration: parseInt(proposal.endDate) -
        parseInt(proposal.startDate),
      votingMode: parseInt(proposal.votingMode),
      totalVotingPower: BigInt(proposal.totalVotingPower)
    },
    totalVotingWeight: parseInt(proposal.census),
    votes: proposal.voters.map(
      (voter: SubgraphAddressListVoterListItem) => {
        return {
          address: voter.voter.id,
          vote: SubgraphVoteValuesMap.get(voter.vote) as VoteValues,
        };
      },
    ),
  };
}
export function toAddressListProposalListItem(
  proposal: SubgraphAddressListProposalListItem,
  metadata: ProposalMetadata,
): AddressListProposalListItem {
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

export function addressListInitParamsToContract(
  params: IAddressListPluginInstall,
): ContractAddressListInitParams {
  // TODO
  // not sure if the IDao and gsn params will be needed after
  // this is converted into a plugin
  return [
    AddressZero,
    {
      votingMode: BigNumber.from(params.settings.votingMode),
      supportThreshold: BigNumber.from(encodeRatio(params.settings.supportThreshold, 2)),
      minParticipation: BigNumber.from(encodeRatio(params.settings.minParticipation, 2)),
      minDuration: BigNumber.from(params.settings.minDuration),
      minProposerVotingPower: BigNumber.from(params.settings.minProposerVotingPower),
    },
    params.addresses,
  ];
}
