/* MARKDOWN
---
title: Client Setup
---

## Setting Up the SDK Client

Next thing you'll want to do is set up the general purpose client so you can call on the SDK functions. This client is used to interact with any DAO on the network you're connected to.

The `Client` class that can be imported via `@aragon/sdk-client` allows you to perform operations that apply to all DAOs, regardless of the plugins they use.

We also have clients for each plugin, which allow us to use the plugin-specific functions.

Clients can be stored in a singleton and inherited from there. Can also be stored in a [context hook](https://www.freecodecamp.org/news/react-context-for-beginners/) for easier use throughout your Javascript framework.
*/

import { Client } from "@aragon/sdk-client";
import { context } from "../index";

// Instantiate the general purpose client from the Aragon OSx SDK context.
const client: Client = new Client(context);
console.log(client);
