import { WhitelistVoting__factory } from "@aragon/core-contracts-ethers";
import {
  bytesToHex,
  encodeRatio,
  hexToBytes,
  strip0x,
  UnexpectedActionError,
} from "@aragon/sdk-common";
import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero } from "@ethersproject/constants";
import {
  ContractAddressListInitParams,
  IAddressListPluginInstall,
} from "./interfaces";

export function encodeAddressListActionInit(
  params: IAddressListPluginInstall,
): Uint8Array {
  const addressListVotingInterface = WhitelistVoting__factory.createInterface();
  const args = addressListInitParamsToContract(params);
  // get hex bytes
  const hexBytes = addressListVotingInterface.encodeFunctionData(
    "initialize",
    args,
  );
  // Strip 0x => encode in Uint8Array
  return hexToBytes(strip0x(hexBytes));
}

function addressListInitParamsToContract(
  params: IAddressListPluginInstall,
): ContractAddressListInitParams {
  // TODO
  // not sure if the IDao and gsn params will be needed after
  // this is converted into a plugin
  return [
    AddressZero,
    AddressZero,
    BigNumber.from(encodeRatio(params.settings.minTurnout, 2)),
    BigNumber.from(encodeRatio(params.settings.minSupport, 2)),
    BigNumber.from(params.settings.minDuration),
    params.addresses,
  ];
}

// ADD MEMBERS ACTION
export function encodeAddMembersAction(members: string[]): Uint8Array {
  const votingInterface = WhitelistVoting__factory.createInterface();
  // get hex bytes
  const hexBytes = votingInterface.encodeFunctionData(
    // TODO: Rename to `addAddresses` as soon as the plugin is updated
    "addWhitelistedUsers",
    [members],
  );
  return hexToBytes(strip0x(hexBytes));
}

export function decodeAddMemebersAction(data: Uint8Array): string[] {
  const votingInterface = WhitelistVoting__factory.createInterface();
  const hexBytes = bytesToHex(data, true);
  const receivedFunction = votingInterface.getFunction(
    hexBytes.substring(0, 10) as any,
  );
  // TODO: Rename to `addAddresses` as soon as the plugin is updated
  const expectedfunction = votingInterface.getFunction("addWhitelistedUsers");
  if (receivedFunction.name !== expectedfunction.name) {
    throw new UnexpectedActionError();
  }
  const result = votingInterface.decodeFunctionData(
    // TODO: Rename to `addAddresses` as soon as the plugin is updated
    "addWhitelistedUsers",
    data,
  );
  return result[0];
}
// REMOVE MEMBERS ACTION
export function encodeRemoveMembersAction(members: string[]): Uint8Array {
  const votingInterface = WhitelistVoting__factory.createInterface();
  // get hex bytes
  const hexBytes = votingInterface.encodeFunctionData(
    // TODO: Rename to `removeAddresses` as soon as the plugin is updated
    "removeWhitelistedUsers",
    [members],
  );
  return hexToBytes(strip0x(hexBytes));
}
export function decodeRemoveMemebersAction(data: Uint8Array): string[] {
  const votingInterface = WhitelistVoting__factory.createInterface();
  const hexBytes = bytesToHex(data, true);
  const receivedFunction = votingInterface.getFunction(
    hexBytes.substring(0, 10) as any,
  );
  const expectedfunction = votingInterface.getFunction(
    // TODO: Rename to `removeAddresses` as soon as the plugin is updated
    "removeWhitelistedUsers",
  );
  if (receivedFunction.name !== expectedfunction.name) {
    throw new UnexpectedActionError();
  }
  const result = votingInterface.decodeFunctionData(
    // TODO: Rename to `removeAddresses` as soon as the plugin is updated
    "removeWhitelistedUsers",
    data,
  );
  return result[0];
}
