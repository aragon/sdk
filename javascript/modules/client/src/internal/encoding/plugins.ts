import { ERC20Voting__factory, MajorityVoting__factory, WhitelistVoting__factory } from "@aragon/core-contracts-ethers";
import { strip0x, hexToBytes } from "@aragon/sdk-common";
import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero } from "@ethersproject/constants";
import { IErc20FactoryParams, IMultisigFactoryParams, VotingConfig } from "../interfaces/plugins";

export function encodeMultisigActionInit(params: IMultisigFactoryParams): Uint8Array {
  const multisigVotingInterface = WhitelistVoting__factory.createInterface();
  const args = unwrapMultisigInitParams(params);
  // get hex bytes
  const hexBytes = multisigVotingInterface.encodeFunctionData("initialize", args);
  // Strip 0x => encode in Uint8Array
  return hexToBytes(strip0x(hexBytes));
}

function unwrapMultisigInitParams(params: IMultisigFactoryParams): [string, string, BigNumber, BigNumber, BigNumber, string[]] {
  // TODO
  // not sure if the IDao and gsn params will be needed after
  // this is converted into a plugin
  return [
    AddressZero,
    AddressZero,
    BigNumber.from(params.votingConfig.minParticipation),
    BigNumber.from(params.votingConfig.minSupport),
    BigNumber.from(params.votingConfig.minSupport),
    params.whitelistVoters
  ]
}

export function encodeErc20ActionInit(params: IErc20FactoryParams): Uint8Array {
  const erc20votingInterface = ERC20Voting__factory.createInterface();
  const args = unwrapErc20InitParams(params);
  // get hex bytes
  const hexBytes = erc20votingInterface.encodeFunctionData("initialize", args);
  // Strip 0x => encode in Uint8Array
  return hexToBytes(strip0x(hexBytes));
}

function unwrapErc20InitParams(params: IErc20FactoryParams): [string, string, BigNumber, BigNumber, BigNumber, string] {
  // TODO
  // not sure if the IDao and gsn params will be needed after
  // this is converted into a plugin
  // check if ERC20VotesUpgradeable _token should be the token
  // address
  return [
    AddressZero,
    AddressZero,
    BigNumber.from(params.votingConfig.minParticipation),
    BigNumber.from(params.votingConfig.minSupport),
    BigNumber.from(params.votingConfig.minSupport),
    params.tokenConfig.address
  ]
}

export function encodeActionSetPluginConfig(params: VotingConfig): Uint8Array {
  const votingInterface = MajorityVoting__factory.createInterface();
  const args = unwrapSetPluginConfig(params);
  // get hex bytes
  const hexBytes = votingInterface.encodeFunctionData("changeVoteConfig", args);
  // Strip 0x => encode in Uint8Array
  return hexToBytes(strip0x(hexBytes));
}

function unwrapSetPluginConfig(params: VotingConfig): [BigNumber, BigNumber, BigNumber] {
  return [
    BigNumber.from(params.minParticipation),
    BigNumber.from(params.minSupport),
    BigNumber.from(params.minDuration)
  ]
}