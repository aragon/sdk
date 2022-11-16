import { ContextPlugin, ContextPluginParams } from "../client-common";
import {
  IAddresslistContextParams,
  IAddresslistContextPluginState,
} from "./interfaces";

export class AddresslistContextPlugin extends ContextPlugin<
  IAddresslistContextPluginState
> {
  constructor(
    params: Partial<ContextPluginParams> & IAddresslistContextParams
  ) {
    super(params);
    this.state.pluginAddress = params.pluginAddress;
  }

  get pluginAddress(): string {
    return this.state.pluginAddress;
  }
}
