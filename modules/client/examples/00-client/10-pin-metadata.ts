/* MARKDOWN
### Add and pin metadata for a DAO within IPFS

Adds a pin data with the format used by Aragon App into one of the specified IPFS nodes and return an IPFS CID preceded by "ipfs://".

*/
import { Client, Context, IMetadata } from "@aragon/sdk-client";
import { contextParams } from "./00-context";

const context = new Context(contextParams);
const client = new Client(context);

// The Metadata object you want to pin for a DAO.
const metadata: IMetadata = {
  name: "My DAO",
  description: "This is a description",
  avatar: "",
  links: [{
    name: "Web site",
    url: "https://..."
  }]
};

// Pin the metadata in IPFS.
const metadataUri = await client.methods.pinMetadata(metadata);
console.log({ metadataUri });

/*
Returns:
```javascript
  "ipfs://Qm..."
```
*/
