/* MARKDOWN
## Admin governance plugin client
### Creating a DAO with an admin plugin
*/
import {
  Client,
  AdminClient,
  Context,
  DaoCreationSteps,
  GasFeeEstimation,
  ICreateParams,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

const context: Context = new Context(contextParams);
const client: Client = new Client(context);

const adminInstallPluginItem = AdminClient.encoding
  .getPluginInstallItem("0x1234567890123456789012345678901234567890");

const metadataUri = await client.methods.pinMetadata({
  name: "My DAO",
  description: "This is a description",
  avatar: "",
  links: [{
    name: "Web site",
    url: "https://...",
  }],
});

const createParams: ICreateParams = {
  metadataUri,
  ensSubdomain: "my-org", // my-org.dao.eth
  plugins: [adminInstallPluginItem],
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
