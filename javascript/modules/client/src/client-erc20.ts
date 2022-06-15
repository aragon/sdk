import {
  IClientErc20,
  ICreateProposalParams,
  IErc20FactoryParams,
  IWithdrawParams,
  VoteOptions,
  VotingConfig,
} from "./internal/interfaces/plugins";
import {
  DAO__factory,
  GovernanceERC20__factory,
  IDAO,
} from "@aragon/core-contracts-ethers";
import { BigNumber } from "@ethersproject/bignumber";
import { AddressZero } from "@ethersproject/constants";
import { ClientCore } from "./internal/core";
import {
  DaoAction,
  DaoConfig,
  FactoryInitParams,
} from "./internal/interfaces/common";

/**
 * Provider a generic client with high level methods to manage and interact with DAO's
 */
export class ClientErc20 extends ClientCore implements IClientErc20 {
  /** Contains all the generic high level methods to interact with a DAO */
  methods = {
    createProposal: (params: ICreateProposalParams) =>
      this._createProposal(params),
    voteProposal: (proposalId: string, approve: VoteOptions) =>
      this._voteProposal(proposalId, approve),
    executeProposal: (proposalId: string) => this._executeProposal(proposalId),
    setDaoConfig: (address: string, config: DaoConfig) =>
      this._setDaoConfig(address, config),
    setVotingConfig: (address: string, config: VotingConfig) =>
      this._setVotingConfig(address, config),
  };

  // ACTION BUILDERS

  actionBuilder = {
    /** Computes the parameters to be given when creating the DAO, so that the plugin is configured */
    init: (params: IErc20FactoryParams) => this._buildActionInit(params),
    /** Compones the action payload to pass upon proposal creation */
    withdraw: (to: string, value: bigint, params: IWithdrawParams) =>
      this._buildActionWithdraw(to, value, params),
  };

  // ESTIMATION HANDLERS

  /** Contains the gas estimation of the Ethereum transactions */
  estimation = {
    createProposal: (params: ICreateProposalParams) =>
      this._estimateCreateProposal(params),
    voteProposal: (proposalId: string, approve: VoteOptions) =>
      this._estimateVoteProposal(proposalId, approve),
    executeProposal: (proposalId: string) =>
      this._estimateExecuteProposal(proposalId),
    setDaoConfig: (address: string, config: DaoConfig) =>
      this._estimateSetDaoConfig(address, config),
    setVotingConfig: (address: string, config: VotingConfig) =>
      this._estimateSetVotingConfig(address, config),
  };

  // PRIVATE METHOD IMPLEMENTATIONS

  private _createProposal(params: ICreateProposalParams) {
    // TODO: Unimplemented
    throw new Error("Unimplemented");
  }
  private _voteProposal(proposalId: string, approve: VoteOptions) {
    // TODO: Unimplemented
    throw new Error("Unimplemented");
  }
  private _executeProposal(proposalId: string) {
    // TODO: Unimplemented
    throw new Error("Unimplemented");
  }
  private _setDaoConfig(address: string, config: DaoConfig) {
    // TODO: Unimplemented
    throw new Error("Unimplemented");
  }
  private _setVotingConfig(address: string, config: VotingConfig) {
    // TODO: Unimplemented
    throw new Error("Unimplemented");
  }

  // PRIVATE ACTION BUILDER HANDLERS

  private _buildActionInit(params: IErc20FactoryParams): FactoryInitParams {
    // TODO: Unimplemented
    throw new Error("Unimplemented");
  }

  private _buildActionWithdraw(
    to: string,
    value: bigint,
    params: IWithdrawParams,
  ): DaoAction {
    const data = encodeWithdrawActionData(params);
    return { to, value, data };
  }

  // PRIVATE METHOD GAS ESTIMATIONS

  private _estimateCreateProposal(params: ICreateProposalParams) {
    // TODO: Unimplemented
    return Promise.resolve(BigInt(0));
  }
  private _estimateVoteProposal(proposalId: string, approve: VoteOptions) {
    // TODO: Unimplemented
    return Promise.resolve(BigInt(0));
  }
  private _estimateExecuteProposal(proposalId: string) {
    // TODO: Unimplemented
    return Promise.resolve(BigInt(0));
  }
  private _estimateSetDaoConfig(address: string, config: DaoConfig) {
    // TODO: Unimplemented
    return Promise.resolve(BigInt(0));
  }
  private _estimateSetVotingConfig(address: string, config: VotingConfig) {
    // TODO: Unimplemented
    return Promise.resolve(BigInt(0));
  }

  // EXAMPLE:

  // _estimateDeposit(params: IDepositParams) {
  //   const signer = this.web3.getConnectedSigner();
  //   if (!signer) {
  //     throw new Error("A signer is needed for estimating the gas cost");
  //   }

  //   const [
  //     daoAddress,
  //     amount,
  //     tokenAddress,
  //     reference,
  //   ] = unwrapDepositParameters(params);

  //   const daoInstance = DAO__factory.connect(daoAddress, signer);

  //   const override = tokenAddress !== AddressZero ? {} : {
  //     value: amount,
  //   };

  //   return daoInstance.estimateGas.deposit(
  //     tokenAddress,
  //     amount,
  //     reference,
  //     override,
  //   ).then((gasLimit) => this.web3.getApproximateGasFee(gasLimit.toBigInt()));
  // }
}

// PARAMETER TEMPLATES

function unwrapProposalParameters(
  params: ICreateProposalParams,
): [
  string,
  IDAO.ActionStruct[],
  number,
  number,
  boolean,
  number,
] {
  return [
    params.metadata,
    params.actions ?? [],
    params.startDate ?? 0,
    params.endDate ?? 0,
    params.executeIfPassed ?? false,
    params.creatorVote ?? VoteOptions.NONE,
  ];
}

function encodeWithdrawActionData(params: IWithdrawParams): string {
  const daoInterface = DAO__factory.createInterface();
  return daoInterface.encodeFunctionData(
    "withdraw",
    unwrapWithdrawParameters(params),
  );
}

function unwrapWithdrawParameters(
  params: IWithdrawParams,
): [string, string, BigNumber, string] {
  return [
    params.token ?? AddressZero,
    params.to,
    BigNumber.from(params.amount),
    params.reference ?? "",
  ];
}
