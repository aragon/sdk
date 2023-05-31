/* MARKDOWN
---
title: Get Settings
---

## Get the Multisig Plugin Settings

Get the settings of a Multisig plugin from a specific DAO.
*/

import { MultisigClient, MultisigVotingSettings } from "@aragon/sdk-client";
import { context } from "../index";

// Insantiate a Multisig client.
const multisigClient: MultisigClient = new MultisigClient(context);

const daoAddressorEns: string = "0x12345348523485623984752394854320";

const multisigVotingSettings: MultisigVotingSettings = await multisigClient
  .methods.getVotingSettings(daoAddressorEns);
console.log(multisigVotingSettings);

/* MARKDOWN
Returns:
```json
{
  minApprovals: 4,
  onlyListed: true
}
```
*/
