/* MARKDOWN
### Add and pin metadata for a DAO within IPFS

Adds a pin data with the format used by Aragon App into one of the specified IPFS nodes and return an IPFS CID preceded by "ipfs://".
*/

import { Client, DaoMetadata } from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Instantiate the general purpose client from the aragonOSx SDK context.
const client = new Client(context);

// The Metadata object containing the details of the DAO.
const metadata: DaoMetadata = {
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

/* MARKDOWN
Returns:

```javascript
  "ipfs://Qm..."
```
*/
