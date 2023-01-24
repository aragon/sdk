import {
  ClientCore,
  ContextPlugin,
  IPluginInstallItem,
} from "../../../client-common";
import { IAdminClientEncoding } from "../../interfaces";
import { ADMIN_PLUGIN_ID } from "../constants";
import { defaultAbiCoder } from "@ethersproject/abi";
import { toUtf8Bytes } from "@ethersproject/strings";
import { isAddress } from "@ethersproject/address";
import { InvalidAddressOrEnsError } from "@aragon/sdk-common";

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
   * @param {string} addressOrEns
   * @return {*}  {IPluginInstallItem}
   * @memberof AdminClientEncoding
   */
  static getPluginInstallItem(
    addressOrEns: string,
  ): IPluginInstallItem {
    if (!isAddress(addressOrEns)) {
      throw new InvalidAddressOrEnsError();
    }
    const hexBytes = defaultAbiCoder.encode(
      [
        "address",
      ],
      [
        addressOrEns,
      ],
    );
    return {
      id: ADMIN_PLUGIN_ID,
      data: toUtf8Bytes(hexBytes),
    };
  }
}
