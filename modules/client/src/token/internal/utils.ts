import { encodeRatio, decodeRatio, hexToBytes, strip0x } from "@aragon/sdk-common";
import {
  computeProposalStatus,
  DaoAction,
  ProposalMetadata,
  SubgraphAction,
  SubgraphVoteValuesMap,
  VoteValues,
} from "../../client-common";
import {
  ContractTokenInitParams,
  ContractMintTokenParams,
  TokenProposal,
  TokenProposalListItem,
  ITokenPluginInstall,
  IMintTokenParams,
  SubgraphTokenProposal,
  SubgraphTokenProposalListItem,
  SubgraphTokenVoterListItem,
} from "../interfaces";
import { BigNumber } from "@ethersproject/bignumber";
import { Result } from "@ethersproject/abi";
import { AddressZero } from "@ethersproject/constants";

export function toTokenProposal(
  proposal: SubgraphTokenProposal,
  metadata: ProposalMetadata,
): TokenProposal {
  const startDate = new Date(
    parseInt(proposal.startDate) * 1000,
  );
  const endDate = new Date(parseInt(proposal.endDate) * 1000);
  const creationDate = new Date(
    parseInt(proposal.createdAt) * 1000,
  );
  let castedVotingPower: bigint = BigInt(0);
  for (const voter of proposal.voters) {
    castedVotingPower += BigInt(voter.votingPower);
  }
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
      yes: proposal.yes ? BigInt(proposal.yes) : BigInt(0),
      no: proposal.no ? BigInt(proposal.no) : BigInt(0),
      abstain: proposal.abstain ? BigInt(proposal.abstain) : BigInt(0),
    },
    settings: {
      supportThreshold: decodeRatio(parseFloat(
        proposal.supportThreshold,
      ), 18),
      minParticipation: decodeRatio(parseFloat(
        proposal.minParticipation,
      ), 18),
      duration: parseInt(proposal.endDate) -
        parseInt(proposal.startDate),
      votingMode: parseInt(proposal.votingMode),
      totalVotingPower: BigInt(proposal.totalVotingPower)
    },
    token: {
      address: proposal.plugin.token.id,
      symbol: proposal.plugin.token.symbol,
      name: proposal.plugin.token.name,
    },
    castedVotingPower,
    votes: proposal.voters.map(
      (voter: SubgraphTokenVoterListItem) => {
        return {
          address: voter.voter.id,
          vote: SubgraphVoteValuesMap.get(voter.voteOption) as VoteValues,
          votingPower: BigInt(voter.votingPower),
        };
      },
    ),
  };
}

export function toTokenProposalListItem(
  proposal: SubgraphTokenProposalListItem,
  metadata: ProposalMetadata,
): TokenProposalListItem {
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
      yes: proposal.yes ? BigInt(proposal.yes) : BigInt(0),
      no: proposal.no ? BigInt(proposal.no) : BigInt(0),
      abstain: proposal.abstain ? BigInt(proposal.abstain) : BigInt(0),
    },
    token: {
      address: proposal.plugin.token.id,
      symbol: proposal.plugin.token.symbol,
      name: proposal.plugin.token.name,
    },
  };
}


export function mintTokenParamsToContract(
  params: IMintTokenParams,
): ContractMintTokenParams {
  return [params.address, BigNumber.from(params.amount)];
}

export function mintTokenParamsFromContract(result: Result): IMintTokenParams {
  return {
    address: result[0],
    amount: BigInt(result[1]),
  };
}


export function tokenInitParamsToContract(
  params: ITokenPluginInstall,
): ContractTokenInitParams {
  // TODO
  // the SC specifies a token field but there is not format on thhis field
  // or how data should be passed to this in case it is using an existing
  // token or miniting a new one

  let token = "";
  if (params.newToken) {
    token = params.newToken.name;
  } else if (params.useToken) {
    token = params.useToken.address;
  }
  return [
    AddressZero,
    {
      votingMode: BigNumber.from(params.settings.votingMode),
      supportThreshold: BigNumber.from(encodeRatio(params.settings.supportThreshold, 2)),
      minParticipation: BigNumber.from(encodeRatio(params.settings.minParticipation, 2)),
      minDuration: BigNumber.from(params.settings.minDuration),
      minProposerVotingPower: BigNumber.from(params.settings.minProposerVotingPower),
    },
    token,
  ];
}
