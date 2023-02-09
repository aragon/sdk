/* MARKDOWN
### Create an AddresslistVoting client

Creating an AddresslistVoting client allows you to access the AddresslistVoting plugin functionality.
*/

import { AddresslistVotingClient, ContextPlugin } from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Instantiate a plugin context from the aragonOSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);

// Instantiate an AddresslistVoting client from the aragonOSx SDK context.
const addresslistVotingClient = new AddresslistVotingClient(contextPlugin);

console.log({ addresslistVotingClient });
