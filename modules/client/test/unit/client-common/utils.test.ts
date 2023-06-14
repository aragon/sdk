import { hexToBytes } from "@aragon/sdk-common";
import {
  computeProposalStatus,
  isFailingProposal,
} from "../../../src";
import { Multisig__factory } from "@aragon/osx-ethers";
import { id } from "@ethersproject/hash";
import { DaoAction, ProposalStatus } from "@aragon/sdk-client-common";

const UPDATE_MULTISIG_SETTINGS_ACTION = {
  value: BigInt(0),
  to: "",
  data: hexToBytes(
    id(
      Multisig__factory.createInterface().getFunction(
        "updateMultisigSettings",
      )
        .format(),
    ),
  ),
};
const ADD_ADDRESSES_ACTION = {
  value: BigInt(0),
  to: "",
  data: hexToBytes(
    id(
      Multisig__factory.createInterface().getFunction(
        "addAddresses",
      )
        .format(),
    ),
  ),
};
const REMOVE_ADDRESSES_ACTION = {
  value: BigInt(0),
  to: "",
  data: hexToBytes(
    id(
      Multisig__factory.createInterface().getFunction(
        "removeAddresses",
      )
        .format(),
    ),
  ),
};
const UPGRADE_TO_ACTION = {
  value: BigInt(0),
  to: "",
  data: hexToBytes(
    id(
      Multisig__factory.createInterface().getFunction(
        "upgradeTo",
      )
        .format(),
    ),
  ),
};

describe("client-common utils", () => {
  describe("computeProposalStatus", () => {
    it("should return PENDING", () => {
      const endDate = Date.now() / 1000;
      const startDate = (Date.now() / 1000) + 500;

      expect(computeProposalStatus({
        endDate: endDate.toString(),
        startDate: startDate.toString(),
        potentiallyExecutable: false,
        executed: false,
        earlyExecutable: false,
      })).toBe(ProposalStatus.PENDING);
    });
    it("should return EXECUTED", () => {
      const endDate = Date.now() / 1000;
      const startDate = (Date.now() / 1000) - 500;

      expect(computeProposalStatus({
        endDate: endDate.toString(),
        startDate: startDate.toString(),
        potentiallyExecutable: false,
        executed: true,
        earlyExecutable: false,
      })).toBe(ProposalStatus.EXECUTED);
    });
    it("should return ACTIVE", () => {
      const endDate = (Date.now() / 1000) + 500;
      const startDate = (Date.now() / 1000) - 500;

      expect(computeProposalStatus({
        endDate: endDate.toString(),
        startDate: startDate.toString(),
        potentiallyExecutable: false,
        executed: false,
        earlyExecutable: false,
      })).toBe(ProposalStatus.ACTIVE);
    });
    it("should return SUCCEDED if executable = true", () => {
      const endDate = Date.now() / 1000;
      const startDate = (Date.now() / 1000) - 500;

      expect(computeProposalStatus({
        endDate: endDate.toString(),
        startDate: startDate.toString(),
        potentiallyExecutable: true,
        executed: false,
        earlyExecutable: false,
      })).toBe(ProposalStatus.SUCCEEDED);
    });
    it("should return SUCCEDED if earlyExecutable = true", () => {
      const endDate = (Date.now() / 1000) + 500;
      const startDate = (Date.now() / 1000) - 500;

      expect(computeProposalStatus({
        endDate: endDate.toString(),
        startDate: startDate.toString(),
        potentiallyExecutable: false,
        executed: false,
        earlyExecutable: true,
      })).toBe(ProposalStatus.SUCCEEDED);
    });
    it("should return DEFEATED", () => {
      const endDate = (Date.now() / 1000) - 200;
      const startDate = (Date.now() / 1000) - 500;

      expect(computeProposalStatus({
        endDate: endDate.toString(),
        startDate: startDate.toString(),
        potentiallyExecutable: false,
        executed: false,
        earlyExecutable: false,
      })).toBe(ProposalStatus.DEFEATED);
    });
  });
});

describe("Detect failing proposals", () => {
  it("isFailingProposal should return true because the proposal changes the min approvals and then updates the addresses", async () => {
    const actions: DaoAction[] = [
      UPDATE_MULTISIG_SETTINGS_ACTION,
      ADD_ADDRESSES_ACTION,
    ];
    expect(isFailingProposal(actions)).toBe(
      true,
    );
  });
  it("isFailingProposal should return true because the proposal removes addresses and then updates the settings", async () => {
    const actions: DaoAction[] = [
      REMOVE_ADDRESSES_ACTION,
      UPDATE_MULTISIG_SETTINGS_ACTION,
    ];
    expect(isFailingProposal(actions)).toBe(
      true,
    );
  });
  it("isFailingProposal should return false because the proposal adds addresses, changes the min approvals and then removes addresses with other actions in the middle", async () => {
    const actions: DaoAction[] = [
      ADD_ADDRESSES_ACTION,
      UPDATE_MULTISIG_SETTINGS_ACTION,
      UPGRADE_TO_ACTION,
      ADD_ADDRESSES_ACTION,
      ADD_ADDRESSES_ACTION,
      ADD_ADDRESSES_ACTION,
      ADD_ADDRESSES_ACTION,
      UPGRADE_TO_ACTION,
      UPDATE_MULTISIG_SETTINGS_ACTION,
      REMOVE_ADDRESSES_ACTION,
      REMOVE_ADDRESSES_ACTION,
      REMOVE_ADDRESSES_ACTION,
    ];
    expect(isFailingProposal(actions)).toBe(
      false,
    );
  });
  it("Should return false because there are no actions", async () => {
    const actions: DaoAction[] = [];
    expect(isFailingProposal(actions)).toBe(
      false,
    );
  });
});
