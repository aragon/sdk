/* MARKDOWN
### Add and pin metadata
Adds an pin data with a the format used by aragon app into one of the specified IPFS nodes and return a ipfs cid preceded by ipfs://

*/
import { Client, Context, IMetadata } from "@aragon/sdk-client";
import { contextParams } from "./00-context";

const context = new Context(contextParams);
const client = new Client(context);
const metadata: IMetadata = {
  name: "My DAO",
  description: "This is a description",
  avatar: "",
  links: [{
    name: "Web site",
    url: "https://...",
  }],
};
const metadataUri = await client.methods.pinMetadata(metadata);
console.log(metadataUri);

/*
  ipfs://Qm...
*/
