/* MARKDOWN
### Freeze permission

Freezes a permission to a given address (`where`) to perform an action (`permission`).
*/

import {
  Client,
  Context,
  IFreezePermissionParams,
  Permissions,
} from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Instantiates a general purpose Client from the aragonOSx SDK context.
const client: Client = new Client(context);

const freezeParams: IFreezePermissionParams = {
  where: "0x1234567890123456789012345678901234567890",
  permission: Permissions.UPGRADE_PERMISSION // other options: SET_METADATA_PERMISSION, EXECUTE_PERMISSION, WITHDRAW_PERMISSION, SET_SIGNATURE_VALIDATOR_PERMISSION, SET_TRUSTED_FORWARDER_PERMISSION, ROOT_PERMISSION, CREATE_VERSION_PERMISSION, REGISTER_PERMISSION, REGISTER_DAO_PERMISSION, REGISTER_ENS_SUBDOMAIN_PERMISSION, MINT_PERMISSION, MERKLE_MINT_PERMISSION, MODIFY_ALLOWLIST_PERMISSION, SET_CONFIGURATION_PERMISSION
};

const daoAddress = "0x1234567890123456789012345678901234567890";

const freezeAction = await client.encoding.freezeAction(daoAddress, freezeParams);
console.log({ freezeAction });

/* MARKDOWN
Returns:

```json
{
  to: "0x1234567890...",
  value: 0n,
  data: Uint8Array[12,34,45...]
}
```
*/
