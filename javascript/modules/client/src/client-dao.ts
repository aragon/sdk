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
  VoteOption,
  VotingConfig,
} from "./internal/interfaces/dao";
import {
  DAOFactory,
  DAOFactory__factory,
  ERC20Voting__factory,
  IDAO,
  Registry__factory,
  TokenFactory,
} from "@aragon/core-contracts-ethers";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";

export { ICreateDaoERC20Voting, ICreateDaoWhitelistVoting };

export class ClientDaoERC20Voting extends ClientCore
  implements IClientDaoBase, IClientDaoERC20Voting {
  /** DAO related methods */
  dao = {
    create: async (params: ICreateDaoERC20Voting): Promise<string> => {
      if (!this.signer)
        throw new Error("A signer is needed for creating a DAO");
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
          if (!newDaoAddress) throw new Error("Could not create DAO");

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

    simpleVote: {
      createProposal: (
        votingAddress: string,
        params: ICreateProposal
      ): Promise<BigNumber> => {
        if (!this.signer)
          throw new Error("A signer is needed for creating a DAO");
        if (!votingAddress)
          throw new Error(
            "A voting contract address is needed for creating a proposal"
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
              throw new Error("Could not find StartVote event");

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

  /** Estimation related methods */
  estimate = {
    create: async (params: ICreateDaoERC20Voting): Promise<BigNumber> => {
      if (!this.signer)
        throw new Error("A signer is needed for creating a DAO");
      const daoFactoryInstance = DAOFactory__factory.connect(
        this.daoFactoryAddress,
        this.connectedSigner
      );

      return daoFactoryInstance.estimateGas.newERC20VotingDAO(
        ...ClientDaoERC20Voting.createDaoParameters(params)
      );
    },
  };

  /** Helpers */

  private static createDaoParameters(
    params: ICreateDaoERC20Voting
  ): [
    DAOFactory.DAOConfigStruct,
    [BigNumberish, BigNumberish, BigNumberish],
    TokenFactory.TokenConfigStruct,
    TokenFactory.MintConfigStruct,
    string
  ] {
    return [
      params.daoConfig,
      [
        BigInt(params.votingConfig.minParticipation),
        BigInt(params.votingConfig.minSupport),
        BigInt(params.votingConfig.minDuration),
      ],
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

  private static createProposalParameters(
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

export class ClientDaoWhitelistVoting extends ClientCore
  implements IClientDaoBase, IClientDaoWhitelistVoting {
  /** DAO related methods */
  dao = {
    create: async (params: ICreateDaoWhitelistVoting): Promise<string> => {
      if (!this.signer)
        throw new Error("A signer is needed for creating a DAO");
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
          if (!newDaoAddress) throw new Error("Could not create DAO");

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

    whitelist: {
      createProposal: (
        _startDate: number,
        _endDate: number,
        _executeApproved?: boolean,
        _voteOnCreation?: boolean
      ): Promise<string> => {
        // TODO: Not implemented
        return Promise.resolve("0x1234567890123456789012345678901234567890");
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

  /** Estimation related methods */
  estimate = {
    create: async (params: ICreateDaoWhitelistVoting): Promise<BigNumber> => {
      if (!this.signer)
        throw new Error("A signer is needed for creating a DAO");
      const daoFactoryInstance = DAOFactory__factory.connect(
        this.daoFactoryAddress,
        this.connectedSigner
      );

      return daoFactoryInstance.estimateGas.newWhitelistVotingDAO(
        ...ClientDaoWhitelistVoting.createDaoParameters(params)
      );
    },
  };

  /** Helpers */

  private static createDaoParameters(
    params: ICreateDaoWhitelistVoting
  ): [
    DAOFactory.DAOConfigStruct,
    [BigNumberish, BigNumberish, BigNumberish],
    string[],
    string
  ] {
    return [
      params.daoConfig,
      [
        BigInt(params.votingConfig.minParticipation),
        BigInt(params.votingConfig.minSupport),
        BigInt(params.votingConfig.minDuration),
      ],
      params.whitelistVoters,
      params.gsnForwarder ?? "",
    ];
  }
}
