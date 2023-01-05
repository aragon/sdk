import { IDAO } from "@aragon/core-contracts-ethers";
import { ContractReceipt } from "@ethersproject/contracts";
import { VoteValues, VotingSettings } from "../client-common/interfaces/plugin";
import {
  IComputeStatusProposal,
  ICreateProposalParams,
  ProposalStatus,
} from "./interfaces/plugin";

import { Interface } from "@ethersproject/abi";
import { id } from "@ethersproject/hash";
import { Log } from "@ethersproject/providers";

export function unwrapProposalParams(
  params: ICreateProposalParams,
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
  } else if (endDate >= now) {
    return ProposalStatus.ACTIVE;
  } else if (proposal.executed) {
    return ProposalStatus.EXECUTED;
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

export function findLog(
  receipt: ContractReceipt,
  iface: Interface,
  event: string,
): Log | undefined {
  return receipt.logs.find(
    (log) =>
      log.topics[0] ===
        id(
          iface.getEvent(event).format(
            "sighash",
          ),
        ),
  );
}

export function getVotingMode(votingSettings: VotingSettings): number {
  return votingSettings.earlyExecution
    ? 1
    : votingSettings.voteReplacement
    ? 2
    : 0;
}
