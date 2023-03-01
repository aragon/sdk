/* MARKDOWN
#### Update DAO's Metadata

Updates the metadata of a given DAO.
*/

import {
  Client,
  DaoAction,
  DaoMetadata
} from "@aragon/sdk-client";
import { context } from "../01-client/01-getting-started";

// Instantiates an Aragon OSx SDK client.
const client: Client = new Client(context);

const metadataParams: DaoMetadata = {
  name: "New Name",
  description: "New description",
  avatar: "https://theavatar.com/image.jpg",
  links: [
    {
      url: "https://discord.com/...",
      name: "Discord"
    },
    {
      url: "https://twitter.com/...",
      name: "Twitter"
    }
  ]
};

const daoAddressOrEns: string = "0x123458235832745982839878932332423"; // or my-dao.dao.eth

// Pins the metadata in IPFS and returns the IPFS URI.
const ipfsUri: string = await client.methods.pinMetadata(metadataParams);

// Update the metadata of a given DAO.
const updateDaoMetadataAction: DaoAction = await client.encoding.updateDaoMetadataAction(daoAddressOrEns, ipfsUri);
console.log({ updateDaoMetadataAction });
