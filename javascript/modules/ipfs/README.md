Aragon JS SDK IPFS
---

@aragon/sdk-ifps provides a wrapper to send requests to an IPFS Cluster using the IPFS API. It supports standard operations as well as streamed requests. 

# Installation

Use [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/) to install
@aragon/sdk-ipfs.

```bash
npm install @aragon/sdk-ipfs
yarn add @aragon/sdk-ipfs
```

# Usage

## IPFS Client

```ts
import { IpfsClient } from "@aragon/sdk-ipfs";

const headers = {
  "X-API-KEY": "1234...",
};
const client = new IpfsClient(clusterUrl, headers);
```

# Testing

To execute library tests just run:

```bash
yarn test
```
