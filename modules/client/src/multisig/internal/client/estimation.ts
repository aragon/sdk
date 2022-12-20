import {
  ClientCore,
  ContextPlugin,
  GasFeeEstimation,
} from "../../../client-common";
import {
  ApproveMultisigProposalParams,
  CreateMultisigProposalParams,
  IMultisigClientEstimation,
} from "../../interfaces";

/**
 * Estimation module the SDK Address List Client
 */
export class MultisigClientEstimation extends ClientCore
  implements IMultisigClientEstimation {
  constructor(context: ContextPlugin) {
    super(context);
  }

  /**
   * Estimates the gas fee of creating a proposal on the plugin
   *
   * @param {CreateProposalParams} params
   * @return {*}  {Promise<GasFeeEstimation>}
   * @memberof ClientAddressListEstimation
   */
  public async createProposal(
    params: CreateMultisigProposalParams,
  ): Promise<GasFeeEstimation> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (!signer.provider) {
      throw new Error("A web3 provider is needed");
    }

    // @ts-ignore
    // TODO
    // update factory
    const multisigContract = MultisigVoting__factory.connect(
      params.pluginAddress,
      signer,
    );

    const estimation = await multisigContract.estimateGas.createProposal(
      params.metadataUri,
      params.actions || [],
    );
    return this.web3.getApproximateGasFee(estimation.toBigInt());
  }

  /**
   * Estimates the gas fee of approving a proposal
   *
   * @param {IVoteProposalParams} params
   * @return {*}  {Promise<GasFeeEstimation>}
   * @memberof ClientAddressListEstimation
   */
  public async approveProposal(
    params: ApproveMultisigProposalParams,
  ): Promise<GasFeeEstimation> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (!signer.provider) {
      throw new Error("A web3 provider is needed");
    }
    // @ts-ignore
    // TODO
    // update factory
    const multisigContract = MultisigVoting__factory.connect(
      params.pluginAddress,
      signer,
    );

    const estimation = await multisigContract.estimateGas.approveProposal(
      params.proposalId,
    );
    return this.web3.getApproximateGasFee(estimation.toBigInt());
  }
}
