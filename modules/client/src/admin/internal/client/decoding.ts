import { ClientCore, ContextPlugin } from "../../../client-common";
import { IClientAdminDecoding } from "../../interfaces";

export class ClientAdminDecoding extends ClientCore
  implements IClientAdminDecoding {
  constructor(context: ContextPlugin) {
    super(context);
  }
}
