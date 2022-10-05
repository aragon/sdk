import { hexToBytes, strip0x } from "@aragon/sdk-common";
import { DaoAction, ProposalStatus } from "../interfaces/common";
import {
  AddressListProposal,
  AddressListProposalListItem,
  Erc20Proposal,
  Erc20ProposalListItem,
  IComputeStatusProposal,
  ProposalMetadata,
  SubgraphAction,
  SubgraphAddressListProposal,
  SubgraphAddressListProposalListItem,
  SubgraphAddressListVoterListItem,
  SubgraphErc20Proposal,
  SubgraphErc20ProposalListItem,
  SubgraphErc20VoterListItem,
  SubgraphVoteValuesMap,
  VoteValues,
} from "../interfaces/plugins";
import { formatEther } from "@ethersproject/units";

export function computeProposalStatus(
  proposal: IComputeStatusProposal,
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
    proposal.yes && proposal.no && BigInt(proposal.yes) > BigInt(proposal.no)
  ) {
    // TODO
    // review this status because it is not correct
    return ProposalStatus.SUCCEEDED;
  } else {
    // TODO
    // review this status because it is not correct
    return ProposalStatus.DEFEATED;
  }
}

export function computeProposalStatusFilter(
  status: ProposalStatus,
): Object {
  let where = {};
  const now = Math.round(new Date().getTime() / 1000).toString();
  switch (status) {
    case ProposalStatus.PENDING:
      where = { startDate_gte: now };
      break;
    case ProposalStatus.ACTIVE:
      where = { startDate_lt: now, endDate_gte: now };
      break;
    case ProposalStatus.EXECUTED:
      where = { executed: true };
      break;
    case ProposalStatus.SUCCEEDED:
      where = { executable: true, endDate_lt: now };
      break;
    case ProposalStatus.DEFEATED:
      where = { executable: false, endDate_lt: now };
      break;
    default:
      throw new Error("invalid proposal status");
  }
  return where;
}

export function isProposalId(propoosalId: string): boolean {
  const regex = new RegExp(/^0x[A-Fa-f0-9]{40}_0x[A-Fa-f0-9]{1,}$/i);
  return regex.test(propoosalId);
}

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

export function toErc20Proposal(
  proposal: SubgraphErc20Proposal,
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
      (voter: SubgraphErc20VoterListItem) => {
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
  proposal: SubgraphErc20ProposalListItem,
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
      yes: proposal.yes ? BigInt(proposal.yes) : BigInt(0),
      no: proposal.no ? BigInt(proposal.no) : BigInt(0),
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
