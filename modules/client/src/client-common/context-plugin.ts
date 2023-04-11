import { Context } from "./context";
import {
  ContextPluginParams,
  ContextPluginState,
  ContextState,
} from "./interfaces/context";

export class ContextPlugin extends Context {
  protected state: ContextState & ContextPluginState = {} as ContextState & ContextPluginState

  // INTERNAL CONTEXT STATE

  /**
   * @param {ContextPluginParams} params The parameters for the client context
   *
   * @constructor
   */
  constructor(params: Partial<ContextPluginParams>) {
    super(params);

    this.set(params);
  }

  /**
   * Generate a plugin context from a client clontext and a plugin address
   *
   * @param {Context} ctx
   * @param {string} pluginAddress
   * @return {*}  {ContextPlugin}
   * @memberof ContextPlugin
   */
  static fromContext(ctx: Context): ContextPlugin {
    const ctxPlugin = new ContextPlugin({});
    Object.assign(ctxPlugin, ctx);
    return ctxPlugin;
  }

  set(contextParams: Partial<ContextPluginParams>) {
    super.set(contextParams);
  }

}
