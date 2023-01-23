/* MARKDOWN
### Creating a DAO

*/
import {
  Client,
  Context,
  DaoCreationSteps,
  DaoMetadata,
  GasFeeEstimation,
  CreateDaoParams
} from "@aragon/sdk-client";
import { contextParams } from "./00-context";

const context: Context = new Context(contextParams);
const client: Client = new Client(context);
const metadata: DaoMetadata = {
  name: "My DAO",
  description: "This is a description",
  avatar: "",
  links: [{
    name: "Web site",
    url: "https://...",
  }],
};
const ipfsUri = await client.methods.pinMetadata(metadata);
const createParams: CreateDaoParams = {
  metadataUri: ipfsUri,
  ensSubdomain: "my-org", // my-org.dao.eth,
  plugins: [],
};

// gas estimation
const estimatedGas: GasFeeEstimation = await client.estimation.createDao(
  createParams,
);
console.log(estimatedGas.average);
console.log(estimatedGas.max);

const steps = client.methods.createDao(createParams);
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
