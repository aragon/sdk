/* MARKDOWN
### Create an AddresslistVoting client

Creates an AddresslistVoting client allowing you to access the AddresslistVoting plugin functionality.
*/

import { AddresslistVotingClient, ContextPlugin } from "@aragon/sdk-client";
import { context } from "../00-setup/00-getting-started";

// Instantiate a plugin context from the Aragon OSx SDK context.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);

// Instantiate an AddresslistVoting client from the Aragon OSx SDK context.
const addresslistVotingClient: AddresslistVotingClient = new AddresslistVotingClient(contextPlugin);
console.log({ addresslistVotingClient });
