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
    // TODO
    // use new ethers contracts
    // @ts-ignore
    const adminInterface = Admin__factory.createInterface();
    // get hex bytes
    const hexBytes = adminInterface.encodeFunctionData(
      "initialize",
      [addressOrEns],
    );
    const data = hexToBytes(strip0x(hexBytes));
    return {
      id: ADMIN_PLUGIN_ID,
      data,
    };
  }
}
