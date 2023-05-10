import {
  MajorityVotingProposalSettings,
  ProposalBase,
  ProposalListItemBase,
  ProposalVoteBase,
  TokenType,
  VersionTag,
  VotingSettings,
} from "../client-common";

export type TokenVotingPluginInstall = {
  votingSettings: VotingSettings;
  newToken?: NewTokenParams;
  useToken?: ExistingTokenParams;
};

type ExistingTokenParams = {
  tokenAddress: string;
  wrappedToken: {
    name: string;
    symbol: string;
  };
};

type NewTokenParams = {
  name: string;
  symbol: string;
  decimals: number;
  minter?: string;
  balances: { address: string; balance: bigint }[];
};

// PROPOSAL RETRIEVAL
export type TokenVotingProposalVote = ProposalVoteBase & {
  weight: bigint;
};

export type TokenVotingProposal = ProposalBase & {
  result: TokenVotingProposalResult;
  settings: MajorityVotingProposalSettings;
  token: Erc20TokenDetails | Erc721TokenDetails | null;
  usedVotingWeight: bigint;
  votes: TokenVotingProposalVote[];
  totalVotingWeight: bigint;
};

export type TokenVotingProposalListItem = ProposalListItemBase & {
  token: Erc20TokenDetails | Erc721TokenDetails | null;
  result: TokenVotingProposalResult;
  totalVotingWeight: bigint;
  settings: MajorityVotingProposalSettings;
  votes: TokenVotingProposalVote[];
};

export type TokenVotingProposalResult = {
  yes: bigint;
  no: bigint;
  abstain: bigint;
};

export type Erc20TokenDetails = TokenBaseDetails & {
  decimals: number;
  type: TokenType.ERC20;
};
export type Erc721TokenDetails = TokenBaseDetails & {
  type: TokenType.ERC721;
};

export type TokenBaseDetails = {
  address: string;
  name: string;
  symbol: string;
};

export type MintTokenParams = {
  address: string;
  amount: bigint;
};

export type TokenVotingPluginPrepareInstallationParams = {
  settings: TokenVotingPluginInstall;
  daoAddressOrEns: string;
  versionTag?: VersionTag;
};

type WrapTokensBase = {
  wrappedTokenAddress: string;
  amount: bigint;
};

export type WrapTokensParams = WrapTokensBase;
export type UnwrapTokensParams = WrapTokensBase;

export enum WrapTokensStep {
  WRAPPING = "wrapping",
  DONE = "done",
}

export type WrapTokensStepValue =
  | { key: WrapTokensStep.WRAPPING; txHash: string }
  | { key: WrapTokensStep.DONE };

export enum UnwrapTokensStep {
  UNWRAPPING = "unwrapping",
  DONE = "done",
}
export type UnwrapTokensStepValue =
  | { key: UnwrapTokensStep.UNWRAPPING; txHash: string }
  | { key: UnwrapTokensStep.DONE };
