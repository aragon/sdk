import { AllowlistVoting__factory } from "@aragon/core-contracts-ethers";
import { Random } from "@aragon/sdk-common";
import {
  ClientCore,
  ContextPlugin,
  GasFeeEstimation,
  ICreateProposalParams,
  IExecuteProposalParams,
  IVoteProposalParams,
} from "../../../client-common";
import { IClientAddressListEstimation } from "../../interfaces";

/**
 * Estimation module the SDK Address List Client
 */
export class ClientAddressListEstimation extends ClientCore
  implements IClientAddressListEstimation {
  constructor(context: ContextPlugin) {
    super(context);
    Object.freeze(ClientAddressListEstimation.prototype);
    Object.freeze(this);
  }

  /**
   * Estimates the gas fee of creating a proposal on the plugin
   *
   * @param {ICreateProposalParams} params
   * @return {*}  {Promise<GasFeeEstimation>}
   * @memberof ClientAddressListEstimation
   */
  public async createProposal(
    params: ICreateProposalParams,
  ): Promise<GasFeeEstimation> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (!signer.provider) {
      throw new Error("A web3 provider is needed");
    }

    const addresslistContract = AllowlistVoting__factory.connect(
      params.pluginAddress,
      signer,
    );

    const startTimestamp = params.startDate?.getTime() || 0;
    const endTimestamp = params.endDate?.getTime() || 0;

    const estimatedGasFee = await addresslistContract.estimateGas.createVote(
      [], // TODO: Compute the cid instead of hardcoded empty value
      [],
      Math.round(startTimestamp / 1000),
      Math.round(endTimestamp / 1000),
      params.executeOnPass || false,
      params.creatorVote || 0,
    );
    return this.web3.getApproximateGasFee(estimatedGasFee.toBigInt());
  }

  /**
   * Estimates the gas fee of casting a vote on a proposal
   *
   * @param {IVoteProposalParams} _params
   * @return {*}  {Promise<GasFeeEstimation>}
   * @memberof ClientAddressListEstimation
   */
  public voteProposal(_params: IVoteProposalParams): Promise<GasFeeEstimation> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (!signer.provider) {
      throw new Error("A web3 provider is needed");
    }
    // TODO: Implement
    return Promise.resolve(
      this.web3.getApproximateGasFee(Random.getBigInt(BigInt(1500))),
    );
  }

  /**
   * Estimates the gas fee of executing an AddressList proposal
   *
   * @param {IExecuteProposalParams} _params
   * @return {*}  {Promise<GasFeeEstimation>}
   * @memberof ClientAddressListEstimation
   */
  public executeProposal(
    _params: IExecuteProposalParams,
  ): Promise<GasFeeEstimation> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (!signer.provider) {
      throw new Error("A web3 provider is needed");
    }
    // TODO: Implement
    return Promise.resolve(
      this.web3.getApproximateGasFee(Random.getBigInt(BigInt(1500))),
    );
  }
}
