import {
  ProposalBase,
  ProposalListItemBase,
  TokenType,
  VersionTag,
} from "@aragon/sdk-client-common";
import {
  MajorityVotingProposalSettings,
  ProposalVoteBase,
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

export type Erc20WrapperTokenDetails = Erc20TokenDetails & {
  underlyingToken: Erc20TokenDetails;
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

/* Delegate */
export type DelegateTokensParams = {
  tokenAddress: string;
  delegatee: string;
};

export const enum DelegateTokensStep {
  DELEGATING = "delegating",
  DONE = "done",
}

export const enum UndelegateTokensStep {
  UNDELEGATING = "delegating",
  DONE = "done",
}

type DelegateTokensStepCommon =
  | {
      key: DelegateTokensStep.DELEGATING | UndelegateTokensStep.UNDELEGATING;
      txHash: string;
    }
  | { key: DelegateTokensStep.DONE | UndelegateTokensStep.DONE };

export type UndelegateTokensStepValue = DelegateTokensStepCommon;
export type DelegateTokensStepValue = DelegateTokensStepCommon;

export type TokenVotingMember = {
  /** The address of the member */
  address: string;
  /** The balance of the member */
  balance: bigint;
  /** The voting power of the member taking into account the delagation */
  votingPower: bigint;
  /** The address that you delegated yout voting power to
   *  If null, you are not delegating your voting power */
  delegatee: string | null;
  /** The list of addresses that delegated their voting power this member */
  delegators: { address: string; balance: bigint }[];
};
