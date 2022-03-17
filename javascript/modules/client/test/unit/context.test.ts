import { Context } from "../../src/context";
import { ContextParams } from "../../src/internal/interfaces/context";
import { Wallet } from "@ethersproject/wallet";
import { Signer } from "@ethersproject/abstract-signer";
import { JsonRpcProvider } from "@ethersproject/providers";

const TEST_WALLET = "8d7d56a9efa4158d232edbeaae601021eb3477ad77b5f3c720601fd74e8e04bb"
const web3endpoints = {
    working: [
        "https://cloudflare-eth.com/",
        "https://mainnet.infura.io/v3/94d2e8caf1bc4c4884af830d96f927ca",
    ],
    failing: ["https://bad-url-gateway.io/"],
};

describe("Context instances", () => {
    it("Should create an empty context", () => {
        const context = new Context({});

        expect(context).toBeInstanceOf(Context);
    });
    it("Should create an empty context and have default values", () => {
        const context = new Context({});

        expect(context).toBeInstanceOf(Context);
        expect(context.signer).toEqual(undefined);
        expect(context.dao).toEqual("");
        expect(context.daoFactoryAddress).toEqual("");
    });
    it("Should create a context and have the correct values", () => {
        const contextParams: ContextParams = {
            network: "mainnet",
            signer: new Wallet(TEST_WALLET),
            dao: "Dao",
            daoFactoryAddress: "0x1234",
            web3Providers: web3endpoints.working
        }
        const context = new Context(contextParams);

        expect(context).toBeInstanceOf(Context);
        expect(context.network).toEqual("mainnet");
        expect(context.signer).toBeInstanceOf(Wallet);
        expect(context.dao).toEqual("Dao");
        expect(context.daoFactoryAddress).toEqual("0x1234");
        context.web3Providers?.map(provider => expect(provider).toBeInstanceOf(JsonRpcProvider))
    });
});
