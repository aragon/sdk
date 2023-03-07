/* MARKDOWN
#### Decode Update Metadata Action

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
