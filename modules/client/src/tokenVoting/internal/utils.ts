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
  ContractMintTokenParams,
  ContractTokenVotingInitParams,
  Erc20TokenDetails,
  Erc721TokenDetails,
  IMintTokenParams,
  ITokenVotingPluginInstall,
  SubgraphErc20Token,
  SubgraphErc721Token,
  SubgraphTokenType,
  SubgraphTokenVotingProposal,
  SubgraphTokenVotingProposalListItem,
  SubgraphTokenVotingVoterListItem,
  TokenVotingProposal,
  TokenVotingProposalListItem,
} from "../interfaces";
import { BigNumber } from "@ethersproject/bignumber";
import { Result } from "@ethersproject/abi";
import { AddressZero } from "@ethersproject/constants";
import { decodeRatio, hexToBytes } from "@aragon/sdk-common";

export function toTokenVotingProposal(
  proposal: SubgraphTokenVotingProposal,
  metadata: ProposalMetadata,
): TokenVotingProposal {
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
  let usedVotingWeight: bigint = BigInt(0);
  for (const voter of proposal.voters) {
    usedVotingWeight += BigInt(voter.votingPower);
  }
  const token = parseToken(proposal.plugin.token);
  return {
    id: proposal.id,
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
    creationBlockNumber: parseInt(proposal.creationBlockNumber),
    executionDate,
    executionBlockNumber: parseInt(proposal.executionBlockNumber) || 0,
    executionTxHash: proposal.executionTxHash || "",
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
      yes: proposal.yes ? BigInt(proposal.yes) : BigInt(0),
      no: proposal.no ? BigInt(proposal.no) : BigInt(0),
      abstain: proposal.abstain ? BigInt(proposal.abstain) : BigInt(0),
    },
    settings: {
      minSupport: decodeRatio(BigInt(proposal.supportThreshold), 6),
      duration: parseInt(proposal.endDate) -
        parseInt(proposal.startDate),
      minTurnout: decodeRatio(
        (BigInt(proposal.minVotingPower) * BigInt(1000000)) /
          BigInt(proposal.totalVotingPower),
        6,
      ),
    },
    token,
    usedVotingWeight,
    totalVotingWeight: BigInt(proposal.totalVotingPower),
    votes: proposal.voters.map(
      (voter: SubgraphTokenVotingVoterListItem) => {
        return {
          voteReplaced: voter.voteReplaced,
          address: voter.voter.address,
          vote: SubgraphVoteValuesMap.get(voter.voteOption) as VoteValues,
          weight: BigInt(voter.votingPower),
        };
      },
    ),
  };
}

export function toTokenVotingProposalListItem(
  proposal: SubgraphTokenVotingProposalListItem,
  metadata: ProposalMetadata,
): TokenVotingProposalListItem {
  const startDate = new Date(
    parseInt(proposal.startDate) * 1000,
  );
  const endDate = new Date(parseInt(proposal.endDate) * 1000);
  const token = parseToken(proposal.plugin.token);
  return {
    id: proposal.id,
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
      yes: proposal.yes ? BigInt(proposal.yes) : BigInt(0),
      no: proposal.no ? BigInt(proposal.no) : BigInt(0),
      abstain: proposal.abstain ? BigInt(proposal.abstain) : BigInt(0),
    },
    token,
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

export function tokenVotingInitParamsToContract(
  params: ITokenVotingPluginInstall,
): ContractTokenVotingInitParams {
  let token: [string, string, string] = ["", "", ""];
  let balances: [string[], BigNumber[]] = [[], []];
  if (params.newToken) {
    token = [AddressZero, params.newToken.name, params.newToken.symbol];
    balances = [
      params.newToken.balances.map((balance) => balance.address),
      params.newToken.balances.map(({ balance }) => BigNumber.from(balance)),
    ];
  } else if (params.useToken) {
    token = [params.useToken?.address, "", ""];
  }
  return [
    Object.values(
      votingSettingsToContract(params.votingSettings),
    ) as ContractVotingSettings,
    token,
    balances,
  ];
}

function parseToken(
  subgraphToken: SubgraphErc20Token | SubgraphErc721Token,
): Erc20TokenDetails | Erc721TokenDetails | null {
  let token = null;
  if (subgraphToken.__typename === SubgraphTokenType.ERC20) {
    subgraphToken = subgraphToken as SubgraphErc20Token;
    token = {
      address: subgraphToken.id,
      symbol: subgraphToken.symbol,
      name: subgraphToken.name,
      decimals: parseInt(subgraphToken.decimals),
    };
  } else if (subgraphToken.__typename === SubgraphTokenType.ERC721) {
    subgraphToken = subgraphToken as SubgraphErc721Token;
    token = {
      address: subgraphToken.id,
      symbol: subgraphToken.symbol,
      name: subgraphToken.name,
      baseUri: subgraphToken.baseURI,
    };
  }
  return token;
}
