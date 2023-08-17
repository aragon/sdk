import { gql } from "graphql-request";

export const QueryMultisigVotingSettings = gql`
  query MultisigVotingSettings($address: ID!, $block: Block_height) {
    multisigPlugin(id: $address, block: $block) {
      minApprovals
      onlyListed
    }
  }
`;
