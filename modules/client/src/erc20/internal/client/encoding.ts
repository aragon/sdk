import { hexToBytes, InvalidAddressError, strip0x } from "@aragon/sdk-common";
import {
  ClientCore,
  ContextPlugin,
  DaoAction,
  encodeUpdateVotingSettingsAction,
  IPluginInstallItem,
  VotingSettings,
} from "../../../client-common";
import { isAddress } from "@ethersproject/address";
import {
  IClientErc20Encoding,
  IErc20PluginInstall,
  IMintTokenParams,
} from "../../interfaces";
import { ERC20_PLUGIN_ID } from "../constants";
import {
  IERC20MintableUpgradeable__factory,
} from "@aragon/core-contracts-ethers";
import { erc20InitParamsToContract, mintTokenParamsToContract } from "../utils";
import { defaultAbiCoder } from "@ethersproject/abi";

/**
 * Encoding module the SDK ERC20 Client
 */
export class ClientErc20Encoding extends ClientCore
  implements IClientErc20Encoding {
  constructor(context: ContextPlugin) {
    super(context);
    Object.freeze(ClientErc20Encoding.prototype);
    Object.freeze(this);
  }
  /**
   * Computes the parameters to be given when creating the DAO,
   * so that the plugin is configured
   *
   * @param {IErc20PluginInstall} params
   * @return {*}  {IPluginInstallItem}
   * @memberof ClientErc20Encoding
   */
  static getPluginInstallItem(params: IErc20PluginInstall): IPluginInstallItem {
    const args = erc20InitParamsToContract(params);
    const data = defaultAbiCoder.encode(
      ["tuple(uint8,uint64,uint64,uint256)", "address[]"],
      args,
    );
    return {
      id: ERC20_PLUGIN_ID,
      data: hexToBytes(strip0x(data)),
    };
  }
  /**
   * Computes the parameters to be given when creating a proposal that updates the governance configuration
   *
   * @param {string} pluginAddress
   * @param {VotingSettings} params
   * @return {*}  {DaoAction}
   * @memberof ClientErc20Encoding
   */
  public updateVotingSettingsAction(
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
   * @param {IMintTokenParams} params
   * @return {*}  {DaoAction}
   * @memberof ClientErc20Encoding
   */
  public mintTokenAction(
    minterAddress: string,
    params: IMintTokenParams,
  ): DaoAction {
    if (!isAddress(minterAddress) || !isAddress(params.address)) {
      throw new InvalidAddressError();
    }
    const votingInterface = IERC20MintableUpgradeable__factory
      .createInterface();
    const args = mintTokenParamsToContract(params);
    // get hex bytes
    const hexBytes = votingInterface.encodeFunctionData("mint", args);
    const data = hexToBytes(strip0x(hexBytes));
    return {
      to: minterAddress,
      value: BigInt(0),
      data,
    };
  }
}
