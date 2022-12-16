import {
  ExecuteProposalParams,
  IAdminClientEstimation,
} from "../../interfaces";
import {
  ClientCore,
  ContextPlugin,
  GasFeeEstimation,
} from "../../../client-common";

/**
 * Estimation module for the SDK Admin Client
 */
export class AdminClientEstimation extends ClientCore
  implements IAdminClientEstimation {
  constructor(context: ContextPlugin) {
    super(context);
  }
  /**
   * Estimates the gas fee of executing a proposal
   *
   * @param {ExecuteProposalParams} params
   * @return {*}  {Promise<GasFeeEstimation>}
   * @memberof AdminClientEstimation
   */
  public async executeProposal(
    params: ExecuteProposalParams,
  ): Promise<GasFeeEstimation> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (!signer.provider) {
      throw new Error("A web3 provider is needed");
    }
    // TODO
    // use new ethers contracts
    // @ts-ignore
    const adminContract = Admin__factory.connect(
      params.pluginAddress,
      signer,
    );
    const estimatedGasFee = await adminContract.estimateGas.execute(
      params.metadataUri,
      params.actions,
    );
    return this.web3.getApproximateGasFee(estimatedGasFee.toBigInt());
  }
}
