/* MARKDOWN
### Create a DAO

The `createADao` function allows you to create a DAO with the given parameters.
*/

import {
  Client,
  DaoCreationSteps,
  DaoMetadata,
  GasFeeEstimation,
  CreateDaoParams
} from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Instantiate the general purpose client from the aragonOSx SDK context.
const client: Client = new Client(context);

const metadata: DaoMetadata = {
  name: "My DAO",
  description: "This is a description",
  avatar: "",
  links: [{
    name: "Web site",
    url: "https://..."
  }],
};

// Through pinning the metadata in IPFS, we can get the IPFS URI. You can read more about it here: https://docs.ipfs.tech/how-to/pin-files/
const ipfsUri = await client.methods.pinMetadata(metadata);
const createParams: CreateDaoParams = {
  metadataUri: ipfsUri,
  ensSubdomain: "my-org", // my-org.dao.eth
  plugins: []
};

// Estimate how much gas the transaction will cost.
const estimatedGas: GasFeeEstimation = await client.estimation.createDao(createParams);
console.log({ avg: estimatedGas.average, maximum: estimatedGas.max });

// Create the DAO.
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
