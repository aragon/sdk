import { PluginSetupProcessor__factory } from "@aragon/osx-ethers";
import { ClientCore } from "../core";
import { GasFeeEstimation, PrepareInstallationParams } from "../types";

export class EstimationModule extends ClientCore {
  public async prepareInstallation(
    params: PrepareInstallationParams,
  ): Promise<GasFeeEstimation> {
    const signer = this.web3.getConnectedSigner();
    const pspContract = PluginSetupProcessor__factory.connect(
      this.web3.getDaoFactoryAddress(),
      signer,
    );
    const gasEstimation = await pspContract.estimateGas.prepareInstallation(
      params.daoAddressOrEns,
      {
        pluginSetupRef: {
          pluginSetupRepo: params.pluginRepo,
          versionTag: params.version || { release: 1, build: 1 },
        },
        data: "0x",
      },
    );
    return this.web3.getApproximateGasFee(gasEstimation.toBigInt());
  }
}
