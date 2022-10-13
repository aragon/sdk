/* MARKDOWN
### Decode Update Metadata Raw Action

Decode an update metadata action and expect an IPFS uri containing the cid
*/
import { Client, Context, IMetadata } from "@aragon/sdk-client";
import { contextParams } from "../context";
const context: Context = new Context(contextParams);
const client: Client = new Client(context);
const data: Uint8Array = new Uint8Array([12, 56]);

const params: string = client.decoding.updateMetadataRawAction(data);

console.log(params);
/*
ipfs://Qm...
*/
