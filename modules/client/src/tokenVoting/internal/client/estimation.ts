import {
  GovernanceERC20__factory,
  TokenVoting__factory,
} from "@aragon/osx-ethers";
import {
  ClientCore,
<<<<<<< HEAD
  GasFeeEstimation,
=======
  ContextPlugin,
>>>>>>> 9a70c2d (fix comments)
  CreateMajorityVotingProposalParams,
  GasFeeEstimation,
  IVoteProposalParams,
} from "../../../client-common";
import {
  DelegateTokensParams,
  ITokenVotingClientEstimation,
} from "../../interfaces";
import { toUtf8Bytes } from "@ethersproject/strings";
import {
  boolArrayToBitmap,
  decodeProposalId,
  NoProviderError,
  NoSignerError,
} from "@aragon/sdk-common";
/**
 * Estimation module the SDK TokenVoting Client
 */
export class TokenVotingClientEstimation extends ClientCore
  implements ITokenVotingClientEstimation {
  /**
   * Estimates the gas fee of creating a proposal on the plugin
   *
   * @param {CreateMajorityVotingProposalParams} params
   * @return {*}  {Promise<GasFeeEstimation>}
   * @memberof TokenVotingClientEstimation
   */
  public async createProposal(
    params: CreateMajorityVotingProposalParams,
  ): Promise<GasFeeEstimation> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new NoSignerError();
    } else if (!signer.provider) {
      throw new NoProviderError();
    }

    const tokenVotingContract = TokenVoting__factory.connect(
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

    const estimatedGasFee = await tokenVotingContract.estimateGas
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
   * @memberof TokenVotingClientEstimation
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

    const tokenVotingContract = TokenVoting__factory.connect(
      pluginAddress,
      signer,
    );

    const estimation = await tokenVotingContract.estimateGas.vote(
      id,
      params.vote,
      false,
    );
    return this.web3.getApproximateGasFee(estimation.toBigInt());
  }

  /**
   * Estimates the gas fee of executing a TokenVoting proposal
   *
   * @param {string} proposalId
   * @return {*}  {Promise<GasFeeEstimation>}
   * @memberof TokenVotingClientEstimation
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

    const tokenVotingContract = TokenVoting__factory.connect(
      pluginAddress,
      signer,
    );
    const estimation = await tokenVotingContract.estimateGas.execute(
      id,
    );
    return this.web3.getApproximateGasFee(estimation.toBigInt());
  }
  
  /**
   * Estimates the gas fee of delegating voting power to a delegatee
   *
   * @param {DelegateTokensParams} params
   * @return {*}  {Promise<GasFeeEstimation>}
   * @memberof TokenVotingClientEstimation
   */
  public async delegateTokens(
    params: DelegateTokensParams,
  ): Promise<GasFeeEstimation> {
    const signer = this.web3.getConnectedSigner();
    const governanceErc20Contract = GovernanceERC20__factory.connect(
      params.tokenAddress,
      signer,
    );
    const estimation = await governanceErc20Contract.estimateGas.delegate(
      params.delegatee,
    );
    return this.web3.getApproximateGasFee(estimation.toBigInt());
  }

  /**
   * Estimates the gas fee of undelegating voting power
   *
   * @param {string} tokenAddress
   * @return {*}  {Promise<GasFeeEstimation>}
   * @memberof TokenVotingClientEstimation
   */
  public async undelegateTokens(
    tokenAddress: string,
  ): Promise<GasFeeEstimation> {
    const signer = this.web3.getConnectedSigner();
    return this.delegateTokens({
      tokenAddress,
      delegatee: await signer.getAddress(),
    });
  }
}
