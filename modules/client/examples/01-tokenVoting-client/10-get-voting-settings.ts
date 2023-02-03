/* MARKDOWN
### Get a plugin's settings
*/
import {
  AddresslistVotingClient,
  Context,
  ContextPlugin,
  VotingSettings,
} from "@aragon/sdk-client";
import { contextParams } from "../00-client/00-context";

// Create a context from the Aragon SDK.
const context: Context = new Context(contextParams);
// Create a plugin context from the Aragon SDK.
const contextPlugin: ContextPlugin = ContextPlugin.fromContext(context);

// Create an Addresslist Client
const addresslistVotingClient: AddresslistVotingClient = new AddresslistVotingClient(contextPlugin);

const pluginAddress: string = "0x1234567890123456789012345678901234567890";

const settings: VotingSettings | null = await addresslistVotingClient.methods.getVotingSettings(pluginAddress);
console.log({ settings });

/*
Returns:
```json
  {
    minDuration: 10000,
    minParticipation: 0.25,
    supportThreshold: 0.5,
    minProposerVotingPower: BigInt("5000"),
    votingMode: "Standard"
  }
```
*/
