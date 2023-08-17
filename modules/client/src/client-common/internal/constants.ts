import {
  MajorityVotingBase__factory,
  Multisig__factory,
} from "@aragon/osx-ethers";

const multisigInterface = Multisig__factory.createInterface();
const majorityVotingInterface = MajorityVotingBase__factory.createInterface();

export const FAILING_PROPOSAL_AVAILABLE_FUNCTION_SIGNATURES = [
  multisigInterface.getFunction("addAddresses").format("minimal"),
  multisigInterface.getFunction("removeAddresses").format("minimal"),
  multisigInterface.getFunction("updateMultisigSettings").format("minimal"),
  majorityVotingInterface.getFunction("updateVotingSettings").format("minimal"),
];
