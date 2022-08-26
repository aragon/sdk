import { ERC20Voting__factory, MajorityVoting__factory, WhitelistVoting__factory } from "@aragon/core-contracts-ethers";
import { strip0x, hexToBytes, bytesToHex } from "@aragon/sdk-common";
import { Result } from "@ethersproject/abi";
import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero } from "@ethersproject/constants";
import { IErc20PluginInstall, IAddressListPluginInstall, IPluginSettings } from "../interfaces/plugins";

export function encodeAddressListActionInit(params: IAddressListPluginInstall): Uint8Array {
  const addressListVotingInterface = WhitelistVoting__factory.createInterface();
  const args = unwrapAddressListInitParams(params);
  // get hex bytes
  const hexBytes = addressListVotingInterface.encodeFunctionData("initialize", args);
  // Strip 0x => encode in Uint8Array
  return hexToBytes(strip0x(hexBytes));
}

function unwrapAddressListInitParams(params: IAddressListPluginInstall): [string, string, BigNumber, BigNumber, BigNumber, string[]] {
  // TODO
  // not sure if the IDao and gsn params will be needed after
  // this is converted into a plugin
  return [
    AddressZero,
    AddressZero,
    BigNumber.from(Math.round(params.settings.minTurnout * 100)),
    BigNumber.from(Math.round(params.settings.minSupport * 100)),
    BigNumber.from(params.settings.minDuration),
    params.addresses
  ]
}

export function encodeErc20ActionInit(params: IErc20PluginInstall): Uint8Array {
  const erc20votingInterface = ERC20Voting__factory.createInterface();
  const args = unwrapErc20InitParams(params);
  // get hex bytes
  const hexBytes = erc20votingInterface.encodeFunctionData("initialize", args);
  // Strip 0x => encode in Uint8Array
  return hexToBytes(strip0x(hexBytes));
}

function unwrapErc20InitParams(params: IErc20PluginInstall): [string, string, BigNumber, BigNumber, BigNumber, string] {
  // TODO
  // the SC specifies a token field but there is not format on thhis field
  // or how data should be passed to this in case it is using an existing
  // token or miniting a new one

  let token = ""
  if (params.newToken) {
    token = params.newToken.name
  } else if (params.useToken) {
    token = params.useToken.address
  }
  return [
    AddressZero,
    AddressZero,
    BigNumber.from(Math.round(params.settings.minTurnout * 100)),
    BigNumber.from(Math.round(params.settings.minSupport * 100)),
    BigNumber.from(params.settings.minDuration),
    token
  ]
}

export function encodeUpdatePluginSettingsAction(params: IPluginSettings): Uint8Array {
  const votingInterface = MajorityVoting__factory.createInterface();
  const args = unwrapUpdatePluginSettings(params);
  // get hex bytes
  const hexBytes = votingInterface.encodeFunctionData("changeVoteConfig", args);
  // Strip 0x => encode in Uint8Array
  return hexToBytes(strip0x(hexBytes));
}

function unwrapUpdatePluginSettings(params: IPluginSettings): [BigNumber, BigNumber, BigNumber] {
  return [
    BigNumber.from(Math.round(params.minTurnout * 100)),
    BigNumber.from(Math.round(params.minSupport * 100)),
    BigNumber.from(params.minDuration)
  ]
}

export function decodeUpdatePluginSettingsAction(data: Uint8Array): IPluginSettings {
  const votingInterface = MajorityVoting__factory.createInterface();
  const hexBytes = bytesToHex(data, true)
  try {
    // @ts-ignore
    const receivedFunction = votingInterface.getFunction(hexBytes.substring(0,10))
    const expectedfunction = votingInterface.getFunction("changeVoteConfig")
    if (receivedFunction.name !== expectedfunction.name) {
      throw new Error("The received action is different from the expected action")
    }
    const result = votingInterface.decodeFunctionData("changeVoteConfig", data);
    return wrapUpdatePluginSettings(result)
  } catch {
    throw new Error("Invalid action")
  }
}

function wrapUpdatePluginSettings(result: Result): IPluginSettings {
  return {
    minTurnout: result[0].toNumber() / 100,
    minSupport: result[1].toNumber() / 100,
    minDuration: result[2].toNumber(),
  }
}