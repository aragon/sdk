import { Signer } from "@ethersproject/abstract-signer";
import { Wallet } from "@ethersproject/wallet";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Contract, ContractInterface } from "@ethersproject/contracts";
import { EthNetworkID, UnsupportedProtocolError } from "@aragon/sdk-common"
const supportedProtocols = ["https:"];

export abstract class ClientCore {
    private _web3Endpoints: JsonRpcProvider[] = [];
    private _web3Idx = -1;
    private _signer: Signer | Wallet | undefined;

    constructor(
        network: EthNetworkID = "mainnet",
        web3Endpoints?: string | JsonRpcProvider | (string | JsonRpcProvider)[],
        signer?: Signer | Wallet,
    ) {
        if (web3Endpoints) {
            if (Array.isArray(web3Endpoints)) {
                this._web3Endpoints = web3Endpoints.map((item) => {
                    if (typeof item === "string") {
                        const url = new URL(item);
                        if (!supportedProtocols.includes(url.protocol)) {
                            throw new UnsupportedProtocolError(url.protocol);
                        }
                        return ClientCore.fromUri(url, network);
                    }
                    return item;
                });
            } else if (typeof web3Endpoints === "string") {
                const url = new URL(web3Endpoints);
                if (!supportedProtocols.includes(url.protocol)) {
                    throw new UnsupportedProtocolError(url.protocol);
                }
                this._web3Endpoints = [ClientCore.fromUri(url, network)];
            } else {
                this._web3Endpoints = [web3Endpoints];
            }
            this._web3Idx = 0;
        }

        if (signer) {
            this.useSigner(signer);
        }
    }

    /**
     * Returns a JSON RPC provider using the given Gateway URI
     *
     * @param uri
     * @param network
     */
    private static fromUri(uri: URL, network: EthNetworkID) {
        return new JsonRpcProvider(uri.href, network)
    }

    /**
     * Replaces the current signer by the given one
     *
     * @param signer
     */
    protected useSigner(signer: Signer | Wallet) {
        if (!signer) {
            throw new Error("Empty wallet or signer");
        }

        this._signer = signer;
    }

    /**
     * Starts using the next available Web3 endpoints
     */
    shiftWeb3Node() {
        if (!this._web3Endpoints.length) throw new Error("No endpoints");
        else if (this._web3Endpoints.length <= 1) {
            throw new Error("No other endpoints");
        }

        this._web3Idx = (this._web3Idx + 1) % this._web3Endpoints.length;
        return this;
    }

    get signer() {
        return this._signer;
    }

    get web3() {
        return this._web3Endpoints[this._web3Idx] || null
    }

    public async checkWeb3Status(): Promise<boolean> {
        return this.web3.getNetwork()
            .then(() => true)
            .catch(() => false)
    }

    /**
     * Use the contract instance at the given address
     *
     * @param address Contract instance address
     * @param abi The Application Binary Inteface of the contract
     * @return A contract instance attached to the given address
     */
    protected attachContract<T>(address: string, abi: ContractInterface): (Contract & T) {
        if (!address) throw new Error("Invalid contract address");
        else if (!abi) throw new Error("Invalid contract ABI");

        const contract = new Contract(address, abi, this.web3);

        if (!this.signer) return contract as (Contract & T);
        else if (this.signer instanceof Wallet) {
            return contract.connect(
                this.signer.connect(this.web3),
            ) as (Contract & T);
        }

        return contract.connect(this.signer) as (Contract & T);
    }
}
