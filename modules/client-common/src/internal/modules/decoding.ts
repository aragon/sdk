import { PluginSetupProcessor__factory } from "@aragon/osx-ethers";
import { DecodedApplyInstallationParams } from "../types";
import { bytesToHex } from "@aragon/sdk-common";
import { applyInstallatonParamsFromContract } from "../utils";
import { ClientCore } from "../core";

export class DecodingModule extends ClientCore
{  public applyInstallationAction(
    data: Uint8Array,
  ): DecodedApplyInstallationParams {
    const pspInterface = PluginSetupProcessor__factory.createInterface();
    const hexBytes = bytesToHex(data);
    const expectedFunction = pspInterface.getFunction("applyInstallation");
    const result = pspInterface.decodeFunctionData(expectedFunction, hexBytes);
    return applyInstallatonParamsFromContract(result);
  }
}
