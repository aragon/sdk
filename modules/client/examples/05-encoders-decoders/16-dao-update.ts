/* MARKDOWN
---
title: Update a DAO
---

## Generate a DAO Update action

Given a DAO address, the previous version and the new DAO Factory address, it generates the actions to update a DAO.

### Encoding
*/

import {
  Client,
  DaoUpdateDecodedParams,
  DaoUpdateParams,
} from "@aragon/sdk-client";
import {
  DaoAction,
  LIVE_CONTRACTS,
} from "@aragon/sdk-client-common";
import { context } from "../index";

// Instantiates an Aragon OSx SDK client.
const client: Client = new Client(context);

const daoUpdateParams: DaoUpdateParams = {
  previousVersion: [1, 0, 0],
  daoFactoryAddress: LIVE_CONTRACTS["1.3.0"].base.daoFactoryAddress, // if not specified it will use the latest version in the context network
  initData: new Uint8Array([12, 34, 45, 56]), // data needed to update specified, empty by default
};

const daoAddressOrEns: string = "0x123123123123123123123123123123123123"; // "my-dao.eth"

const actions: DaoAction = await client.encoding.daoUpdateAction(
  daoAddressOrEns,
  daoUpdateParams,
);
console.log(actions);

/* MARKDOWN

  ```json
{
    to: "0x123123123...",
    value: 0n,
    data: Uint8Array[12,34,45...]
},
  ```

  ### Decoding
  */

// Decodes the apply update action for a Multisig plugin.
const decodedParams: DaoUpdateDecodedParams = client.decoding
  .daoUpdateAction(actions[1].data);
console.log({ decodedParams });

/* MARKDOWN
  Returns:
  ```json
  { decodedParams:
    {
      previousVersion: [1, 0, 0],
      implementationAddress: "0x123123123...", // DAO base implementation address
      initData: Uint8Array[12,34,45...]
    }
  }
  ```
  */
