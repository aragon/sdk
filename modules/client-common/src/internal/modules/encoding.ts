import {
  hexToBytes,
  InvalidAddressError,
  UnsupportedNetworkError,
} from "@aragon/sdk-common";
import { ClientCore } from "../core";
import {
  ApplyInstallationParams,
  DaoAction,
  SupportedNetwork,
  SupportedNetworksArray,
} from "../types";
import { isAddress } from "@ethersproject/address";
import { PluginSetupProcessor__factory } from "@aragon/osx-ethers";
import { applyInstallatonParamsToContract } from "../utils";
import { LIVE_CONTRACTS } from "../constants";

export class EncodingModule extends ClientCore {
  public applyInstallationAction(
    daoAddress: string,
    params: ApplyInstallationParams,
  ): DaoAction {
    if (!isAddress(daoAddress)) {
      throw new InvalidAddressError();
    }
    const provider = this.web3.getProvider();
    const network = provider.network.name as SupportedNetwork;
    if (!SupportedNetworksArray.includes(network)) {
      throw new UnsupportedNetworkError(network);
    }
    const pspInterface = PluginSetupProcessor__factory.createInterface();

    const args = applyInstallatonParamsToContract(params);
    const hexBytes = pspInterface.encodeFunctionData("applyInstallation", [
      daoAddress,
      args,
    ]);
    return {
      to: LIVE_CONTRACTS[network].pluginSetupProcessor,
      value: BigInt(0),
      data: hexToBytes(hexBytes),
    };
  }
}
