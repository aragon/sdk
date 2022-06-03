import { ClientCore } from "./internal/client-core";
import {
  DaoConfig,
  DaoRole,
  IClientDaoBase,
  IClientDaoERC20Voting,
  IClientDaoWhitelistVoting,
  ICreateDaoERC20Voting,
  ICreateDaoWhitelistVoting,
  ICreateProposal,
  IDeposit,
  IGasFeeEstimation,
  IProposalAction,
  IWithdraw,
  VotingConfig,
} from "./internal/interfaces/dao";
import {
  DAOFactory,
  DAOFactory__factory,
  ERC20Voting__factory,
  Registry__factory,
  TokenFactory,
  WhitelistVoting__factory,
} from "@aragon/core-contracts-ethers";
import { BigNumber } from "@ethersproject/bignumber";

export {
  ICreateDaoERC20Voting,
  ICreateDaoWhitelistVoting,
  ICreateProposal,
  IDeposit,
  IWithdraw,
};

export class ClientDaoERC20Voting extends ClientCore
  implements IClientDaoBase, IClientDaoERC20Voting {
  /** DAO related methods */
  dao = {
    create: async (params: ICreateDaoERC20Voting): Promise<string> => {
      if (!this.signer)
        return Promise.reject(
          new Error("A signer is needed for creating a DAO")
        );
      const daoFactoryInstance = DAOFactory__factory.connect(
        this.daoFactoryAddress,
        this.connectedSigner
      );

      const registryInstance = await daoFactoryInstance
        .registry()
        .then(registryAddress => {
          return Registry__factory.connect(registryAddress, this.web3);
        });

      return daoFactoryInstance
        .newERC20VotingDAO(...ClientDaoERC20Voting.createDaoParameters(params))
        .then(tx => tx.wait())
        .then(cr => {
          const newDaoAddress = cr.events?.find(
            e => e.address === registryInstance.address
          )?.topics[1];
          if (!newDaoAddress)
            return Promise.reject(new Error("Could not create DAO"));

          return "0x" + newDaoAddress.slice(newDaoAddress.length - 40);
        });
    },
    /** Determines whether an action is allowed by the curren DAO's ACL settings */
    hasPermission: (
      _where: string,
      _who: string,
      _role: DaoRole,
      _data: Uint8Array
    ) => {
      // TODO: Not implemented
      return Promise.resolve();
    },

    deposit: (params: IDeposit): Promise<void> => this.deposit(params),
    currentAllowance: (
      tokenAddress: string,
      daoAddress: string
    ): Promise<bigint> => this.currentAllowance(tokenAddress, daoAddress),
    increaseAllowance: (
      tokenAddress: string,
      daoAddress: string,
      amount: bigint
    ): Promise<void> =>
      this.increaseAllowance(tokenAddress, daoAddress, amount),

    simpleVote: {
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
          .newVote(...ClientDaoERC20Voting.createProposalParameters(params))
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
    },
  };

  actions = {
    withdraw: (
      to: string,
      value: bigint,
      params: IWithdraw
    ): IProposalAction => {
      return ClientCore.createWithdrawAction(to, value, params);
    },
  };

  /** Estimation related methods */
  estimate = {
    create: async (
      params: ICreateDaoERC20Voting
    ): Promise<IGasFeeEstimation> => {
      if (!this.signer)
        return Promise.reject(
          new Error("A signer is needed for creating a DAO")
        );
      const daoFactoryInstance = DAOFactory__factory.connect(
        this.daoFactoryAddress,
        this.connectedSigner
      );

      const gasLimit = daoFactoryInstance.estimateGas.newERC20VotingDAO(
        ...ClientDaoERC20Voting.createDaoParameters(params)
      );

      return this.estimateGasFee(gasLimit);
    },
    deposit: (params: IDeposit): Promise<IGasFeeEstimation> =>
      this.estimateDeposit(params),
    increaseAllowance: (
      tokenAddress: string,
      daoAddress: string,
      amount: bigint
    ): Promise<IGasFeeEstimation> =>
      this.estimateIncreaseAllowance(tokenAddress, daoAddress, amount),
  };

  /** Helpers */

  private static createDaoParameters(
    params: ICreateDaoERC20Voting
  ): [
    DAOFactory.DAOConfigStruct,
    DAOFactory.VoteConfigStruct,
    TokenFactory.TokenConfigStruct,
    TokenFactory.MintConfigStruct,
    string
  ] {
    return [
      params.daoConfig,
      {
        participationRequiredPct: BigInt(params.votingConfig.minParticipation),
        supportRequiredPct: BigInt(params.votingConfig.minSupport),
        minDuration: BigInt(params.votingConfig.minDuration),
      },
      {
        addr: params.tokenConfig.address,
        name: params.tokenConfig.name,
        symbol: params.tokenConfig.symbol,
      },
      {
        receivers: params.mintConfig.map(receiver => receiver.address),
        amounts: params.mintConfig.map(receiver => receiver.balance),
      },
      params.gsnForwarder ?? "",
    ];
  }
}

