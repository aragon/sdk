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

// define a custom context with default values
const context = new CustomContext();

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
