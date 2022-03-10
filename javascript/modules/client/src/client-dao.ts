import { ClientCore } from "./internal/client-core";
import { DaoAction, DaoRole, IClientDao } from "./internal/interfaces";
import { exampleContractAbi, ExampleContractMethods } from "./internal/abi/dao";

export class ClientDao extends ClientCore implements IClientDao {
  /** DAO related methods */
  dao = {
    createDao: async (_metadata: string): Promise<string> => {
      // TODO: This is an example
      const instance = this.attachContractExample(
        "0x1234567890123456789012345678901234567890"
      );
      const tx = await instance.store("0x1234");
      await tx.wait();

      return Promise.reject(new Error("Not implemented"));
    },
    grant: (_where: string, _who: string, _role: DaoRole): Promise<void> => {
      return Promise.reject(new Error("Not implmented"));
    },
    revoke: (_where: string, _who: string, _role: DaoRole): Promise<void> => {
      return Promise.reject(new Error("Not implmented"));
    },
    freeze: (_where: string, _role: DaoRole): Promise<void> => {
      return Promise.reject(new Error("Not implmented"));
    },
    isFrozen: (_where: string, _role: DaoRole): Promise<boolean> => {
      return Promise.reject(new Error("Not implmented"));
    },
    // bulk()
    setMetadata: (_metadata: string): Promise<void> => {
      return Promise.reject(new Error("Not implmented"));
    },
    execute: (_callId: string, _actions: DaoAction[]): Promise<void> => {
      return Promise.reject(new Error("Not implmented"));
    },
    deposit: (
      _tokenAddress: string,
      _amount: bigint,
      _reference: string
    ): Promise<void> => {
      return Promise.reject(new Error("Not implmented"));
    },
    withdraw: (
      _tokenAddress: string,
      _to: string,
      _amount: bigint,
      _reference: string
    ): Promise<void> => {
      return Promise.reject(new Error("Not implmented"));
    },
  };

  // INTERNAL WRAPPERS

  /**
   * Returns a contract instance, bound to the current Web3 gateway client
   *
   * @param contractAddress Address of the contract instance
   */
  private attachContractExample(contractAddress: string) {
    return this.attachContract<ExampleContractMethods>(
      contractAddress,
      exampleContractAbi
    );
  }
}
