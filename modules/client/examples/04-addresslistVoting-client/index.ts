/* MARKDOWN
---
title: Addresslist Voting Client
---

## Create an Addresslist Voting Client

Creates an AddresslistVoting client allowing you to access the AddresslistVoting plugin functionality.
*/

import { AddresslistVotingClient } from "@aragon/sdk-client";
import { context } from "../index";

// Instantiate an AddresslistVoting client from the Aragon OSx SDK context.
const addresslistVotingClient: AddresslistVotingClient =
  new AddresslistVotingClient(context);
console.log(addresslistVotingClient);
