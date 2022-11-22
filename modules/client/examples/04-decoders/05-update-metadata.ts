/* MARKDOWN
### Decode Update Metadata Action

Decode an update metadata action and expect the metadata
*/
import { Client, Context, IMetadata } from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";
const context: Context = new Context(contextParams);
const client: Client = new Client(context);
const data: Uint8Array = new Uint8Array([12, 56]);

const cid: string = await client.decoding.updateMetadataAction(data);

const params = await client.methods.fetchMetadata(cid);

console.log(params);
/*
{
  "name":"New Name",
  "description":"New description",
  "avatar":"https://theavatar.com/image.jpg",
  "links":[
    {
      "url":"https://discord.com/...",
      "name":"Discord"
    },
    {
      "url":"https://twitter.com/...",
      "name":"Twitter"
    }
  ]
}
*/
