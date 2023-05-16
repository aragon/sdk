/* MARKDOWN
---
title: Grant Conditional Permission
---

## Grant a Conditional Permission

Grants permission with the name (`permission`) to an address (`who`) to perform on a target contract (`where`) with a condition (`condition`) defined by a contract.

### Encoding
*/

import {
  Client,
  DaoAction,
  GrantPermissionWithConditionParams,
  Permissions,
} from "@aragon/sdk-client";
import { context } from "../index";

// Instantiates an Aragon OSx SDK client.
const client: Client = new Client(context);

const params: GrantPermissionWithConditionParams = {
  who: "0x1234567890123456789012345678901234567890", // address to which the permission will be granted
  where: "0x2345678901234567890123456789012345678901", // where the permission is granted
  permission: Permissions.EXECUTE_PERMISSION, // the permission to grant
  condition: "0x3456789012345678901234567890123456789012", // the contract address of the condition which needs to be met in order for the permission to be granted
};

const dao: string = "0x123123123123123123123123123123123123"; // or "my-dao" for my-dao.dao.eth address

const action: DaoAction = client.encoding.grantWithConditionAction(dao, params);
console.log({ action });

/* MARKDOWN
Returns:
```json
{ action:
  {
    to: "0x123123123...",
    value: 0n,
    data: Uint8Array[12,34,45...]
  }
}
```
*/

/* MARKDOWN
### Decoding
*/

const decodedParams: GrantPermissionWithConditionParams = client.decoding
  .grantWithConditionAction(
    action.data,
  );
console.log({ decodedParams });

/* MARKDOWN
Returns:

```
{ decodedParams:
  {
    where: "0x1234567890...",
    who: "0x2345678901...",
    permission: "UPGRADE_PERMISSION"
    condition: "0x3456789012..."
    permissionId: "0x12345..."
  }
}
```
*/
