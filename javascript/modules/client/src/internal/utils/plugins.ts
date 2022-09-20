import { hexToBytes, strip0x } from "@aragon/sdk-common";
import { DaoAction, ProposalStatus } from "../interfaces/common";
import {
  AddressListProposal,
  AddressListProposalListItem,
  Erc20Proposal,
  Erc20ProposalListItem,
  ISubgraphAction,
  ISubgraphAddressListProposal,
  ISubgraphAddressListProposalListItem,
  ISubgraphAddressListVoterListItem,
  ISubgraphErc20Proposal,
  ISubgraphErc20ProposalListItem,
  ISubgraphErc20VoterListItem,
  ProposalMetadata,
  SubgraphVoteValuesMap,
  VoteValues,
} from "../interfaces/plugins";
import { formatEther } from "@ethersproject/units";

export function computeProposalStatus(
  proposal:
    | ISubgraphErc20Proposal
    | ISubgraphAddressListProposal
    | ISubgraphErc20ProposalListItem
    | ISubgraphAddressListProposalListItem,
): ProposalStatus {
  const now = new Date();
  const startDate = new Date(
    parseInt(proposal.startDate) * 1000,
  );
  const endDate = new Date(parseInt(proposal.endDate) * 1000);
  if (startDate >= now) {
    return ProposalStatus.PENDING;
  } else if (endDate >= now) {
    return ProposalStatus.ACTIVE;
  } else if (proposal.executed) {
    return ProposalStatus.EXECUTED;
  } else if (
    proposal.yea && proposal.nay && BigInt(proposal.yea) > BigInt(proposal.nay)
  ) {
    return ProposalStatus.SUCCEEDED;
  } else {
    return ProposalStatus.DEFEATED;
  }
}

export function isProposalId(propoosalId: string): boolean {
  const regex = new RegExp(/^0x[A-Fa-f0-9]{40}_0x[A-Fa-f0-9]{1,}$/i);
  return regex.test(propoosalId);
}

export function toAddressListProposal(
  proposal: ISubgraphAddressListProposal,
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
      (action: ISubgraphAction): DaoAction => {
        return {
          data: hexToBytes(strip0x(action.data)),
          to: action.to,
          value: BigInt(action.value),
        };
      },
    ),
    status: computeProposalStatus(proposal),
    result: {
      yes: proposal.yea ? parseInt(proposal.yea) : 0,
      no: proposal.nay ? parseInt(proposal.nay) : 0,
      abstain: proposal.abstain ? parseInt(proposal.abstain) : 0,
    },
    settings: {
      // TODO
      // this should be decoded using the number of decimals that we want
      // right now the encoders/recoders use 2 digit precission but the actual
      // subgraph values are 18 digits precision. Uncomment below for 2 digits
      // precision

      // minSupport: decodeRatio(
      //   BigInt(proposal.supportRequiredPct),
      //   2,
      // ),
      // minTurnout: decodeRatio(
      //   BigInt(proposal.participationRequiredPct),
      //   2,
      // ),
      // TODO DELETE ME
      minSupport: parseFloat(
        proposal.supportRequiredPct,
      ),
      minTurnout: parseFloat(
        proposal.participationRequired,
      ),
      duration: parseInt(proposal.endDate) -
        parseInt(proposal.startDate),
    },
    totalVotingWeight: parseInt(proposal.votingPower),
    votes: proposal.voters.map(
      (voter: ISubgraphAddressListVoterListItem) => {
        return {
          address: voter.voter.id,
          vote: SubgraphVoteValuesMap.get(voter.vote) as VoteValues,
        };
      },
    ),
  };
}
export function toAddressListProposalListItem(
  proposal: ISubgraphAddressListProposalListItem,
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
      yes: proposal.yea ? parseInt(proposal.yea) : 0,
      no: proposal.nay ? parseInt(proposal.nay) : 0,
      abstain: proposal.abstain ? parseInt(proposal.abstain) : 0,
    },
  };
}

export function toErc20Proposal(
  proposal: ISubgraphErc20Proposal,
  metadata: ProposalMetadata,
): Erc20Proposal {
  const startDate = new Date(
    parseInt(proposal.startDate) * 1000,
  );
  const endDate = new Date(parseInt(proposal.endDate) * 1000);
  const creationDate = new Date(
    parseInt(proposal.createdAt) * 1000,
  );
  let usedVotingWeight: bigint = BigInt(0);
  for (const voter of proposal.voters) {
    usedVotingWeight += BigInt(voter.weight);
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
      (action: ISubgraphAction): DaoAction => {
        return {
          data: hexToBytes(strip0x(action.data)),
          to: action.to,
          value: BigInt(action.value),
        };
      },
    ),
    status: computeProposalStatus(proposal),
    result: {
      yes: proposal.yea ? BigInt(proposal.yea) : BigInt(0),
      no: proposal.nay ? BigInt(proposal.nay) : BigInt(0),
      abstain: proposal.abstain ? BigInt(proposal.abstain) : BigInt(0),
    },
    settings: {
      // TODO
      // this should be decoded using the number of decimals that we want
      // right now the encoders/recoders use 2 digit precission but the actual
      // subgraph values are 18 digits precision. Uncomment below for 2 digits
      // precision

      // minSupport: decodeRatio(
      //   BigInt(proposal.supportRequiredPct),
      //   2,
      // ),
      // minTurnout: decodeRatio(
      //   BigInt(proposal.participationRequiredPct),
      //   2,
      // ),
      // TODO DELETE ME
      minSupport: parseFloat(
        formatEther(proposal.supportRequiredPct),
      ),
      minTurnout: parseFloat(
        formatEther(proposal.participationRequiredPct),
      ),
      duration: parseInt(proposal.endDate) -
        parseInt(proposal.startDate),
    },
    token: {
      address: proposal.pkg.token.id,
      symbol: proposal.pkg.token.symbol,
      name: proposal.pkg.token.name,
      decimals: parseInt(proposal.pkg.token.decimals),
    },
    usedVotingWeight,
    totalVotingWeight: BigInt(proposal.votingPower),
    votes: proposal.voters.map(
      (voter: ISubgraphErc20VoterListItem) => {
        return {
          address: voter.voter.id,
          vote: SubgraphVoteValuesMap.get(voter.vote) as VoteValues,
          weight: BigInt(voter.weight),
        };
      },
    ),
  };
}

export function toErc20ProposalListItem(
  proposal: ISubgraphErc20ProposalListItem,
  metadata: ProposalMetadata,
): Erc20ProposalListItem {
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
      yes: proposal.yea ? BigInt(proposal.yea) : BigInt(0),
      no: proposal.nay ? BigInt(proposal.nay) : BigInt(0),
      abstain: proposal.abstain ? BigInt(proposal.abstain) : BigInt(0),
    },
    token: {
      address: proposal.pkg.token.id,
      symbol: proposal.pkg.token.symbol,
      name: proposal.pkg.token.name,
      decimals: parseInt(proposal.pkg.token.decimals),
    },
  };
}
