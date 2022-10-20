/* MARKDOWN
## ERC20 governance plugin client

This is a `Client`-like class, tailored to suit the specific use cases of the
built-in ERC20 voting DAO Plugin.

Similarly to the above class, it provides high level methods that abstract the
underlying network requests.

### Creating a DAO with an ERC20 plugin
*/
import {
  Client,
  ClientErc20,
  Context,
  DaoCreationSteps,
  GasFeeEstimation,
  ICreateParams,
  IErc20PluginInstall,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

const context: Context = new Context(contextParams);
const client: Client = new Client(context);

// Define the plugins to install and their params

// Use an already existing ERC20 token
const pluginInitParams1: IErc20PluginInstall = {
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
const pluginInitParams2: IErc20PluginInstall = {
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
const erc20InstallPluginItem1 = ClientErc20.encoding.getPluginInstallItem(
  pluginInitParams1,
);
const erc20InstallPluginItem2 = ClientErc20.encoding.getPluginInstallItem(
  pluginInitParams2,
);

const createParams: ICreateParams = {
  metadata: {
    name: "My DAO",
    description: "This is a description",
    avatar: "https://...",
    links: [{
      name: "Web site",
      url: "https://...",
    }],
  },
  ensSubdomain: "my-org", // my-org.dao.eth
  plugins: [erc20InstallPluginItem1, erc20InstallPluginItem2],
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
