import { ClientCore } from "./internal/core";
import { DaoConfig } from "./internal/common";
import {
  IClientERC20Governance,
  IClientWhitelistGovernance,
  ICreateProposal,
  VoteOption,
  VotingConfig,
} from "./internal/interfaces/packages";
export { IClientERC20Governance, IClientWhitelistGovernance };
import {
  ERC20Voting__factory,
  IDAO,
  WhitelistVoting__factory,
} from "@aragon/core-contracts-ethers";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";

export class ClientERC20Governance extends ClientCore
  implements IClientERC20Governance {
  /** Operations that mutate the DAO state */
  methods = {
    createProposal: (
      votingAddress: string,
      params: ICreateProposal
    ): Promise<BigNumber> => {
      if (!this.signer)
        return Promise.reject(
          new Error("A signer is needed for creating a DAO")
        );
      else if (!votingAddress)
        return Promise.reject(
          new Error(
            "A voting contract address is needed for creating a proposal"
          )
        );
      const erc20VotingInstance = ERC20Voting__factory.connect(
        votingAddress,
        this.connectedSigner
      );

      return erc20VotingInstance
        .newVote(...ClientERC20Governance.createProposalParameters(params))
        .then(tx => tx.wait())
        .then(cr => {
          const startVoteEvent = cr.events?.find(
            e => e.event === "StartVote"
          );
          if (!startVoteEvent)
            return Promise.reject(
              new Error("Could not find StartVote event")
            );

          return startVoteEvent.args?.voteId;
        });
    },
    voteProposal: (_proposalId: string, _approve: boolean): Promise<void> => {
      // TODO: Not implemented
      return Promise.resolve();
    },
    executeProposal: (_proposalId: string): Promise<void> => {
      // TODO: Not implemented
      return Promise.resolve();
    },
    setDaoConfig: (_address: string, _config: DaoConfig): Promise<void> => {
      // TODO: Not implemented
      return Promise.resolve();
    },
    setVotingConfig: (
      _address: string,
      _config: VotingConfig
    ): Promise<void> => {
      // TODO: Not implemented
      return Promise.resolve();
    },
  };

  // HELPERS

  protected static createProposalParameters(
    params: ICreateProposal
  ): [
    string,
    IDAO.ActionStruct[],
    BigNumberish,
    BigNumberish,
    boolean,
    BigNumberish
  ] {
    return [
      params.metadata,
      params.actions ?? [],
      params.startDate ?? 0,
      params.endDate ?? 0,
      params.executeIfDecided ?? false,
      params.creatorChoice ?? VoteOption.NONE,
    ];
  }
}

export class ClientWhitelistGovernance extends ClientCore
  implements IClientWhitelistGovernance {
  /** DAO related methods */
  methods = {
    createProposal: (
      votingAddress: string,
      params: ICreateProposal
    ): Promise<BigNumber> => {
      if (!this.signer)
        return Promise.reject(
          new Error("A signer is needed for creating a DAO")
        );
      else if (!votingAddress)
        return Promise.reject(
          new Error(
            "A voting contract address is needed for creating a proposal"
          )
        );
      const whitelistVotingInstance = WhitelistVoting__factory.connect(
        votingAddress,
        this.connectedSigner
      );

      return whitelistVotingInstance
        .newVote(...ClientWhitelistGovernance.createProposalParameters(params))
        .then(tx => tx.wait())
        .then(cr => {
          const startVoteEvent = cr.events?.find(
            e => e.event === "StartVote"
          );
          if (!startVoteEvent)
            return Promise.reject(
              new Error("Could not find StartVote event")
            );

          return startVoteEvent.args?.voteId;
        });
    },
    voteProposal: (_proposalId: string, _approve: boolean): Promise<void> => {
      // TODO: Not implemented
      return Promise.resolve();
    },
    executeProposal: (_proposalId: string): Promise<void> => {
      // TODO: Not implemented
      return Promise.resolve();
    },
    setDaoConfig: (_address: string, _config: DaoConfig): Promise<void> => {
      // TODO: Not implemented
      return Promise.resolve();
    },
    setVotingConfig: (
      _address: string,
      _config: VotingConfig
    ): Promise<void> => {
      // TODO: Not implemented
      return Promise.resolve();
    },
  };

  // HELPERS

  protected static createProposalParameters(
    params: ICreateProposal
  ): [
    string,
    IDAO.ActionStruct[],
    BigNumberish,
    BigNumberish,
    boolean,
    BigNumberish
  ] {
    return [
      params.metadata,
      params.actions ?? [],
      params.startDate ?? 0,
      params.endDate ?? 0,
      params.executeIfDecided ?? false,
      params.creatorChoice ?? VoteOption.NONE,
    ];
  }
}
