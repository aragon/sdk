import { Multisig__factory } from "@aragon/core-contracts-ethers";
import {
  InvalidAddressError,
  NoProviderError,
  NoSignerError,
} from "@aragon/sdk-common";
import {
  ClientCore,
  ContextPlugin,
  executeProposalParamsSchema,
  GasFeeEstimation,
} from "../../../client-common";
import {
  ApproveMultisigProposalParams,
  CreateMultisigProposalParams,
  ExecuteProposalParams,
  IMultisigClientEstimation,
} from "../../interfaces";
import { toUtf8Bytes } from "@ethersproject/strings";
import { isAddress } from "@ethersproject/address";
import { approveMultisigProposalSchema, createMultisigProposalSchema } from "../schemas";
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

    createMultisigProposalSchema.validateSync(params)

    const multisigContract = Multisig__factory.connect(
      params.pluginAddress,
      signer,
    );

    const estimation = await multisigContract.estimateGas.createProposal(
      toUtf8Bytes(params.metadataUri),
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

    approveMultisigProposalSchema.validateSync(params)

    const multisigContract = Multisig__factory.connect(
      params.pluginAddress,
      signer,
    );

    const estimation = await multisigContract.estimateGas.approve(
      params.proposalId,
      params.tryExecution,
    );
    return this.web3.getApproximateGasFee(estimation.toBigInt());
  }
  /**
   * Estimates the gas fee of executing a proposal
   *
   * @param {ExecuteProposalParams} params
   * @return {*}  {Promise<GasFeeEstimation>}
   * @memberof MultisigClientEstimation
   */
  public async executeProposal(
    params: ExecuteProposalParams,
  ): Promise<GasFeeEstimation> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new NoSignerError();
    } else if (!signer.provider) {
      throw new NoProviderError();
    }
    executeProposalParamsSchema.validateSync(params)
    // TODO
    // update with yup and new propsal ID
    // if (isProposalId(proposalId)) {
    //   throw new InvalidProposalIdError();
    // }

    // const pluginAddress = proposalId.substring(0, 42);
    const multisigContract = Multisig__factory.connect(
      params.pluginAddress,
      signer,
    );

    const estimation = await multisigContract.estimateGas.execute(
      params.proposalId,
    );
    return this.web3.getApproximateGasFee(estimation.toBigInt());
  }
}
