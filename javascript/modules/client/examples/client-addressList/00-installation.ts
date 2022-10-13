/* MARKDOWN
## Address List governance plugin client
### Creating a DAO with a addressList plugin
*/
import {
  Client,
  ClientAddressList,
  Context,
  DaoCreationSteps,
  GasFeeEstimation,
  IAddressListPluginInstall,
  ICreateParams,
} from "@aragon/sdk-client";
import { contextParams } from "../context";

const context: Context = new Context(contextParams);
const client: Client = new Client(context);

// Define the plugins to install and their params

const pluginInitParams: IAddressListPluginInstall = {
  settings: {
    minDuration: 60 * 60 * 24, // seconds
    minTurnout: 0.25, // 25%
    minSupport: 0.5, // 50%
  },
  addresses: [
    "0x1234567890123456789012345678901234567890",
    "0x2345678901234567890123456789012345678901",
    "0x3456789012345678901234567890123456789012",
    "0x4567890123456789012345678901234567890123",
  ],
};

const addressListInstallPluginItem = ClientAddressList.encoding
  .getPluginInstallItem(pluginInitParams);

const createParams: ICreateParams = {
  metadata: {
    name: "My DAO",
    description: "This is a description",
    avatar: "",
    links: [{
      name: "Web site",
      url: "https://...",
    }],
  },
  ensSubdomain: "my-org", // my-org.dao.eth
  plugins: [addressListInstallPluginItem],
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