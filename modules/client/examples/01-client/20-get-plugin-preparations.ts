/* MARKDOWN
---
title: Get DAOs
---

## Get Existing DAOs from the DAO Registry

Gets a list of DAOs from the Aragon OSx DAO registry.
*/

import {
  Client,
  PluginPreparationListItem,
  PluginPreparationQueryParams,
  PluginPreparationSortBy,
} from "@aragon/sdk-client";
import { SortDirection } from "@aragon/sdk-client-common";
import { context } from "../index";

// Instantiate the general purpose client from the Aragon OSx SDK context.
const client: Client = new Client(context);

const params: PluginPreparationQueryParams = {
  limit: 10,
  skip: 0,
  direction: SortDirection.ASC,
  sortBy: PluginPreparationSortBy.ID,
  pluginAddress: "0x1234567890123456789012345678901234567890",
  daoAddressOrEns: "0x1234567890123456789012345678901234567890",
  pluginRepoAddress: "0x1234567890123456789012345678901234567890",
};

// Get a list of DAOs from the Aragon DAO registry.
const pluginPreparations: PluginPreparationListItem[] = await client.methods
  .getPluginPreparations(params);
console.log(pluginPreparations);

/* MARKDOWN
Returns:

```json
[
  {
    id: string,
    type: "Installation",
    creator: "0x1234567890123456789012345678901234567890",
    dao: "0x1234567890123456789012345678901234567890",
    pluginRepo: {
      id: "0x1234567890123456789012345678901234567890",
      subdomain: "multisig"
    },
    versionTag: {
      build: 1,
      release: 1
    },
    pluginAddress: "0x1234567890123456789012345678901234567890",
    permissions: [
      {
        who: "0x1234567890123456789012345678901234567890",
        where: "0x1234567890123456789012345678901234567890",
        permissionId: "0x12345678",
        condition: "0x1234567890123456789012345678901234567890"
      }
    ]
    helpers: ["0x1234567890123456789012345678901234567890"],;
    data: new Uint8Array()
  }
]
  ```
*/
