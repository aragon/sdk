import { ClientCore } from "./internal/client-core";
import {
  DaoConfig,
  DaoRole,
  IClientDaoBase,
  IClientDaoERC20Voting,
  ICreateDaoERC20Voting,
  IClientDaoWhitelistVoting,
  ICreateDaoWhitelistVoting,
  VotingConfig,
} from "./internal/interfaces/dao";
import {
  DAOFactory__factory,
  Registry__factory,
} from "@aragon/core-contracts-ethers";
import { DeferredPromise } from "@aragon/sdk-common";

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
        this.signer.connect(this.web3)
      );

      const registry = await daoFactoryInstance
        .registry()
        .then(registryAddress => {
          return Registry__factory.connect(registryAddress, this.web3);
        });

      const newDaoRegisteredAddress = new DeferredPromise<string>();
      registry.on("NewDAORegistered", (dao: string) => {
        newDaoRegisteredAddress.resolve(dao);
      });

      return daoFactoryInstance
        .newERC20VotingDAO(
          params.daoConfig,
          params.votingConfig,
          params.tokenConfig,
          params.mintConfig,
          params.gsnForwarder ?? ""
        )
        .then(tx => tx.wait())
        .then(() => newDaoRegisteredAddress);
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

  // INTERNAL WRAPPERS

  /**
   * Returns a contract instance, bound to the current Web3 gateway client
   *
   * @param contractAddress Address of the contract instance
   */
  // private attachContractExample(contractAddress: string) {
  //   return this.attachContract<ExampleContractMethods>(
  //     contractAddress,
  //     exampleContractAbi,
  //   );
  // }
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
        this.signer.connect(this.web3)
      );

      const registry = await daoFactoryInstance
        .registry()
        .then(registryAddress => {
          return Registry__factory.connect(registryAddress, this.web3);
        });

      const newDaoRegisteredAddress = new DeferredPromise<string>();
      registry.on("NewDAORegistered", (dao: string) => {
        newDaoRegisteredAddress.resolve(dao);
      });

      return daoFactoryInstance
        .newWhitelistVotingDAO(
          params.daoConfig,
          params.votingConfig,
          params.whitelistVoters,
          params.gsnForwarder ?? ""
        )
        .then(tx => tx.wait())
        .then(() => newDaoRegisteredAddress);
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

  // INTERNAL WRAPPERS

  /**
   * Returns a contract instance, bound to the current Web3 gateway client
   *
   * @param contractAddress Address of the contract instance
   */
  // private attachContractExample(contractAddress: string) {
  //   return this.attachContract<ExampleContractMethods>(
  //     contractAddress,
  //     exampleContractAbi,
  //   );
  // }
}
