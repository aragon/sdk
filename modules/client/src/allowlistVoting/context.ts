import { ContextPlugin, ContextPluginParams } from "../client-common";
import {
  IAllowlistVotingContextParams,
  IAllowlistVotingContextPluginState,
} from "./interfaces";

export class AllowlistVotingContextPlugin extends ContextPlugin<
  IAllowlistVotingContextPluginState
> {
  constructor(
    params: Partial<ContextPluginParams> & IAllowlistVotingContextParams
  ) {
    super(params);
    this.state.pluginAddress = params.pluginAddress;
  }

  get pluginAddress(): string {
    return this.state.pluginAddress;
  }
}
