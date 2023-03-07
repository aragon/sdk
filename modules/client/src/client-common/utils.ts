import { IDAO } from "@aragon/osx-ethers";
import { ContractReceipt } from "@ethersproject/contracts";
import { VoteValues, VotingMode } from "../client-common/interfaces/plugin";
import {
  CreateMajorityVotingProposalParams,
  IComputeStatusProposal,
  ProposalStatus,
} from "./interfaces/plugin";

import { Interface } from "@ethersproject/abi";
import { id } from "@ethersproject/hash";
import { Log } from "@ethersproject/providers";
import { InvalidVotingModeError, ClientNotInitializedError } from "@aragon/sdk-common";
import { ClientError as GraphQLClientError } from "graphql-request";
import { GraphQLError } from "graphql";

export function unwrapProposalParams(
  params: CreateMajorityVotingProposalParams,
): [string, IDAO.ActionStruct[], number, number, boolean, number] {
  return [
    params.metadataUri,
    params.actions ?? [],
    // TODO: Verify => seconds?
    params.startDate ? Math.floor(params.startDate.getTime() / 1000) : 0,
    // TODO: Verify => seconds?
    params.endDate ? Math.floor(params.endDate.getTime() / 1000) : 0,
    params.executeOnPass ?? false,
    params.creatorVote ?? VoteValues.ABSTAIN,
  ];
}

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
  } else if (proposal.executed) {
    return ProposalStatus.EXECUTED;
  } else if (endDate >= now) {
    return ProposalStatus.ACTIVE;
  } else if (
    proposal.executable
  ) {
    return ProposalStatus.SUCCEEDED;
  } else {
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
      where = { startDate_lt: now, endDate_gte: now, executed: false };
      break;
    case ProposalStatus.EXECUTED:
      where = { executed: true };
      break;
    case ProposalStatus.SUCCEEDED:
      where = { executable: true, endDate_lt: now };
      break;
    case ProposalStatus.DEFEATED:
      where = { executable: false, endDate_lt: now, executed: false };
      break;
    default:
      throw new Error("invalid proposal status");
  }
  return where;
}

export function findLog(
  receipt: ContractReceipt,
  iface: Interface,
  eventName: string,
): Log | undefined {
  return receipt.logs.find(
    (log) =>
      log.topics[0] ===
        id(
          iface.getEvent(eventName).format(
            "sighash",
          ),
        ),
  );
}

export function votingModeToContracts(votingMode: VotingMode): number {
  switch (votingMode) {
    case VotingMode.STANDARD:
      return 0;
    case VotingMode.EARLY_EXECUTION:
      return 1;
    case VotingMode.VOTE_REPLACEMENT:
      return 2;
    default:
      throw new InvalidVotingModeError();
  }
}
export function votingModeFromContracts(votingMode: number): VotingMode {
  switch (votingMode) {
    case 0:
      return VotingMode.STANDARD;
    case 1:
      return VotingMode.EARLY_EXECUTION;
    case 2:
      return VotingMode.VOTE_REPLACEMENT;
    default:
      throw new InvalidVotingModeError();
  }
}


export function handleGraphQLError(error: Error, message: string) {
  if (error instanceof ClientNotInitializedError) {
    throw error;
  } else if (error instanceof GraphQLClientError) {
    const e = error as GraphQLClientError;
    if (e.response.status < 500) {
      throw new GraphQLError(message);
    } 
  }
}
