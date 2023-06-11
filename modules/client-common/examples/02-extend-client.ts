/* MARKDOWN
---
title: Extend client
---

## Extend client

Use the ClientCore class to create an extended client. Now you can add custom functions and properties to the client.

*/

import { ClientCore, ContextCore } from "../src";

// define a custom context params
type CustomContextParams = {
  customParam: string;
};

// define a custom context that extends the ContextCore class
class CustomContext extends ContextCore {
  public customParam: string;
  constructor(
    customContextParams?: Partial<CustomContextParams>,
    context?: ContextCore,
  ) {
    super(context);
    this.customParam = customContextParams?.customParam || "default";
  }
}

// define a custom client that extends the ClientCore class
class CustomClient extends ClientCore {
  protected customParam: string;
  constructor(ctx: CustomContext) {
    super(ctx);
    this.customParam = ctx.customParam;
  }
  public async customFunction() {
    return "hello world";
  }
  public async customFunction2() {
    // Use the primitives provided by the ClientCore class
    const signer = this.web3.getConnectedSigner();
    const provider = this.web3.getProvider();
    const graphqlClient = this.graphql.getClient();
    const ipfsClient = this.ipfs.getClient();
  }
  public async customFunction3() {
    return this.customParam;
  }
}

// define a custom context with default values
const context = new CustomContext();
// define a custom client
const client = new CustomClient(context);

// call extended client functions
console.log(client.customFunction())
console.log(client.customFunction3())

/* MARKDOWN
  Returns:
  ```tsx
  hello world
  default
  ```
  */
