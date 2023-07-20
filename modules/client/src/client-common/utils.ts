import { IDAO } from "@aragon/osx-ethers";
import { VoteValues, VotingMode } from "./types/plugin";
import {
  CreateMajorityVotingProposalParams,
  IComputeStatusProposal,
} from "./types/plugin";

import {
  InvalidProposalStatusError,
  InvalidVotingModeError,
} from "@aragon/sdk-common";
import { FAILING_PROPOSAL_AVAILABLE_FUNCTION_SIGNATURES } from "./internal";
import {
  DaoAction,
  DecodedApplyInstallationParams,
  getFunctionFragment,
  ProposalStatus,
} from "@aragon/sdk-client-common";

import { Result } from "@ethersproject/abi";

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
  if (proposal.executed) {
    return ProposalStatus.EXECUTED;
  }
  if (startDate >= now) {
    return ProposalStatus.PENDING;
  }
  if (
    (now > endDate || proposal.earlyExecutable) &&
    proposal.potentiallyExecutable
  ) {
    return ProposalStatus.SUCCEEDED;
  }
  if (endDate >= now) {
    return ProposalStatus.ACTIVE;
  }
  return ProposalStatus.DEFEATED;
}

export function computeProposalStatusFilter(
  status: ProposalStatus,
): Object {
  let where = {};
  const now = Math.round(new Date().getTime() / 1000).toString();
  switch (status) {
    case ProposalStatus.PENDING:
      where = { startDate_gte: now, potentiallyExecutable: false, executed: false };
      break;
    case ProposalStatus.ACTIVE:
      where = { startDate_lt: now, endDate_gte: now, executed: false };
      break;
    case ProposalStatus.EXECUTED:
      where = { executed: true };
      break;
    case ProposalStatus.SUCCEEDED:
      where = { potentiallyExecutable: true, endDate_lt: now };
      break;
    case ProposalStatus.DEFEATED:
      where = {
        endDate_lt: now,
        executed: false,
      };
      break;
    default:
      throw new InvalidProposalStatusError();
  }
  return where;
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

export function isFailingProposal(actions: DaoAction[] = []): boolean {
  // store the function names of the actions
  const functionNames: string[] = actions.map((action) => {
    try {
      const fragment = getFunctionFragment(
        action.data,
        FAILING_PROPOSAL_AVAILABLE_FUNCTION_SIGNATURES,
      );
      return fragment.name;
    } catch {
      return "";
    }
  }).filter((name) => name !== "");

  for (const [i, functionName] of functionNames.entries()) {
    // if I add addresses, we must update the settings after
    if (functionName === "addAddresses") {
      // if there is not an updateVotingSettings after addAddresses then the proposal will fail
      if (
        functionNames.indexOf("updateVotingSettings", i) === -1 &&
        functionNames.indexOf("updateMultisigSettings", i) === -1
      ) {
        return true;
      }
      // if I remove addresses, we must update the settings befor
    } else if (functionName === "removeAddresses") {
      // if there is not an updateVotingSettings before removeAddresses then the proposal will fail
      const updateVotingSettingsIndex = functionNames.indexOf(
        "updateVotingSettings",
      ); // if there is not an updateVotingSettings before removeAddresses then the proposal will fail
      const updateMultisigSettingsIndex = functionNames.indexOf(
        "updateMultisigSettings",
      );
      if (
        (updateVotingSettingsIndex === -1 || updateVotingSettingsIndex > i) &&
        (updateMultisigSettingsIndex === -1 || updateMultisigSettingsIndex > i)
      ) {
        return true;
      }
    }
  }
  return false;
}

export function applyInstallatonParamsFromContract(
  result: Result,
): DecodedApplyInstallationParams {
  const params = result[1];
  return {
    helpersHash: params.helpersHash,
    permissions: params.permissions,
    versionTag: params.pluginSetupRef.versionTag,
    pluginAddress: params.plugin,
    pluginRepo: params.pluginSetupRef.pluginSetupRepo,
  };
}
