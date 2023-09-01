import { Interface } from "@ethersproject/abi";
import { Zero } from "@ethersproject/constants";

export function isProposalId(propoosalId: string): boolean {
  const regex = new RegExp(/^0x[A-Fa-f0-9]{40}_0x[A-Fa-f0-9]{1,64}$/i);
  return regex.test(propoosalId);
}

export function isEnsName(name: string): boolean {
  const regex = new RegExp(/^[a-z0-9-]+\.eth$/i);
  return regex.test(name);
}

export function isIpfsUri(cid: string): boolean {
  const regex = new RegExp(
    /^ipfs:\/\/(Qm([1-9A-HJ-NP-Za-km-z]{44,}|b[A-Za-z2-7]{58,}|B[A-Z2-7]{58,}|z[1-9A-HJ-NP-Za-km-z]{48,}|F[0-9A-F]{50,}))$/i,
  );
  return regex.test(cid);
}

export function isSubdomain(name: string): boolean {
  const regex = new RegExp(/^[a-z0-9-]+$/i);
  return regex.test(name);
}

export function getInterfaceId(iface: Interface): string {
  let interfaceId = Zero;
  const functions: string[] = Object.keys(iface.functions);
  for (const func of functions) {
    interfaceId = interfaceId.xor(iface.getSighash(func));
  }
  return interfaceId.toHexString();
}
