import { gql } from "graphql-request";

export const QueryMultisigMembers = gql`
query MultisigMembers($address: ID!, $block: Block_height) {
    multisigPlugin(id: $address, block: $block){
        members {
            address
        }
    }
}
`;
