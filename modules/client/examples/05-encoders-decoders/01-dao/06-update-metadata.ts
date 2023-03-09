/* MARKDOWN
---
title: Update DAO Metadata
---

## Update a DAO's Metadata

Updates the metadata of a given DAO.
*/

import {
  Client,
  DaoAction,
  DaoMetadata
} from "@aragon/sdk-client";
import { context } from "../index";

// Instantiates an Aragon OSx SDK client.
const client: Client = new Client(context);

const metadataParams: DaoMetadata = {
  name: "New Name",
  description: "New description",
  avatar: "https://theavatar.com/image.jpg",
  links: [
    {
      url: "https://discord.com/...",
      name: "Discord"
    },
    {
      url: "https://twitter.com/...",
      name: "Twitter"
    }
  ]
};

const daoAddressOrEns: string = "0x123458235832745982839878932332423"; // or my-dao.dao.eth

// Pins the metadata in IPFS and returns the IPFS URI.
const ipfsUri: string = await client.methods.pinMetadata(metadataParams);

// Update the metadata of a given DAO.
const updateDaoMetadataAction: DaoAction = await client.encoding.updateDaoMetadataAction(daoAddressOrEns, ipfsUri);
console.log({ updateDaoMetadataAction });


/* MARKDOWN
---
title: Update Metadata
---

## Decode an Update Metadata Raw Action

Decode an update metadata action and expect an IPFS URI containing the CID of the metadata.
*/

import { Client } from "@aragon/sdk-client";
import { context } from "../index";

// Insantiates an Aragon OSx SDK client.
const client: Client = new Client(context);

const data: Uint8Array = new Uint8Array([12, 56]);

// Decodes the parameters of an update metadata raw action.
const decodedUpdateMetadata: string = client.decoding.updateDaoMetadataRawAction(data);
console.log({ decodedUpdateMetadata });

/* MARKDOWN
Returns:

```
  { decodedUpdateMetadata: "ipfs://Qm..." }
```
*/

/* MARKDOWN
---
title: Update Metadata
---

## Decode Update Metadata Action

Decodes an update metadata action and expect the metadata.
*/

import { Client, DaoMetadata } from "@aragon/sdk-client";
import { context } from "../index";

// Instantiates an Aragon OSx SDK client.
const client: Client = new Client(context);

const data: Uint8Array = new Uint8Array([12, 56]);

// Decodes the update metadata action.
const updateDaoMetadataParams: DaoMetadata = await client.decoding.updateDaoMetadataAction(data);
console.log({ updateDaoMetadataParams });

/* MARKDOWN
Returns:

```json
{
  "name":"New Name",
  "description":"New description",
  "avatar":"https://theavatar.com/image.jpg",
  "links":[
    {
      "url":"https://discord.com/...",
      "name":"Discord"
    },
    {
      "url":"https://twitter.com/...",
      "name":"Twitter"
    }
  ]
}
```
*/
