/* MARKDOWN
---
title: Extend client
---

## Extend client

Use the ClientCore class to create an extended client. Now you can add custom functions and properties to the client.

*/

import { ClientCore, ContextCore } from "../src";

// define a custom context params
type MyContextParams = {
  myParam: string;
};

// define a custom context that extends the ContextCore class
class MyContext extends ContextCore {
  public myParam: string;
  constructor(
    customContextParams?: Partial<MyContextParams>,
    context?: ContextCore,
  ) {
    super(context);
    this.myParam = customContextParams?.myParam || "default";
  }
}

// define a custom client that extends the ClientCore class
class MyClient extends ClientCore {
  protected myParam: string;
  constructor(ctx: MyContext) {
    super(ctx);
    this.myParam = ctx.myParam;
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
    return this.myParam;
  }
}

// define a custom context with default values
const context = new MyContext();
// define a custom client
const client = new MyClient(context);

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
