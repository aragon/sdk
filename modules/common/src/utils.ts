import { Interface } from '@ethersproject/abi';
import { Zero } from '@ethersproject/constants';

export function isProposalId(propoosalId: string): boolean {
  const regex = new RegExp(/^0x[A-Fa-f0-9]{40}_0x[A-Fa-f0-9]{1,64}$/i);
  return regex.test(propoosalId);
}
export function getInterfaceId(iface: Interface): string {
  let interfaceId = Zero;
  const functions: string[] = Object.keys(iface.functions);
  for (let i = 0; i < functions.length; i++) {
    interfaceId = interfaceId.xor(iface.getSighash(functions[i]));
  }
  return interfaceId.toHexString();
}
