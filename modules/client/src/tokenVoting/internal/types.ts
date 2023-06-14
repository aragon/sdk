import { BigNumber } from "@ethersproject/bignumber";
import {
  ContractVotingSettings,
  SubgraphAction,
  SubgraphProposalBase,
  SubgraphVoterListItemBase,
  VotingMode,
} from "../../client-common";

/* Contract types */
export type ContractMintTokenParams = [string, BigNumber];
export type ContractTokenVotingInitParams = [
  ContractVotingSettings,
  [
    string, // address
    string, // name
    string, // symbol
  ],
  [
    string[], // receivers,
    BigNumber[], // amounts
  ],
];

/* Subgraph types */
export type SubgraphTokenVotingVoterListItem = SubgraphVoterListItemBase & {
  votingPower: string;
};

export type SubgraphTokenVotingProposalListItem = SubgraphProposalBase & {
  plugin: {
    token: SubgraphErc20Token | SubgraphErc721Token;
  };
  voters: SubgraphTokenVotingVoterListItem[];
  supportThreshold: string;
  minVotingPower: bigint;
  totalVotingPower: string;
  votingMode: VotingMode;
  earlyExecutable: boolean;
};

type SubgraphBaseToken = {
  symbol: string;
  name: string;
  id: string;
};
export enum SubgraphTokenType {
  ERC20 = "ERC20Token",
  ERC721 = "ERC721Token",
}
export enum SubgraphContractType {
  ERC20 = "ERC20Contract",
  ERC721 = "ERC721Contract",
}

export type SubgraphErc20Token = SubgraphBaseToken & {
  __typename: SubgraphContractType.ERC20;
  decimals: number;
};
export type SubgraphErc721Token = SubgraphBaseToken & {
  __typename: SubgraphContractType.ERC721;
};

export type SubgraphTokenVotingProposal =
  & SubgraphTokenVotingProposalListItem
  & {
    createdAt: string;
    actions: SubgraphAction[];
    creationBlockNumber: string;
    executionDate: string;
    executionTxHash: string;
    executionBlockNumber: string;
  };

export type SubgraphTokenVotingMember = {
  address: string;
  balance: string;
  votingPower: string;
  delegatee: {
    address: string;
  };
  delegators: {
    address: string;
    balance: string;
  }[];
};
