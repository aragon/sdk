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
  ICreateParams,
  IMetadata,
  VotingMode,
  VotingSettings,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

const context: Context = new Context(contextParams);
const client: Client = new Client(context);

// Define the plugins to install and their params

const pluginInitParams: VotingSettings = {
  votingSettings: {
    minDuration: 60 * 60 * 24 * 2, // seconds
    minParticipation: 0.25, // 25%
    supportThreshold: 0.5, // 50%
    minProposerVotingPower: BigInt("5000"), // default 0
    votingMode: VotingMode.VOTE_REPLACEMENT,
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

const daoMetadata: IMetadata = {
  name: "My DAO",
  description: "This is a description",
  avatar: "",
  links: [{
    name: "Web site",
    url: "https://...",
  }],
};

const metadataUri = await client.methods.pinMetadata(daoMetadata);

const createParams: ICreateParams = {
  metadataUri,
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
