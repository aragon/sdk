import { ClientCore } from "./internal/client-core";
import {
  ContractInterface,
  ContractTransaction,
} from "@ethersproject/contracts";
import { DaoAction, DaoRole, IClientDao } from "./internal/interfaces";

export class ClientDao extends ClientCore implements IClientDao {
  /** DAO related methods */
  dao = {
    createDao: async (_metadata: string): Promise<string> => {
      // TODO: This is an example
      const instance = this.attachContractExample(
        "0x1234567890123456789012345678901234567890",
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
      _reference: string,
    ): Promise<void> => {
      return Promise.reject(new Error("Not implmented"));
    },
    withdraw: (
      _tokenAddress: string,
      _to: string,
      _amount: bigint,
      _reference: string,
    ): Promise<void> => {
      return Promise.reject(new Error("Not implmented"));
    },
  };

  // INTERNAL

  /**
   * Returns a contract instance, bound to the current Web3 gateway client
   *
   * @param contractAddress Address of the contract instance
   */
  private attachContractExample(contractAddress: string) {
    // TODO: Get the ABI frmo the appropriate contracts package
    const contractAbi: ContractInterface = [
      {
        "inputs": [],
        "name": "retrieve",
        "outputs": [
          {
            "internalType": "bytes",
            "name": "",
            "type": "bytes",
          },
        ],
        "stateMutability": "view",
        "type": "function",
      },
      {
        "inputs": [
          {
            "internalType": "bytes",
            "name": "_data",
            "type": "bytes",
          },
        ],
        "name": "store",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function",
      },
    ];

    type ExampleContractMethods = {
      retrieve: () => Promise<string>;
      store: (hexData: string) => Promise<ContractTransaction>;
    };

    return this.attachContract<ExampleContractMethods>(
      contractAddress,
      contractAbi,
    );
  }
}
