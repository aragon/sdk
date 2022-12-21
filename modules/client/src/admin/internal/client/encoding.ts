import {
  hexToBytes,
  InvalidAddressOrEnsError,
  strip0x,
} from "@aragon/sdk-common";
import {
  ClientCore,
  ContextPlugin,
  IPluginInstallItem,
} from "../../../client-common";
import { IAdminClientEncoding } from "../../interfaces";
import { ADMIN_PLUGIN_ID } from "../constants";
import { isAddress } from "@ethersproject/address";
import { Admin__factory } from "@aragon/core-contracts-ethers";

/**
 * Encoding module for the SDK Admin Client
 */
export class AdminClientEncoding extends ClientCore
  implements IAdminClientEncoding {
  constructor(context: ContextPlugin) {
    super(context);
  }

  /**
   * Computes the parameters to be given when creating the DAO,
   * so that the plugin is configured
   *
   * @param {IAdminPluginInstall} params
   * @return {*}  {IPluginInstallItem}
   * @memberof ClientAddressListEncoding
   */
  static getPluginInstallItem(
    addressOrEns: string,
  ): IPluginInstallItem {
    if (!isAddress(addressOrEns)) {
      throw new InvalidAddressOrEnsError();
    }
    const adminInterface = Admin__factory.createInterface();
    const hexBytes = adminInterface.encodeFunctionData(
      "initialize",
      [addressOrEns],
    );
    return {
      id: ADMIN_PLUGIN_ID,
      data: hexToBytes(strip0x(hexBytes)),
    };
  }
}
