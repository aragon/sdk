/* MARKDOWN
### Loading DAO financial data

Handles retrieving DAO asset balances using the DAO address or its ENS domain.
*/
import { AssetBalance, Client, Context } from "@aragon/sdk-client";
import { contextParams } from "./00-context";

const context: Context = new Context(contextParams);
const client: Client = new Client(context);
const daoAddressOrEns = "0x12345...";
const balances: AssetBalance[] | null = await client.methods.getDaoBalances({
  daoAddressOrEns: daoAddressOrEns,
});
console.log(balances);
/*
  [
    {
      type: "native",
      balance: 100000n,
      lastUpdate: <Date>
    },
    {
      type: "erc20",
      address: "0x1234567890123456789012345678901234567890"
      name: "The Token",
      symbol: "TOK",
      decimals: 18,
      balance: 200000n
      lastUpdate: <Date>
    },
    ...
  ]
*/
