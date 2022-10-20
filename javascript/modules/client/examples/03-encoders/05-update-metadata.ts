/* MARKDOWN
### Update Metadata
*/
import { Client, Context, IMetadata } from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

const context: Context = new Context(contextParams);
const client: Client = new Client(context);

const metadataParams: IMetadata = {
  name: "New Name",
  description: "New description",
  avatar: "https://theavatar.com/image.jpg",
  links: [
    {
      url: "https://discord.com/...",
      name: "Discord",
    },
    {
      url: "https://twitter.com/...",
      name: "Twitter",
    },
  ],
};
const daoAddressOrEns = "0x12345";

const updateMetadataAction = await client.encoding.updateMetadataAction(
  daoAddressOrEns,
  metadataParams,
);
console.log(updateMetadataAction);
