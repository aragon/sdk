import { Signer } from "@ethersproject/abstract-signer";

export async function resolveEns(
  signer: Signer,
  ensDomain: string,
): Promise<string> {
  const resolvedAddress = await signer.resolveName(
    ensDomain,
  );
  if (!resolvedAddress) {
    throw new Error("invalid ens");
  }
  return resolvedAddress;
}
