/* MARKDOWN
### Loading DAO details

Handles retrieving DAO metadata using its address or ENS domain.

*/
import { Client, Context, DaoDetails } from "@aragon/sdk-client";
import { contextParams } from "./00-context";

const context: Context = new Context(contextParams);
const client: Client = new Client(context);
const daoAddressOrEns = "0x1234567890123456789012345678901234567890"; // test.dao.eth
const dao: DaoDetails | null = await client.methods.getDao(daoAddressOrEns);
console.log(dao);

/*
{
  address: "0x1234567890123456789012345678901234567890",
  ensDomain: "test.dao.eth",
  metadata: {
      name: "test",
      description: "this is a description",
      avatar?: "https://wbsite.com/image.jpeg",
      links: [
        {
          name: "Website",
          url: "https://website..."
        },
        {
          name: "Discord",
          url: "https://discord.com/..."
        }
      ];
  };
  creationDate: <Date>,
  plugins: [
    {
      pluginRepoAddress: token-voting.plugin.dao.eth,
      instanceAddress: "0x12345..."
    }
  ]
}
*/
