/* MARKDOWN
---
title: Addresslist Voting
---

## Actions of the Addresslist Voting Plugin

With an instance of the `AddresslistVotingClient`
*/

import { AddresslistVotingClient, ContextPlugin } from "@aragon/sdk-client";
import { context } from "../../index";

// Instantiate a plugin context from the Aragon OSx SDK context
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);
// Instantiates an AddresslistVoting client.
export const addresslistVotingClient = new AddresslistVotingClient(
  contextPlugin,
);

/* MARKDOWN
actions can encoded and decoded as demonstrated in the following examples.
*/
