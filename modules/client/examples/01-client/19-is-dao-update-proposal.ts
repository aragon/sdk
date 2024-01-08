/* MARKDOWN
---
title: Check proposal is a dao update proposal
---

### Check if a proposal contains the actions required to update a dao

Goes though a list of actions and checks that contains the necessary actions for updating a dao
*/

import { Client } from "@aragon/sdk-client";
import { context } from "../index";

// Instantiate the general purpose client from the Aragon OSx SDK context.
const client: Client = new Client(context);

// The Id of the proposal. This is the address of the governance plugin and the proposal number in hexadecimal
// you can find it at the last part of the URL to the proposal for example
// https://app.aragon.org/#/daos/polygon/0x6c30c1a36ac486456932b2f106053c42443514b2/governance/proposals/0x0cff359a7455de5bb50aa0567517536d3dfe002d_0x10
const proposalId = "0x0cff359a7455de5bb50aa0567517536d3dfe002d_0x11";

// check if a plugin update proposal is valid
const isValid = client.methods.isDaoUpdateProposal(proposalId);

console.log(isValid);

/* MARKDOWN
  Returns:
  ```tsx
  false
  ```
  */
