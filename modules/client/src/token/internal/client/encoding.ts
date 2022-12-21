import { hexToBytes, InvalidAddressError, strip0x } from "@aragon/sdk-common";
import {
  ClientCore,
  ContextPlugin,
  DaoAction,
  encodeUpdatePluginSettingsAction,
  IPluginInstallItem,
  IPluginSettings,
} from "../../../client-common";
import { isAddress } from "@ethersproject/address";
import {
  IClientTokenEncoding,
  ITokenPluginInstall,
  IMintTokenParams,
} from "../../interfaces";
import { TOKEN_PLUGIN_ID } from "../constants";
import {
  TokenVoting__factory,
  ITokenMintableUpgradeable__factory,
} from "@aragon/core-contracts-ethers";
import { tokenInitParamsToContract, mintTokenParamsToContract } from "../utils";
/**
 * Encoding module the SDK Token Client
 */
export class ClientTokenEncoding extends ClientCore
  implements IClientTokenEncoding {
  constructor(context: ContextPlugin) {
    super(context);
    Object.freeze(ClientTokenEncoding.prototype);
    Object.freeze(this);
  }
  /**
   * Computes the parameters to be given when creating the DAO,
   * so that the plugin is configured
   *
   * @param {ITokenPluginInstall} params
   * @return {*}  {IPluginInstallItem}
   * @memberof ClientTokenEncoding
   */
  static getPluginInstallItem(params: ITokenPluginInstall): IPluginInstallItem {
    const tokenVotingInterface = TokenVoting__factory.createInterface();
    const args = tokenInitParamsToContract(params);
    // get hex bytes
    const hexBytes = tokenVotingInterface.encodeFunctionData(
      "initialize",
      args,
    );
    // Strip 0x => encode in Uint8Array
    const data = hexToBytes(strip0x(hexBytes));
    return {
      id: TOKEN_PLUGIN_ID,
      data,
    };
  }
  /**
   * Computes the parameters to be given when creating a proposal that updates the governance configuration
   *
   * @param {string} pluginAddress
   * @param {IPluginSettings} params
   * @return {*}  {DaoAction}
   * @memberof ClientTokenEncoding
   */
  public updatePluginSettingsAction(
    pluginAddress: string,
    params: IPluginSettings,
  ): DaoAction {
    if (!isAddress(pluginAddress)) {
      throw new Error("Invalid plugin address");
    }
    // TODO: check if to and value are correct
    return {
      to: pluginAddress,
      value: BigInt(0),
      data: encodeUpdatePluginSettingsAction(params),
    };
  }

  /**
   * Computes the parameters to be given when creating a proposal that mints an amount of ERC-20 tokens to an address
   *
   * @param {string} minterAddress
   * @param {IMintTokenParams} params
   * @return {*}  {DaoAction}
   * @memberof ClientTokenEncoding
   */
  public mintTokenAction(
    minterAddress: string,
    params: IMintTokenParams,
  ): DaoAction {
    if (!isAddress(minterAddress) || !isAddress(params.address)) {
      throw new InvalidAddressError();
    }
    const votingInterface = ITokenMintableUpgradeable__factory
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
