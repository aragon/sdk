// @ts-nocheck
import { mockedIPFSClient } from "../../mocks/aragon-sdk-ipfs";

import { Wallet } from "@ethersproject/wallet";
import {
  Client,
  ClientAddressList,
  Context,
  ContextParams,
  ContextPlugin,
  DaoCreationSteps,
  DaoDepositSteps,
  MultisigClient,
  ProposalCreationSteps,
  TokenVotingClient,
  VotingMode,
  //   MultisigClient,
} from "../../../src";
//
import {
  TEST_ADDRESSLIST_PLUGIN_ADDRESS,
  TEST_DAO_ADDRESS,
  TEST_MULTISIG_DAO_ADDRESS,
  TEST_MULTISIG_PLUGIN_ADDRESS,
  TEST_TOKEN_VOTING_PLUGIN_ADDRESS,
  web3endpoints,
} from "../constants";
// import { ClientAddressList, VotingMode } from "../../../dist";
// import { adfactory } from "@aragon/core-contracts-ethers";

// @ts-ignore
declare const describe, it, beforeAll, afterAll, expect;

const TEST_WALLET =
  "e9bb9aa1a1e8aac99dc785e3b9e9d8a9d2b401b94bab48a55b65feb372935acd";

const IPFS_API_KEY = process.env.IPFS_API_KEY || "";
const contextParams: ContextParams = {
  network: 5,
  signer: new Wallet(TEST_WALLET),
  daoFactoryAddress: "0x66DBb74f6cADD2486CBFf0b9DF211e3D7961eBf9",
  web3Providers: web3endpoints.working,
  ipfsNodes: [
    {
      url: process.env.IPFS_ENDPOINT || "https://ipfs.example.com/",
      headers: {
        "X-API-KEY": IPFS_API_KEY,
      },
    },
  ],
  graphqlNodes: [
    {
      url:
        "https://subgraph.satsuma-prod.com/aragon/core-goerli/version/v0.6.2-alpha/api",
    },
  ],
};
const ctx = new Context(contextParams);

describe("Proposal Creation", () => {
  it("Should create a multisig dao", async () => {
    const client = new Client(ctx);
    await client.web3.ensureOnline()
    // const multisigPlugin = MultisigClient.encoding.getPluginInstallItem({
    //   minApprovals: 1,
    //   members: ["0x51798F574f728de2Eb706dFE154f62b36446dbe1"],
    //   onlyListed: true,
    // });

    // const addresslistPlugin = ClientAddressList.encoding.getPluginInstallItem(
    //   {
    //     addresses: ["0x51798F574f728de2Eb706dFE154f62b36446dbe1"],
    //     votingSettings: {
    //       votingMode: VotingMode.STANDARD,
    //       supportThreshold: 0.5,
    //       minDuration: 3600,
    //       minParticipation: 0.5,
    //     },
    //   },
    // );

    // const tokenplugin = TokenVotingClient.encoding.getPluginInstallItem({
    //   votingSettings: {
    //     votingMode: VotingMode.STANDARD,
    //     supportThreshold: 0.5,
    //     minDuration: 3600,
    //     minParticipation: 0.5,
    //     minProposerVotingPower: 1,
    //   },
    //   newToken: {
    //     name: "TOKEN-" + Math.floor(Math.random() * 10000),
    //     symbol: "TEST",
    //     decimals: 18,
    //     balances: [
    //       {
    //         address: "0x51798F574f728de2Eb706dFE154f62b36446dbe1",
    //         balance: BigInt("5000000000000000000000"),
    //       },
    //     ],
    //   },
    // });

    // await client.web3.ensureOnline();
    // const daoParams = {
    //   metadataUri: "ipfs://QmXhJawTJ3PkoKMyF3a4D89zybAHjpcGivkb7F1NkHAjpo",
    //   ensSubdomain: "test-token-dao" + Math.floor(Math.random() * 10000),
    //   plugins: [tokenplugin],
    // };
    // try {
    //   for await (
    //     const step of client.methods.create(daoParams)
    //   ) {
    //     switch (step.key) {
    //       case DaoCreationSteps.CREATING:
    //         console.log(step);
    //         break;
    //       case DaoCreationSteps.DONE:
    //         Byteconsole.log(step);
    //         break;
    //       default:
    //         throw new Error(
    //           "Unexpected proposal creation step: " +
    //             Object.keys(step).join(", "),
    //         );
    //     }
    //   }
    // } catch (e) {
    //   console.log(e);
    // }
    const pluginctx = ContextPlugin.fromContext(ctx);
    const pluginClient = new MultisigClient(pluginctx);
    // const pluginClient = new ClientAddressList(pluginctx);
    for await (
      const step of pluginClient.methods.createProposal({
        pluginAddress: TEST_MULTISIG_PLUGIN_ADDRESS,
        metadataUri: "ipfs://QmXhJawTJ3PkoKMyF3a4D89zybAHjpcGivkb7F1NkHAjpo",
        approve: false,
        tryExecution: false
      })
    ) {
      switch (step.key) {
        case ProposalCreationSteps.CREATING:
          console.log(step);
          break;
        case ProposalCreationSteps.DONE:
          console.log(step);
          break;
        default:
          console.log("whopsie");
          break;
      }
    }
    // for await (
    //   const step of client.methods.deposit({
    //     daoAddressOrEns: TEST_DAO_ADDRESS,
    //     amount: BigInt(1),
    //   })
    // ) {
    //   switch (step.key) {
    //     case DaoDepositSteps.DEPOSITING:
    //       console.log(step);
    //       break;
    //     case DaoDepositSteps.DONE:
    //       console.log(step);
    //       break;
    //   }
    // }
  });
});
