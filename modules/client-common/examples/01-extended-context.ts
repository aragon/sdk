/* MARKDOWN
---
title: Extended context
---

## Extended contex

Use the ContextCore class to create an extended Context for you own plugin. Now you can receive a generic base context with Web3, Subgraph and IPFS capabilities add custom parameters for your client on top.

*/

import { ContextCore } from "../src";

// define a custom context params
type MyContextParams = {
  myParam: string;
};

// define a custom context that extends the ContextCore class
export class MyContext extends ContextCore {
  public myParam: string;
  constructor(
    customContextParams?: Partial<MyContextParams>,
    context?: ContextCore,
  ) {
    super(context);
    this.myParam = customContextParams?.myParam || "default";
  }
}

// define a custom context with default values
const context = new MyContext();

// call extended client functions
console.log(context.daoFactoryAddress);
console.log(context.ensRegistryAddress);
console.log(context.myParam);
// ...

/* MARKDOWN
  Returns:
  ```tsx
  0x1234567890...
  0x2345678901...
  default
  ```
  */
