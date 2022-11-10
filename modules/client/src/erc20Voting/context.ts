import { ContextPlugin, ContextPluginParams } from "../client-common";
import {
  IERC20VotingContextParams,
  IERC20VotingContextPluginState,
} from "./interfaces";

export class ERC20VotingContextPlugin extends ContextPlugin<
  IERC20VotingContextPluginState
> {
  constructor(
    params: Partial<ContextPluginParams> & IERC20VotingContextParams
  ) {
    super(params);
    this.state.pluginAddress = params.pluginAddress;
  }

  get pluginAddress(): string {
    return this.state.pluginAddress;
  }
}
