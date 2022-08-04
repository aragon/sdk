import { ERC20Voting__factory, WhitelistVoting__factory } from "@aragon/core-contracts-ethers";
import { strip0x, hexToDecUint8Array } from "@aragon/sdk-common";
import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero } from "@ethersproject/constants";
import { IErc20FactoryParams, IAllowListFactoryParams } from "../interfaces/plugins";

export function encodeAllowListActionInit(params: IAllowListFactoryParams): Uint8Array {
  const allowListVotingInterface = WhitelistVoting__factory.createInterface();
  const args = unwrapAllowListInitParams(params);
  // get hex bytes
  const hexBytes = allowListVotingInterface.encodeFunctionData("initialize", args);
  // Strip 0x => encode in Uint8Array
  return hexToDecUint8Array(strip0x(hexBytes));
}

function unwrapAllowListInitParams(params: IAllowListFactoryParams): [string, string, BigNumber, BigNumber, BigNumber, string[]] {
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
  return hexToDecUint8Array(strip0x(hexBytes));
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