import { AddresslistVoting__factory } from "@aragon/core-contracts-ethers";
import {
  ClientCore,
  ContextPlugin,
  GasFeeEstimation,
  ICreateProposalParams,
  isProposalId,
  IVoteProposalParams,
} from "../../../client-common";
import { IAddresslistVotingClientEstimation } from "../../interfaces";
import { toUtf8Bytes } from "@ethersproject/strings";
import {
  boolArrayToBitmap,
  decodeProposalId,
  InvalidProposalIdError,
  NoProviderError,
  NoSignerError,
} from "@aragon/sdk-common";

/**
 * Estimation module the SDK Address List Client
 */
export class AddresslistVotingClientEstimation extends ClientCore
  implements IAddresslistVotingClientEstimation {
  constructor(context: ContextPlugin) {
    super(context);
    Object.freeze(AddresslistVotingClientEstimation.prototype);
    Object.freeze(this);
  }

  /**
   * Estimates the gas fee of creating a proposal on the plugin
   *
   * @param {ICreateProposalParams} params
   * @return {*}  {Promise<GasFeeEstimation>}
   * @memberof AddresslistVotingClientEstimation
   */
  public async createProposal(
    params: ICreateProposalParams,
  ): Promise<GasFeeEstimation> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new NoSignerError();
    } else if (!signer.provider) {
      throw new NoProviderError();
    }

    const addresslistContract = AddresslistVoting__factory.connect(
      params.pluginAddress,
      signer,
    );

    if (
      params.failSafeActions?.length &&
      params.failSafeActions.length !== params.actions?.length
    ) {
      throw new Error(
        "Size mismatch: actions and failSafeActions should match",
      );
    }
    const allowFailureMap = boolArrayToBitmap(params.failSafeActions);

    const startTimestamp = params.startDate?.getTime() || 0;
    const endTimestamp = params.endDate?.getTime() || 0;

    const estimatedGasFee = await addresslistContract.estimateGas
      .createProposal(
        toUtf8Bytes(params.metadataUri),
        params.actions || [],
        allowFailureMap,
        Math.round(startTimestamp / 1000),
        Math.round(endTimestamp / 1000),
        params.creatorVote || 0,
        params.executeOnPass || false,
      );
    return this.web3.getApproximateGasFee(estimatedGasFee.toBigInt());
  }

  /**
   * Estimates the gas fee of casting a vote on a proposal
   *
   * @param {IVoteProposalParams} params
   * @return {*}  {Promise<GasFeeEstimation>}
   * @memberof AddresslistVotingClientEstimation
   */
  public async voteProposal(
    params: IVoteProposalParams,
  ): Promise<GasFeeEstimation> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new NoSignerError();
    } else if (!signer.provider) {
      throw new NoProviderError();
    }

    const { pluginAddress, id } = decodeProposalId(
      params.proposalId,
    );

    const addresslistContract = AddresslistVoting__factory.connect(
      pluginAddress,
      signer,
    );

    const estimation = await addresslistContract.estimateGas.vote(
      id,
      params.vote,
      false,
    );
    return this.web3.getApproximateGasFee(estimation.toBigInt());
  }

  /**
   * Estimates the gas fee of executing an AddressList proposal
   *
   * @param {string} proposalId
   * @return {*}  {Promise<GasFeeEstimation>}
   * @memberof AddresslistVotingClientEstimation
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

    const { pluginAddress, id } = decodeProposalId(
      proposalId,
    );

    const addresslistContract = AddresslistVoting__factory.connect(
      pluginAddress,
      signer,
    );
    const estimation = await addresslistContract.estimateGas.execute(
      id,
    );
    return this.web3.getApproximateGasFee(estimation.toBigInt());
  }
}
