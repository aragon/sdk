import { ClientCore } from "./internal/client-core";
import {
  DaoAction,
  DaoConfig,
  DaoRole,
  IClientDao,
  MintConfig,
  TokenConfig,
  VotingConfig,
} from "./internal/interfaces/dao";
// import { exampleContractAbi, ExampleContractMethods } from "./internal/abi/dao";

export class ClientDao extends ClientCore implements IClientDao {
  /** DAO related methods */
  dao = {
    createDao: async (
      _daoConfig: DaoConfig,
      _tokenConfig: TokenConfig,
      _mintConfig: MintConfig,
      _votingConfig: VotingConfig,
      _gsnForwarder?: string
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
    grant: (_where: string, _who: string, _role: DaoRole): Promise<void> => {
      // TODO: Not implemented
      return Promise.resolve();
    },
    grantWithOracle: (
      _where: string,
      _who: string,
      _oracle: string,
      _role: DaoRole
    ): Promise<void> => {
      // TODO: Not implemented
      return Promise.resolve();
    },
    revoke: (_where: string, _who: string, _role: DaoRole): Promise<void> => {
      // TODO: Not implemented
      return Promise.resolve();
    },
    freeze: (_where: string, _role: DaoRole): Promise<void> => {
      // TODO: Not implemented
      return Promise.resolve();
    },
    isFrozen: (_where: string, _role: DaoRole): Promise<boolean> => {
      // TODO: Not implemented
      return Promise.resolve(false);
    },
    /** Applies a set of permission mutations at once */
    bulkPermissions: (_where: string, _permissionItems: any[]) => {
      return Promise.resolve();
    },
    /** Determines whether an action is allowed by the curren DAO's ACL settings */
    hasPermission: (
      _where: string,
      _who: string,
      _role: DaoRole,
      _data: Uint8Array
    ) => {
      return Promise.resolve();
    },
    setMetadata: (_metadata: string): Promise<void> => {
      // TODO: Not implemented
      return Promise.resolve();
    },
    execute: (_callId: string, _actions: DaoAction[]): Promise<void> => {
      // TODO: Not implemented
      return Promise.resolve();
    },
    deposit: (
      _tokenAddress: string,
      _amount: bigint,
      _reference: string
    ): Promise<void> => {
      // TODO: Not implemented
      return Promise.resolve();
    },
    withdraw: (
      _tokenAddress: string,
      _to: string,
      _amount: bigint,
      _reference: string
    ): Promise<void> => {
      // TODO: Not implemented
      return Promise.resolve();
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
