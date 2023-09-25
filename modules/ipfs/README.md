# Aragon JS SDK IPFS

@aragon/sdk-ifps provides a wrapper to send requests to an IPFS Cluster using
the IPFS API. It supports standard requests as well as streamed requests.

# Installation

Use [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) to install
@aragon/sdk-ipfs.

```bash
npm install @aragon/sdk-ipfs
yarn add @aragon/sdk-ipfs
```

# Usage

## IPFS Client

The Aragon infrastructure uses an IPFS cluster which requires authentication
based on an API key. The provided `Client` works as well on any canonical
deployment by just not providing any API key in the headers.

```ts
import { Client as IpfsClient } from "@aragon/sdk-ipfs";

const headers = {
  "X-API-KEY": "1234...",
};
const client = new IpfsClient(clusterUrl, headers);
```

## Node info

Retrieves the details of the node behind the endpoint.

```ts
const client = new IpfsClient(clusterUrl, headers);

const versionInfo = await client.nodeInfo();
console.log(versionInfo);
// {
//   id: string;
//   addresses: string[];
//   agentVersion: string;
//   protocolVersion: string;
//   protocols: string[];
//   publicKey: string;
// }
```

## IPFS add

Uploads data to the IPFS cluster and returns the hash of the newly pinned file.
The following data types are supported:

### As a `string` _(preferred)_

```ts
const client = new IpfsClient(clusterUrl, headers);

const content = "I am a test";
const { hash } = await client.add(content);
console.log(hash);
// QmeJ4kRW21RRgjywi9ydvY44kfx71x2WbRq7ik5xh5zBZK
```

### `Uint8Array` _(preferred)_

```ts
const client = new IpfsClient(clusterUrl, headers);

const content = Uint8Array([73, 32, 97, 109, 32, 97, 32, 116, 101, 115, 116]);
const { hash } = await client.add(content);
console.log(hash);
// QmeJ4kRW21RRgjywi9ydvY44kfx71x2WbRq7ik5xh5zBZK
```

### `File` _(browser-only)_

```ts
const client = new IpfsClient(clusterUrl, headers);

const content = new File(["I am a test"], "test.txt", { type: "text/plain" });
const { hash } = await client.add(content);
console.log(hash);
// QmeJ4kRW21RRgjywi9ydvY44kfx71x2WbRq7ik5xh5zBZK
```

### `Blob` _(browser-only)_

```ts
const client = new IpfsClient(clusterUrl, headers);

const content = new File(["I am a test"], { type: "text/plain" });
const { hash } = await client.add(content);
console.log(hash);
// QmeJ4kRW21RRgjywi9ydvY44kfx71x2WbRq7ik5xh5zBZK
```

## IPFS cat

Fetches the content behind the given CiD and returns it as a `Uint8Array`.

```ts
const client = new IpfsClient(clusterUrl, headers);

const cid = "QmeJ4kRW21RRgjywi9ydvY44kfx71x2WbRq7ik5xh5zBZK";
const recoveredBytes = await client.cat(cid);
console.log(recoveredBytes);
// Uint8Array(11) [
//    73, 32,  97, 109,  32,
//    97, 32, 116, 101, 115,
//   116
// ]
```

### Decoding as text
```ts
const recoveredString = new TextDecoder().decode(recoveredBytes);
console.log(recoveredString);
// I am a test
```

## IPFS pin

Requests the node to keep a local copy of the data behind the given CiD.

```ts
const client = new IpfsClient(clusterUrl, headers);

const cid = "QmeJ4kRW21RRgjywi9ydvY44kfx71x2WbRq7ik5xh5zBZK";
const { pins } = await client.pin(cid);
console.log(pins);
// ["QmeJ4kRW21RRgjywi9ydvY44kfx71x2WbRq7ik5xh5zBZK"]
```

**Note:** Using IPFS pin on the Aragon IPFS cluster may be restricted. Use IPFS add instead.

## IPFS unpin

Requests the node to keep a local copy of the data behind the given CiD.

```ts
const client = new IpfsClient(clusterUrl, headers);

const cid = "QmeJ4kRW21RRgjywi9ydvY44kfx71x2WbRq7ik5xh5zBZK";
const { pins } = await client.unpin(cid);
console.log(pins);
// ["QmeJ4kRW21RRgjywi9ydvY44kfx71x2WbRq7ik5xh5zBZK"]
```

**Note:** Using IPFS unpin on the Aragon IPFS cluster may be restricted. 

# Testing

To execute library tests just run:

```bash
yarn build
yarn test
```

## Security

If you believe you've found a security issue, we encourage you to notify us. We welcome working with you to resolve the issue promptly.

Security Contact Email: sirt@aragon.org

Please do not use the issue tracker for security issues.