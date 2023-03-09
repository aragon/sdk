/* MARKDOWN
---
title: DAO Details
---

## Get the DAO details

Gets a DAO's details using its address or ENS domain.
*/

import { Client, DaoDetails } from "@aragon/sdk-client";
import { context } from "../index";

// Instantiate the general purpose client from the Aragon OSx SDK context.
const client: Client = new Client(context);

// Address or ENS of the DAO whose metadata you want to retrieve.
const daoAddressOrEns: string = "0x1234567890123456789012345678901234567890"; // test.dao.eth

// Get a DAO's details.
const dao: DaoDetails | null = await client.methods.getDao(daoAddressOrEns);
console.log({ dao });

/* MARKDOWN
Returns:

```json
{
  address: "0x1234567890123456789012345678901234567890",
  ensDomain: "test.dao.eth",
  metadata: {
    name: "test",
    description: "this is a description",
    avatar?: "https://wbsite.com/image.jpeg",
    links: [
      {
        name: "Website",
        url: "https://website..."
      },
      {
        name: "Discord",
        url: "https://discord.com/..."
      }
    ]
  },
  creationDate: <Date>,
  plugins: [
    {
      id: token-voting.plugin.dao.eth,
      instanceAddress: "0x12345..."
    }
  ]
}
```
*/
