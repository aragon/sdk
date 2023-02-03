/* MARKDOWN
### Decode an update metadata raw action

Decode an update metadata action and expect an IPFS URI containing the CID of the metadata.
*/
import { Client, Context } from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Creates an Aragon SDK context.
const context: Context = new Context(contextParams);
// Creates an Aragon SDK client.
const client: Client = new Client(context);

const data: Uint8Array = new Uint8Array([12, 56]);

// Decodes the parameters of an update metadata raw action.
const decodedUpdateMetadata: string = client.decoding.updateDaoMetadataRawAction(data);
console.log(decodedUpdateMetadata);
/*
ipfs://Qm...
*/
