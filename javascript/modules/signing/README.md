# @aragon/sdk-signing

@aragon/sdk-signing contains signing helpers for the 
[Aragon SDK library](https://github.com/aragon/sdk)

## Installation

Use [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) to install @aragon/sdk-signing.

```bash
npm install @aragon/sdk-signing
yarn add @aragon/sdk-signing
```

## Usage

#### BytesSignature

```ts
import { BytesSignature } from "@aragon/sdk-signing";
import { Wallet } from "@ethersproject/wallet";

const wallet = new Wallet(
  "8d7d56a9efa4158d232edbeaae601021eb3477ad77b5f3c720601fd74e8e04bb",
);

const body = "hello world";
const bodyBytes = new TextEncoder().encode(message);

// Signing messages

const msgSignature = await BytesSignature.signMessage(bodyBytes, wallet);
// returns '0x578ef5489a30afafc89ea1e39154140e73b9cf9d23da11e1eeb9358cd1c862382027e46da51c686ddcde3b0e6f13d82b418c691a1267b285f24f99e0669b23951b'

BytesSignature.isValidMessage(bodyBytes, msgSignature, wallet.publicKey);
// returns 'true'

BytesSignature.recoverMessagePublicKey(bodyBytes, msgSignature);
// returns '0x02cb3cabb521d84fc998b5649d6b59e27a3e27633d31cc0ca6083a00d68833d5ca'

// Signing transactions

const chainId = "production";
const txSignature = await BytesSignature.signTransaction(
  bodyBytes,
  chainId,
  wallet,
);
// returns '0xaccdc8d0537bad80fde86ddd0c28f0f4fa59f1225da4ae18ad73bfe27860d7bf0fb884f659b82a11e08f5875ca9728c07b0bfd30e7c47a8f9b3874b9e25944751c'

BytesSignature.isValidTransaction(
  bodyBytes,
  chainId,
  txSignature,
  wallet.publicKey,
);
// returns 'true'

BytesSignature.recoverTransactionPublicKey(
  bodyBytes,
  chainId,
  txSignature,
);
// returns '0x02cb3cabb521d84fc998b5649d6b59e27a3e27633d31cc0ca6083a00d68833d5ca'
```

#### JsonSignature

```ts
import { JsonSignature } from "@aragon/sdk-signing";
import { computePublicKey } from "@ethersproject/signing-key";
import { Wallet } from "@ethersproject/wallet";

const wallet = new Wallet(
  "8d7d56a9efa4158d232edbeaae601021eb3477ad77b5f3c720601fd74e8e04bb",
);
const jsonBody = { a: 1, b: "hi", c: false, d: [1, 2, 3, 4, 5, 6] };

// Signing messages

const msgSignature = await JsonSignature.signMessage(jsonBody, wallet);
// returns '0x40cd233894286b078667361b636e7e961072af579228ef8af3691cd5cdd1e5177984ceb65028a9fa8b0b8230c095cbe1b9dd244d5dee4febba67e01b34242fd41c'

JsonSignature.isValidMessage(jsonBody, msgSignature, wallet.publicKey);
// returns 'true'

JsonSignature.recoverMessagePublicKey(jsonBody, msgSignature);
// returns '0x02cb3cabb521d84fc998b5649d6b59e27a3e27633d31cc0ca6083a00d68833d5ca'

// Signing transactions

const chainId = "production";
const txSignature = await JsonSignature.signTransaction(
  jsonBody,
  chainId,
  wallet,
);
// returns '0xb37f025532f7f2efe41a89f9b037fbca02c00e3594305b9654558fc6c600594d3cabfd72acd1c0d0933756485072a77424bfe7f02f6b0472cd136dbd7ee5e9ca1c'

JsonSignature.isValidTransaction(
  jsonBody,
  chainId,
  txSignature,
  wallet.publicKey,
);
// returns 'true'

JsonSignature.recoverTransactionPublicKey(jsonBody, chainId, txSignature);
// returns '0x02cb3cabb521d84fc998b5649d6b59e27a3e27633d31cc0ca6083a00d68833d5ca'
```

#### normalizeJsonToString

```ts
import { JsonSignature } from "@aragon/sdk-signing";

JsonSignature.normalizedJsonString({ a: 1, b: 2 });
// '{"a":2,"b":1}'

JsonSignature.normalizedJsonString({ b: 1, a: 2 });
// '{"a":2,"b":1}'

const strA = JsonSignature.normalizedJsonString({
  a: 1,
  b: [{ a: 10, m: 10, z: 10 }, { b: 11, n: 11, y: 11 }, 4, 5],
});
const strB = JsonSignature.normalizedJsonString({
  b: [{ z: 10, m: 10, a: 10 }, { y: 11, n: 11, b: 11 }, 4, 5],
  a: 1,
});
// strA === strB
```

#### sortJson

```ts
import { JsonSignature } from "@aragon/sdk-signing";

JsonSignature.sort({ a: 1, b: 2 });
// {a: 1, b: 2}

JsonSignature.sort({ b: 1, a: 2 });
// {b: 1, a: 2}

const strA = JSON.stringify(
  JsonSignature.sort({
    a: 1,
    b: [{ a: 10, m: 10, z: 10 }, { b: 11, n: 11, y: 11 }, 4, 5],
  }),
);
const strB = JSON.stringify(
  JsonSignature.sort({
    b: [{ z: 10, m: 10, a: 10 }, { y: 11, n: 11, b: 11 }, 4, 5],
    a: 1,
  }),
);
// strA === strB
```

## Testing

To execute library tests just run

```bash
yarn test
```
