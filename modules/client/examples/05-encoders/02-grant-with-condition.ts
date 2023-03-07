/* MARKDOWN
---
title: Grant Conditional Permission
---

## Grant a Conditional Permission

Grants a permission to an address depending on whether a specific condition is met.
*/

import {
  Client,
  ContextPlugin,
  DaoAction,
  GrantPermissionWithConditionParams,
  Permissions
} from "@aragon/sdk-client";
import { context } from '../index';

// Initializes a plugin context from the Aragon SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Initializes a general purpose client from the Aragon SDK context.
const client: Client = new Client(contextPlugin);

const grantWithConditionParams: GrantPermissionWithConditionParams = {
  who: "0x1234567890123456789012345678901234567890", // address to which the permission will be granted
  where: "0x2345678901234567890123456789012345678901", // where the permission is granted
  permission: Permissions.EXECUTE_PERMISSION, // the permission to grant. alternatively: UPGRADE_PERMISSION, SET_METADATA_PERMISSION, WITHDRAW_PERMISSION, SET_SIGNATURE_VALIDATOR, SET_TRUSTED_FORWARDER_PERMISSION, ROOT_PERMISSION, CREATE_VERSION_PERMISSION, REGISTER_DAO_PERMISSION, REGISTER_PERMISSION, REGISTER_ENS_SUBDOMAIN_PERMISSION, MINT_PERMISSION, MERKLE_MINT_PERMISSION, MODIFY_ALLOWLIST_PERMISSION, SET_CONFIGURATION_PERMISSION
  condition: "0x3456789012345678901234567890123456789012" // the contract address of the condition which needs to be met in order for the permission to be granted
};

const daoAddressOrEns: string = "0x123123123123123123123123123123123123"; // "my-dao" for my-dao.dao.eth address

const grantWithConditionAction: DaoAction = client.encoding.grantWithConditionAction(
  daoAddressOrEns,
  grantWithConditionParams
);
console.log({ grantWithConditionAction });

/* MARKDOWN
Returns:

```json
  {
    to: "0x123123123...",
    value: 0n,
    data: Uint8Array[12,34,45...]
  }
```
*/
