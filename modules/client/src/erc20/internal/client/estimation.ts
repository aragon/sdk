import { ERC20Voting__factory } from "@aragon/core-contracts-ethers";
import { IpfsPinError } from "@aragon/sdk-common";
import {
  ClientCore,
  ContextPlugin,
  GasFeeEstimation,
  ICreateProposalParams,
  IExecuteProposalParams,
  IVoteProposalParams,
} from "../../../client-common";
import { IClientErc20Estimation } from "../../interfaces";
import { toUtf8Bytes } from "@ethersproject/strings";
/**
 * Estimation module the SDK ERC20 Client
 */
export class ClientErc20Estimation extends ClientCore
  implements IClientErc20Estimation {
  constructor(context: ContextPlugin) {
    super(context);
    Object.freeze(ClientErc20Estimation.prototype);
    Object.freeze(this);
  }
  /**
   * Estimates the gas fee of creating a proposal on the plugin
   *
   * @param {ICreateProposalParams} params
   * @return {*}  {Promise<GasFeeEstimation>}
   * @memberof ClientErc20Estimation
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

    const erc20Contract = ERC20Voting__factory.connect(
      params.pluginAddress,
      signer,
    );

    let cid = "";
    try {
      // TODO: Compute the cid instead of uploading to the cluster
      cid = await this.ipfs.add(JSON.stringify(params.metadata));
    } catch {
      throw new IpfsPinError();
    }

    const startTimestamp = params.startDate?.getTime() || 0;
    const endTimestamp = params.endDate?.getTime() || 0;

    const estimatedGasFee = await erc20Contract.estimateGas.createVote(
      toUtf8Bytes(cid),
      params.actions || [],
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
   * @param {IVoteProposalParams} params
   * @return {*}  {Promise<GasFeeEstimation>}
   * @memberof ClientErc20Estimation
   */
  public async voteProposal(
    params: IVoteProposalParams,
  ): Promise<GasFeeEstimation> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (!signer.provider) {
      throw new Error("A web3 provider is needed");
    }
    const erc20VotingContract = ERC20Voting__factory.connect(
      params.pluginAddress,
      signer,
    );

    const estimation = await erc20VotingContract.estimateGas.vote(
      params.proposalId,
      params.vote,
      false,
    );
    return this.web3.getApproximateGasFee(estimation.toBigInt());
  }

  /**
   * Estimates the gas fee of executing an ERC20 proposal
   *
   * @param {IExecuteProposalParams} _params
   * @return {*}  {Promise<GasFeeEstimation>}
   * @memberof ClientErc20Estimation
   */
  public async executeProposal(
    _params: IExecuteProposalParams,
  ): Promise<GasFeeEstimation> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new Error("A signer is needed");
    } else if (!signer.provider) {
      throw new Error("A web3 provider is needed");
    }

    const erc20VotingContract = ERC20Voting__factory.connect(
      _params.pluginAddress,
      signer,
    );
    const estimation = await erc20VotingContract.estimateGas.execute(
      _params.proposalId,
    );
    return this.web3.getApproximateGasFee(estimation.toBigInt());
  }
}
