import { hexToBytes } from "@aragon/sdk-common";
import { DaoAction } from "../../types";
import { isFailingProposal } from "../../utils";
import { Multisig__factory } from "@aragon/osx-ethers";
import { id } from "@ethersproject/hash";

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

describe("Compute failing proposals", () => {
  it("Should return true because the proposal changes the min approvals and then updates the addresses", async () => {
    const actions: DaoAction[] = [
      UPDATE_MULTISIG_SETTINGS_ACTION,
      ADD_ADDRESSES_ACTION,
    ];
    expect(isFailingProposal(actions)).toBe(
      true,
    );
  });
  it("Should return true because the proposal removes addresses and then updates the settings", async () => {
    const actions: DaoAction[] = [
      REMOVE_ADDRESSES_ACTION,
      UPDATE_MULTISIG_SETTINGS_ACTION,
    ];
    expect(isFailingProposal(actions)).toBe(
      true,
    );
  });
  it("Should return false because the proposal adds addresses, changes the min approvals and then removes addresses", async () => {
    const actions: DaoAction[] = [
      ADD_ADDRESSES_ACTION,
      UPDATE_MULTISIG_SETTINGS_ACTION,
      REMOVE_ADDRESSES_ACTION,
    ];
    expect(isFailingProposal(actions)).toBe(
      false,
    );
  });
  it("Should return false because ther is no actions", async () => {
    const actions: DaoAction[] = [];
    expect(isFailingProposal(actions)).toBe(
      false,
    );
  });
});
