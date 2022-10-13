/* MARKDOWN
### Creating a DAO

*/
import {
  Client,
  Context,
  DaoCreationSteps,
  GasFeeEstimation,
  ICreateParams,
} from "@aragon/sdk-client";
import { contextParams } from "../context";

const context: Context = new Context(contextParams);
const client: Client = new Client(context);
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
  ensSubdomain: "my-org", // my-org.dao.eth,
  plugins: [],
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
