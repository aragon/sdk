/* MARKDOWN
---
title: Initialize From
---

## Upgrade a DAO to a new version

Encodes the action for upgrading the dao to a new version and passing initialization data of the new version.

### Encoding
*/

import { Client, InitializeFromParams } from "@aragon/sdk-client";
import { DaoAction } from "@aragon/sdk-client-common";
import { context } from "../index";

// Instantiates an Aragon OSx SDK client.
const client: Client = new Client(context);

// This variable contains the values received on the ininitializeFrom() method
const initializeFromParams: InitializeFromParams = {
  previousVersion: [1, 0, 0],
  initData: new Uint8Array([12, 34, 45, 85, 95, 45, 73]), // initialization data for the new version to be pased to upgradeToAndCall()
};

const daoAddressOrEns: string = "0x123123123123123123123123123123123123"; // "my-dao.eth"

const action: DaoAction = client.encoding.initializeFromAction(
  daoAddressOrEns,
  initializeFromParams,
);
console.log(action);

/* MARKDOWN
  ```json
  {
    to: "0x123123123...",
    value: 0n,
    data: Uint8Array[12,34,45...]
  }
  ```

  ### Decoding
  */

// Decodes the initialize from action.
const decodedParams: InitializeFromParams = client.decoding
  .initializeFromAction(action.data);
console.log({ decodedParams });

/* MARKDOWN
  Returns:

  ```json
  {
    previousVersion: [1, 0, 0],
    initData: Uint8Array[12,34,45...]
  }
  ```
  */
