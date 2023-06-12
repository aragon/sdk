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

// define a custom context with default values
const context = new MyContext();

// call extended client functions
console.log(context.daoFactoryAddress)
console.log(context.ensRegistryAddress)
// ...

/* MARKDOWN
  Returns:
  ```tsx
  0x1234567890...
  0x2345678901...
  ```
  */
