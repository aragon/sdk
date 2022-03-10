import { Wallet } from "@ethersproject/wallet";
import { ClientCore } from "./client-core";
import { IResultsContract, ResultsContractMethods, ResultsContractDefinition } from "@aragon/sdk-contract-wrappers"
import { ContractInterface } from "@ethersproject/contracts";

export class Client extends ClientCore {
    /**
     * Returns a Results contract instance, bound to the current Web3 gateway client
     *
     * @param contractAddress Address of the contract instance
     */
    public async getResultsInstance(contractAddress: string): Promise<IResultsContract> {
        const contractAbi = ResultsContractDefinition.abi as ContractInterface

        if (this.signer) {
            if (this.signer instanceof Wallet) {
                return this.attachContract<ResultsContractMethods>(contractAddress, contractAbi)
                    .connect(this.signer.connect(this.web3)) as IResultsContract
            }
            // Signers' provider can't be manually set
            return this.attachContract<ResultsContractMethods>(contractAddress, contractAbi)
                .connect(this.signer) as IResultsContract
        }
        return this.attachContract<ResultsContractMethods>(contractAddress, contractAbi)
    }
}