export class ClientDaoWhitelistVoting extends ClientCore
  implements IClientDaoBase, IClientDaoWhitelistVoting {
  /** DAO related methods */
  dao = {
    create: async (params: ICreateDaoWhitelistVoting): Promise<string> => {
      if (!this.signer)
        return Promise.reject(
          new Error("A signer is needed for creating a DAO")
        );
      const daoFactoryInstance = DAOFactory__factory.connect(
        this.daoFactoryAddress,
        this.connectedSigner
      );

      const registryInstance = await daoFactoryInstance
        .registry()
        .then(registryAddress => {
          return Registry__factory.connect(registryAddress, this.web3);
        });

      return daoFactoryInstance
        .newWhitelistVotingDAO(
          ...ClientDaoWhitelistVoting.createDaoParameters(params)
        )
        .then(tx => tx.wait())
        .then(cr => {
          const newDaoAddress = cr.events?.find(
            e => e.address === registryInstance.address
          )?.topics[1];
          if (!newDaoAddress)
            return Promise.reject(new Error("Could not create DAO"));

          return "0x" + newDaoAddress.slice(newDaoAddress.length - 40);
        });
    },
    /** Determines whether an action is allowed by the curren DAO's ACL settings */
    hasPermission: (
      _where: string,
      _who: string,
      _role: DaoRole,
      _data: Uint8Array
    ) => {
      // TODO: Not implemented
      return Promise.resolve();
    },

    deposit: (params: IDeposit): Promise<void> => this.deposit(params),
    currentAllowance: (
      tokenAddress: string,
      daoAddress: string
    ): Promise<bigint> => this.currentAllowance(tokenAddress, daoAddress),
    increaseAllowance: (
      tokenAddress: string,
      daoAddress: string,
      amount: bigint
    ): Promise<void> =>
      this.increaseAllowance(tokenAddress, daoAddress, amount),

    whitelist: {
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
          .newVote(...ClientDaoWhitelistVoting.createProposalParameters(params))
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
    },
  };

  actions = {
    withdraw: (
      to: string,
      value: bigint,
      params: IWithdraw
    ): IProposalAction => {
      return ClientCore.createWithdrawAction(to, value, params);
    },
  };

  /** Estimation related methods */
  estimate = {
    create: async (
      params: ICreateDaoWhitelistVoting
    ): Promise<IGasFeeEstimation> => {
      if (!this.signer)
        return Promise.reject(
          new Error("A signer is needed for creating a DAO")
        );
      const daoFactoryInstance = DAOFactory__factory.connect(
        this.daoFactoryAddress,
        this.connectedSigner
      );

      const gasLimit = daoFactoryInstance.estimateGas.newWhitelistVotingDAO(
        ...ClientDaoWhitelistVoting.createDaoParameters(params)
      );

      return this.estimateGasFee(gasLimit);
    },
    deposit: (params: IDeposit): Promise<IGasFeeEstimation> =>
      this.estimateDeposit(params),
    increaseAllowance: (
      tokenAddress: string,
      daoAddress: string,
      amount: bigint
    ): Promise<IGasFeeEstimation> =>
      this.estimateIncreaseAllowance(tokenAddress, daoAddress, amount),
  };

  /** Helpers */

  private static createDaoParameters(
    params: ICreateDaoWhitelistVoting
  ): [
    DAOFactory.DAOConfigStruct,
    DAOFactory.VoteConfigStruct,
    string[],
    string
  ] {
    return [
      params.daoConfig,
      {
        participationRequiredPct: BigInt(params.votingConfig.minParticipation),
        supportRequiredPct: BigInt(params.votingConfig.minSupport),
        minDuration: BigInt(params.votingConfig.minDuration),
      },
      params.whitelistVoters,
      params.gsnForwarder ?? "",
    ];
  }
}
