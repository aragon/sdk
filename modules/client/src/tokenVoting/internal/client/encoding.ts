import {
  hexToBytes,
  InvalidAddressError,
  UnsupportedNetworkError,
} from "@aragon/sdk-common";
import {
  ClientCore,
  DaoAction,
  encodeUpdateVotingSettingsAction,
  PluginInstallItem,
  SupportedNetworks,
  SupportedNetworksArray,
  VotingSettings,
} from "../../../client-common";
import { isAddress } from "@ethersproject/address";
import { ITokenVotingClientEncoding } from "../../interfaces";
import { MintTokenParams, TokenVotingPluginInstall } from "../../types";
import { IERC20MintableUpgradeable__factory } from "@aragon/osx-ethers";
import {
  mintTokenParamsToContract,
  tokenVotingInitParamsToContract,
} from "../utils";
import { defaultAbiCoder } from "@ethersproject/abi";
import { LIVE_CONTRACTS } from "../../../client-common/constants";
import { getNetwork, Networkish } from "@ethersproject/providers";

/**
 * Encoding module the SDK TokenVoting Client
 */
export class TokenVotingClientEncoding extends ClientCore
  implements ITokenVotingClientEncoding {
  /**
   * Computes the parameters to be given when creating the DAO,
   * so that the plugin is configured
   *
   * @param {TokenVotingPluginInstall} params
   * @param {Networkish} network
   * @return {*}  {PluginInstallItem}
   * @memberof TokenVotingClientEncoding
   */
  static getPluginInstallItem(
    params: TokenVotingPluginInstall,
    network: Networkish,
  ): PluginInstallItem {
    const networkName = getNetwork(network).name as SupportedNetworks;
    if (!SupportedNetworksArray.includes(networkName)) {
      throw new UnsupportedNetworkError(networkName);
    }
    const args = tokenVotingInitParamsToContract(params);
    const hexBytes = defaultAbiCoder.encode(
      // ["votingMode","supportThreshold", "minParticipation", "minDuration"], ["address","name","symbol"][ "receivers","amount"]
      [
        "tuple(uint8 votingMode, uint64 supportThreshold, uint64 minParticipation, uint64 minDuration, uint256 minProposerVotingPower) votingSettings",
        "tuple(address addr, string name, string symbol) tokenSettings",
        "tuple(address[] receivers, uint256[] amounts) mintSettings",
      ],
      args,
    );
    return {
      id: LIVE_CONTRACTS[networkName].tokenVotingRepo,
      data: hexToBytes(hexBytes),
    };
  }
  /**
   * Computes the parameters to be given when creating a proposal that updates the governance configuration
   *
   * @param {string} pluginAddress
   * @param {VotingSettings} params
   * @return {*}  {DaoAction}
   * @memberof TokenVotingClientEncoding
   */
  public updatePluginSettingsAction(
    pluginAddress: string,
    params: VotingSettings,
  ): DaoAction {
    if (!isAddress(pluginAddress)) {
      throw new Error("Invalid plugin address");
    }
    // TODO: check if to and value are correct
    return {
      to: pluginAddress,
      value: BigInt(0),
      data: encodeUpdateVotingSettingsAction(params),
    };
  }

  /**
   * Computes the parameters to be given when creating a proposal that mints an amount of ERC-20 tokens to an address
   *
   * @param {string} minterAddress
   * @param {MintTokenParams} params
   * @return {*}  {DaoAction}
   * @memberof TokenVotingClientEncoding
   */
  public mintTokenAction(
    minterAddress: string,
    params: MintTokenParams,
  ): DaoAction {
    if (!isAddress(minterAddress) || !isAddress(params.address)) {
      throw new InvalidAddressError();
    }
    const votingInterface = IERC20MintableUpgradeable__factory
      .createInterface();
    const args = mintTokenParamsToContract(params);
    // get hex bytes
    const hexBytes = votingInterface.encodeFunctionData("mint", args);
    return {
      to: minterAddress,
      value: BigInt(0),
      data: hexToBytes(hexBytes),
    };
  }
}
