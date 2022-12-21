import {
  InvalidProposalIdError,
  NoProviderError,
  NoSignerError,
} from "@aragon/sdk-common";
import {
  ClientCore,
  ContextPlugin,
  GasFeeEstimation,
  isProposalId,
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
   * @param {CreateMultisigProposalParams} params
   * @return {*}  {Promise<GasFeeEstimation>}
   * @memberof MultisigClientEstimation
   */
  public async createProposal(
    params: CreateMultisigProposalParams,
  ): Promise<GasFeeEstimation> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new NoSignerError();
    } else if (!signer.provider) {
      throw new NoProviderError();
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
      params.approve || false,
      params.tryExecution || true,
    );
    return this.web3.getApproximateGasFee(estimation.toBigInt());
  }

  /**
   * Estimates the gas fee of approving a proposal
   *
   * @param {ApproveMultisigProposalParams} params
   * @return {*}  {Promise<GasFeeEstimation>}
   * @memberof MultisigClientEstimation
   */
  public async approveProposal(
    params: ApproveMultisigProposalParams,
  ): Promise<GasFeeEstimation> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new NoSignerError();
    } else if (!signer.provider) {
      throw new NoProviderError();
    }
    if (isProposalId(params.proposalId)) {
      throw new InvalidProposalIdError();
    }
    const pluginAddress = params.proposalId.substring(0, 42);
    // @ts-ignore
    // TODO
    // update factory
    const multisigContract = MultisigVoting__factory.connect(
      pluginAddress,
      signer,
    );

    const estimation = await multisigContract.estimateGas.approveProposal(
      params.proposalId,
      params.tryExecution,
    );
    return this.web3.getApproximateGasFee(estimation.toBigInt());
  }
  /**
   * Estimates the gas fee of executing a proposal
   *
   * @param {string} proposalId
   * @return {*}  {Promise<GasFeeEstimation>}
   * @memberof MultisigClientEstimation
   */
  public async executeProposal(
    proposalId: string,
  ): Promise<GasFeeEstimation> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new NoSignerError();
    } else if (!signer.provider) {
      throw new NoProviderError();
    }
    if (isProposalId(proposalId)) {
      throw new InvalidProposalIdError();
    }

    const pluginAddress = proposalId.substring(0, 42);
    // @ts-ignore
    // TODO
    // update factory
    const multisigContract = MultisigVoting__factory.connect(
      pluginAddress,
      signer,
    );

    const estimation = await multisigContract.estimateGas.executeProposal(
      proposalId,
    );
    return this.web3.getApproximateGasFee(estimation.toBigInt());
  }
}
