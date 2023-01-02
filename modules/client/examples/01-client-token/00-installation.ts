/* MARKDOWN
## TokenVoting governance plugin client

This is a `Client`-like class, tailored to suit the specific use cases of the
built-in Token voting DAO Plugin.

Similarly to the above class, it provides high level methods that abstract the
underlying network requests.

### Creating a DAO with a TokenVoting plugin
*/
import {
  Client,
  TokenVotingClient,
  Context,
  DaoCreationSteps,
  GasFeeEstimation,
  ICreateParams,
  ITokenVotingPluginInstall,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

const context: Context = new Context(contextParams);
const client: Client = new Client(context);

// Define the plugins to install and their params

// Use an already existing ERC20 token
const pluginInitParams1: ITokenVotingPluginInstall = {
  settings: {
    minDuration: 60 * 60 * 24 * 2, // seconds
    minTurnout: 0.25, // 25%
    minSupport: 0.5, // 50%
  },
  useToken: {
    address: "0x...",
  },
};
// Mint a new token
const pluginInitParams2: ITokenVotingPluginInstall = {
  settings: {
    minDuration: 60 * 60 * 24, // seconds
    minTurnout: 0.4, // 40%
    minSupport: 0.55, // 55%
  },
  newToken: {
    name: "Token",
    symbol: "TOK",
    decimals: 18,
    minter: "0x...", // optionally, define a minter
    balances: [
      { // Initial balances of the new token
        address: "0x...",
        balance: BigInt(10),
      },
      {
        address: "0x...",
        balance: BigInt(10),
      },
      {
        address: "0x...",
        balance: BigInt(10),
      },
    ],
  },
};
const tokenVotingInstallPluginItem1 = TokenVotingClient.encoding.getPluginInstallItem(
  pluginInitParams1,
);
const tokenVotingInstallPluginItem2 = TokenVotingClient.encoding.getPluginInstallItem(
  pluginInitParams2,
);

const createParams: ICreateParams = {
  metadataUri: "ipfs://123456789",
  ensSubdomain: "my-org", // my-org.dao.eth
  plugins: [tokenVotingInstallPluginItem1, tokenVotingInstallPluginItem2],
};

// gas estimation
const estimatedGas: GasFeeEstimation = await client.estimation.create(
  createParams,
);
console.log(estimatedGas.average);
console.log(estimatedGas.max);

const steps = client.methods.create(createParams);
for await (const step of steps) {
  try {
    switch (step.key) {
      case DaoCreationSteps.CREATING:
        console.log(step.txHash);
        break;
      case DaoCreationSteps.DONE:
        console.log(step.address);
        break;
    }
  } catch (err) {
    console.error(err);
  }
}
