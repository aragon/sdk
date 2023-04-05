/* MARKDOWN
---
title: Action Encoders & Decoders
---

## Encoding Actions

Proposals will eventually need to execute some action on behalf of the DAO, which needs to be encoded in a low-level format.

The action encoders help encoding the most typical DAO operations. The way they work is that they can only get executed once a proposal passes.

Hence, the flow is the following:
1. Encode the actions that you want to execute
2. Create a proposal with these actions in the `actions` field
3. Vote until the proposal has a majority: if the voting mode is `EARLY_EXECUTION` or until the `endDate` is achieved if the `votingMode` is  `STANDARD` or `VOTE_REPLACEMENT`
4. If the propoosal passes the required approvals and participation, execute the proposal
5. Success

## Decoding Actions

To obtain the encoded back in readable format, you can decode
After a sucessful transaction, you can de
Decodes the actions of a transaction to understand them in a human-readable format.
*/
