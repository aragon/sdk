/* MARKDOWN
### Create a Plugin Context

You don't need to use the `ContextPlugin` if you only want to interact general pupose functions (like creating a DAO, getting DAO details, etc).

However, whenever you want to interact with any plugin within our SDK, you will need to first instantiate the `ContextPlugin`. The `ContextPlugin` will give you access to the `Client`s for each of the plugins.
*/

import { ContextPlugin } from "@aragon/sdk-client";
import { Wallet } from "@ethersproject/wallet";
import { context, contextParams } from "./00-getting-started";

// In order to interact with the plugins, you need to create a `ContextPlugin` which will allow you to then generate the clients for any plugin you want to interact with.
export const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);

/* MARKDOWN
Update the context with new parameters if you wish to throughout your app.
```tsx
contextPlugin.set({ network: 1 });
contextPlugin.set({ signer: new Wallet("other private key") });
contextPlugin.setFull(contextParams);

console.log({ contextPlugin });
```
*/
