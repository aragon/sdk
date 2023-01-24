import {
  ExecuteAdminProposalParams,
  IAdminClientEstimation,
} from "../../interfaces";
import {
  ClientCore,
  ContextPlugin,
  GasFeeEstimation,
} from "../../../client-common";
import { NoProviderError, NoSignerError } from "@aragon/sdk-common";
import { Admin__factory } from "@aragon/core-contracts-ethers";
import { toUtf8Bytes } from "@ethersproject/strings"

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
   * @param {ExecuteAdminProposalParams} params
   * @return {*}  {Promise<GasFeeEstimation>}
   * @memberof AdminClientEstimation
   */
  public async executeProposal(
    params: ExecuteAdminProposalParams,
  ): Promise<GasFeeEstimation> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new NoSignerError();
    } else if (!signer.provider) {
      throw new NoProviderError();
    }
    const adminContract = Admin__factory.connect(
      params.pluginAddress,
      signer,
    );
    const estimatedGasFee = await adminContract.estimateGas.executeProposal(
      toUtf8Bytes(params.metadataUri),
      params.actions,
    );
    return this.web3.getApproximateGasFee(estimatedGasFee.toBigInt());
  }
}
