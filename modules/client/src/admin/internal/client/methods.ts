import {
  IpfsPinError,
  NoProviderError,
  NoSignerError,
} from "@aragon/sdk-common";
import {
  ClientCore,
  ContextPlugin,
  ExecuteProposalStep,
  ExecuteProposalStepValue,
  ProposalMetadata,
} from "../../../client-common";
import { ExecuteProposalParams, IClientAdminMethods } from "../../interfaces";

export class ClientAdminMethods extends ClientCore
  implements IClientAdminMethods {
  constructor(context: ContextPlugin) {
    super(context);
  }
  /**
   * Executes the given proposal if the user has
   *
   * @param {ExecuteProposalParams} params
   * @return {*}  {AsyncGenerator<ExecuteProposalStepValue>}
   * @memberof ClientAdminMethods
   */
  public async *executeProposal(
    params: ExecuteProposalParams,
  ): AsyncGenerator<ExecuteProposalStepValue> {
    const signer = this.web3.getConnectedSigner();
    if (!signer) {
      throw new NoSignerError();
    } else if (!signer.provider) {
      throw new NoProviderError();
    }
    // TODO
    // use new ethers contracts
    // @ts-ignore
    const adminContract = Admin__factory.connect(
      params.pluginAddress,
      signer,
    );
    const tx = await adminContract.execute(params.metadataUri, params.actions);
    yield {
      key: ExecuteProposalStep.EXECUTING,
      txHash: tx.hash,
    };
    await tx.wait();
    yield {
      key: ExecuteProposalStep.DONE,
    };
  }

  /**
   * Pins a metadata object into IPFS and retruns the generated hash
   *
   * @param {ProposalMetadata} params
   * @return {*}  {Promise<string>}
   * @memberof ClientAdminMethods
   */
  public async pinMetadata(
    params: ProposalMetadata,
  ): Promise<string> {
    try {
      const cid = await this.ipfs.add(JSON.stringify(params));
      await this.ipfs.pin(cid);
      return `ipfs://${cid}`;
    } catch {
      throw new IpfsPinError();
    }
  }
}
