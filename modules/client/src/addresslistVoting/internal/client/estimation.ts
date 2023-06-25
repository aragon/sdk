import { AddresslistVoting__factory } from "@aragon/osx-ethers";
import {
  CreateMajorityVotingProposalParams,
  VoteProposalParams,
} from "../../../client-common";
import { IAddresslistVotingClientEstimation } from "../interfaces";
import { toUtf8Bytes } from "@ethersproject/strings";
import {
  boolArrayToBitmap,
  decodeProposalId,
  SizeMismatchError,
} from "@aragon/sdk-common";
import { ClientCore, GasFeeEstimation } from "@aragon/sdk-client-common";

/**
 * Estimation module the SDK Address List Client
 */
export class AddresslistVotingClientEstimation extends ClientCore
  implements IAddresslistVotingClientEstimation {
  /**
   * Estimates the gas fee of creating a proposal on the plugin
   *
   * @param {CreateMajorityVotingProposalParams} params
   * @return {*}  {Promise<GasFeeEstimation>}
   * @memberof AddresslistVotingClientEstimation
   */
  public async createProposal(
    params: CreateMajorityVotingProposalParams,
  ): Promise<GasFeeEstimation> {
    const signer = this.web3.getConnectedSigner();

    const addresslistContract = AddresslistVoting__factory.connect(
      params.pluginAddress,
      signer,
    );

    if (
      params.failSafeActions?.length &&
      params.failSafeActions.length !== params.actions?.length
    ) {
      throw new SizeMismatchError();
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
   * @param {VoteProposalParams} params
   * @return {*}  {Promise<GasFeeEstimation>}
   * @memberof AddresslistVotingClientEstimation
   */
  public async voteProposal(
    params: VoteProposalParams,
  ): Promise<GasFeeEstimation> {
    const signer = this.web3.getConnectedSigner();

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
