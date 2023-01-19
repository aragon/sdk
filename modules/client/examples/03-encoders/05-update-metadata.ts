/* MARKDOWN
### Update Metadata
*/
import { Client, Context, DaoMetadata } from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

const context: Context = new Context(contextParams);
const client: Client = new Client(context);

const metadataParams: DaoMetadata = {
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

const ipfsUri = await client.methods.pinMetadata(metadataParams);

const updateDaoMetadataAction = await client.encoding.updateDaoMetadataAction(
  daoAddressOrEns,
  ipfsUri,
);
console.log(updateDaoMetadataAction);
