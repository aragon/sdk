import { ClientCore } from "./internal/client-core";
import {
  DaoConfig,
  DaoRole,
  IClientDaoBase,
  IClientDaoSimpleVote,
  IClientDaoWhitelist,
  MintConfig,
  TokenConfig,
  VotingConfig,
} from "./internal/interfaces/dao";
import {
  DAOFactory,
  DAOFactory__factory,
  Registry__factory,
  TokenFactory
} from "@aragon/core-contracts-ethers";
import { Context } from "./context";
import { BigNumberish } from "@ethersproject/bignumber";

export class ClientDaoWhitelist extends ClientCore
  implements IClientDaoBase, IClientDaoWhitelist {

  private _daoFactoryAddress = "";

  constructor(context: Context) {
    super(context);

    if (context.daoFactoryAddress) {
      this._daoFactoryAddress = context.daoFactoryAddress;
    }
  }

  /** DAO related methods */
  dao = {
    create: async (
      _daoConfig: DAOFactory.DAOConfigStruct,
      _tokenConfig: TokenFactory.TokenConfigStruct,
      _mintConfig: TokenFactory.MintConfigStruct,
      _votingConfig: [BigNumberish, BigNumberish, BigNumberish],
      _gsnForwarder?: string,
    ): Promise<string> => {
      // TODO: This is an ethers.js integration example
      // const instance = this.attachContractExample(
      //   "0x1234567890123456789012345678901234567890"
      // );
      // const tx = await instance.store("0x1234");
      // await tx.wait();

      if(!this.signer) throw new Error("A signer is needed for creating a DAO");
      const daoFactoryContract = DAOFactory__factory.connect(this._daoFactoryAddress, this.signer.connect(this.web3));

      const registry = await daoFactoryContract.registry()
        .then(registryAddress => {
          return Registry__factory.connect(registryAddress, this.web3)
        });

      let daoAddress = ''
      registry.on("NewDAORegistered", (dao: string) => {
        daoAddress = dao;
      })

      return daoFactoryContract.newDAO(
          _daoConfig, _tokenConfig, _mintConfig, _votingConfig, _gsnForwarder ?? ''
      )
        .then(tx => tx.wait())
        .then(() => daoAddress);
    },
    /** Determines whether an action is allowed by the curren DAO's ACL settings */
    hasPermission: (
      _where: string,
      _who: string,
      _role: DaoRole,
      _data: Uint8Array,
    ) => {
      // TODO: Not implemented
      return Promise.resolve();
    },

    whitelist: {
      createProposal: (
        _startDate: number,
        _endDate: number,
        _executeApproved?: boolean,
        _voteOnCreation?: boolean,
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
        _config: VotingConfig,
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

export class ClientDaoSimpleVote extends ClientCore
  implements IClientDaoBase, IClientDaoSimpleVote {
  /** DAO related methods */
  dao = {
    create: async (
      _daoConfig: DaoConfig,
      _tokenConfig: TokenConfig,
      _mintConfig: MintConfig,
      _votingConfig: VotingConfig,
      _gsnForwarder?: string,
    ): Promise<string> => {
      // TODO: This is an ethers.js integration example
      // const instance = this.attachContractExample(
      //   "0x1234567890123456789012345678901234567890"
      // );
      // const tx = await instance.store("0x1234");
      // await tx.wait();

      // TODO: Not implemented
      return Promise.resolve("0x1234567890123456789012345678901234567890");
    },
    /** Determines whether an action is allowed by the curren DAO's ACL settings */
    hasPermission: (
      _where: string,
      _who: string,
      _role: DaoRole,
      _data: Uint8Array,
    ) => {
      // TODO: Not implemented
      return Promise.resolve();
    },

    simpleVote: {
      createProposal: (
        _startDate: number,
        _endDate: number,
        _executeApproved?: boolean,
        _voteOnCreation?: boolean,
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
        _config: VotingConfig,
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
